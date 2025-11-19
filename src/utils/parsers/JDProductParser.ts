import dayjs from 'dayjs';
import type { FormData, DiscountItem } from '../../types';
import type { IProductInfoParser, ParseResult } from './types';
import { UNITS, type UnitType } from '../../constants';

interface JDProductInfo {
  price?: {
    p?: string;        // Current/final price (price)
    op?: string;       // Original price (original price)
    m?: string;        // Max/historical price (max)
    regularPrice?: string;
    finalPrice?: {
      price?: string;        // Final price after all discounts (e.g., government subsidy)
      priceContent?: string; // Description (e.g., "政府补贴价")
      up?: string;           // Discount amount
    };
  };
  wareInfoReadMap?: {
    sku_name?: string;       // Product name
    cn_brand?: string;       // Brand
    category_id?: string;    // Category
    product_id?: string;     // Product ID
    size?: string;           // Specification
    vender_id?: string;      // Vendor ID (if exists, it's a store)
    sale_attributes?: string; // JSON string of sale attributes
  };
  preference?: {
    preferencePopUp?: {
      morePreference?: Array<{
        text?: string;
        value?: string;
        preferenceType?: string;
        tag?: number;              // e.g., 3 for limit purchase
        customTag?: {
          p?: string;              // Limit purchase price
        };
      }>;
      expression?: {
        basePrice?: string;
        discountAmount?: string;
        discountDesc?: string;
        govAmount?: string;
        promotionAmount?: string;
        subtrahends?: Array<{
          preferenceAmount?: string;
          preferenceDesc?: string;      // e.g., "满1件8.5折"
          preferenceType?: string;       // e.g., "3" for quantity discount
          topDesc?: string;              // e.g., "促销"
        }>;
      };
    };
  };
  commonLimitInfo?: {
    limitText?: string;      // e.g., "仅限购买1件"
    limitNum?: string;       // Limit number
    mergeMaxBuyNum?: string; // Max buy number
  };
}

/**
 * Parser for JD.com product information JSON format
 */
export class JDProductParser implements IProductInfoParser {
  getName(): string {
    return 'JD.com JSON Parser';
  }

  canParse(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed.startsWith('{')) {
      return false;
    }

    try {
      const json = JSON.parse(trimmed);
      // Check if it has JD-specific fields
      return !!(json.wareInfoReadMap || json.price);
    } catch {
      return false;
    }
  }

  parse(jsonText: string): ParseResult {
    try {
      const json: JDProductInfo = JSON.parse(jsonText);
      const warnings: string[] = [];

      // Extract basic product information
      const { title, brand, price, originalPrice, specification, address } =
        this.extractBasicInfo(json, warnings);

      // Extract quantity, unit, and comparisonUnit (from specs first, then from title)
      let { quantity, unit, comparisonUnit } = this.extractQuantityAndUnit(specification);

      // If not found in specs, try extracting from title
      if (!quantity || !unit) {
        const titleResult = this.extractQuantityFromTitle(title);
        if (titleResult.quantity && titleResult.unit) {
          quantity = titleResult.quantity;
          unit = titleResult.unit;
          comparisonUnit = titleResult.comparisonUnit;
          // Note: We don't clean the title for JD as it's already well-formatted
        }
      }

      // If still not found, set defaults: 1件
      if (!quantity || !unit) {
        quantity = 1;
        unit = 'piece';
        comparisonUnit = 'piece';
      }

      // Extract discount information
      const discountResult = this.extractDiscounts(json, price, originalPrice);

      const formData: Partial<FormData> = {
        title,
        brand,
        price,
        originalPrice,
        specification,
        date: dayjs(),
        quantity,
        unit,
        comparisonUnit,
        source: {
          type: 'URL',
          address
        }
      };

      if (discountResult.discounts.length > 0) {
        formData.discount = discountResult.discounts;
      }

      return {
        success: true,
        data: formData,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  }

  /**
   * Extract quantity and unit from title
   * Patterns: 1L, 500ml, 200g, 1L*1, 500ml*2, etc.
   * Returns cleaned title with quantity/unit pattern removed
   * Also returns appropriate comparisonUnit
   */
  private extractQuantityFromTitle(title: string): {
    quantity?: number;
    unit?: UnitType;
    comparisonUnit?: UnitType;
    cleanedTitle: string;
  } {
    // Pattern: number + optional space + unit + optional multiplier (*number)
    // Examples: 1L, 500ml, 1L*1, 500ml*2, 200g, 200克
    const pattern = /(\d+\.?\d*)\s*(ml|l|g|kg|克|千克|斤|两|升|毫升|piece|個|个)(\*\d+)?/gi;

    let quantity: number | undefined;
    let unit: UnitType | undefined;
    let comparisonUnit: UnitType | undefined;
    let cleanedTitle = title;

    const matches = Array.from(title.matchAll(pattern));

    if (matches.length > 0) {
      // Use the last match (often the most relevant)
      const match = matches[matches.length - 1];
      const matchedQuantity = parseFloat(match[1]);
      let matchedUnit = match[2].toLowerCase();

      // Normalize Chinese units to English keys
      const unitMap: Record<string, string> = {
        '克': 'g',
        '千克': 'kg',
        '斤': 'jin',
        '两': 'liang',
        '升': 'l',
        '毫升': 'ml',
        '個': 'piece',
        '个': 'piece'
      };

      matchedUnit = unitMap[matchedUnit] || matchedUnit;

      // Validate unit is a valid UnitType
      if (UNITS.includes(matchedUnit as UnitType)) {
        quantity = matchedQuantity;
        unit = matchedUnit as UnitType;
        // Auto-set comparisonUnit: piece->piece, others->jin
        comparisonUnit = unit === 'piece' ? 'piece' : 'jin';

        // Remove the matched pattern from title
        cleanedTitle = title.replace(match[0], '').trim();
      }
    }

    return { quantity, unit, comparisonUnit, cleanedTitle };
  }

  /**
   * Extract quantity and unit from specifications
   * JD specifications are in sale_attributes JSON format
   * Also returns appropriate comparisonUnit
   */
  private extractQuantityAndUnit(specsString: string): {
    quantity?: number;
    unit?: UnitType;
    comparisonUnit?: UnitType;
  } {
    // Common field names that might contain quantity/unit info
    const quantityFields = ['净含量', '规格', '容量', '重量'];

    for (const field of quantityFields) {
      // Match pattern like "净含量: 500ml" or "规格: 200g"
      const fieldMatch = specsString.match(new RegExp(`${field}:\\s*([^\\n]+)`, 'i'));
      if (!fieldMatch) continue;

      const value = fieldMatch[1].trim();

      // Match patterns like: 500ml, 750mL, 200g, 200克, 1.5L, 1.5升
      const match = value.match(/^(\d+\.?\d*)\s*(ml|l|g|kg|克|千克|斤|两|升|毫升|piece|個|个)?$/i);
      if (match) {
        const quantity = parseFloat(match[1]);
        let unitStr = match[2]?.toLowerCase() || '';

        // Normalize Chinese units to English keys
        const unitMap: Record<string, string> = {
          '克': 'g',
          '千克': 'kg',
          '斤': 'jin',
          '两': 'liang',
          '升': 'l',
          '毫升': 'ml',
          '個': 'piece',
          '个': 'piece'
        };

        unitStr = unitMap[unitStr] || unitStr;

        // Validate unit is a valid UnitType
        const unit = UNITS.includes(unitStr as UnitType) ? (unitStr as UnitType) : undefined;

        if (quantity > 0 && unit) {
          // Auto-set comparisonUnit: piece->piece, others->jin
          const comparisonUnit: UnitType = unit === 'piece' ? 'piece' : 'jin';
          return { quantity, unit, comparisonUnit };
        }
      }
    }

    return {};
  }

  /**
   * Extract basic product information
   */
  private extractBasicInfo(json: JDProductInfo, warnings: string[]) {
    // Extract product name
    const title = json.wareInfoReadMap?.sku_name || '';
    if (!title) {
      warnings.push('Product name not found');
    }

    // Extract brand (Chinese and English)
    // Unified format: "中文名/英文名" or just "品牌名" if missing parts
    let brand = '';
    let brandCn = json.wareInfoReadMap?.cn_brand || '';
    let brandEn = '';

    if (title && brandCn) {
      // Case 1: cn_brand already contains both (e.g., "九阳（Joyoung）" or "Apple/苹果")
      // Extract Chinese and English parts
      const cnBrandSlashMatch = brandCn.match(/^([A-Za-z][A-Za-z0-9\s&]+)\/\s*([\u4e00-\u9fa5]+)/);
      const cnBrandParenMatch = brandCn.match(/^([\u4e00-\u9fa5]+)[（(]([A-Za-z][A-Za-z0-9\s&]+)[）)]/);

      if (cnBrandSlashMatch) {
        // cn_brand is "English/中文" format
        brandEn = cnBrandSlashMatch[1].trim();
        brandCn = cnBrandSlashMatch[2].trim();
      } else if (cnBrandParenMatch) {
        // cn_brand is "中文（English）" format
        brandCn = cnBrandParenMatch[1].trim();
        brandEn = cnBrandParenMatch[2].trim();
      } else {
        // Case 2: cn_brand is pure Chinese, try to extract English from title
        // Format 1: "Apple/苹果 iPhone..."
        const titleSlashMatch = title.match(/^([A-Z][A-Za-z0-9\s&]+)\/\s*[\u4e00-\u9fa5]+/);
        if (titleSlashMatch) {
          brandEn = titleSlashMatch[1].trim();
        } else {
          // Format 2: "三星（SAMSUNG）..."
          const titleParenMatch = title.match(/^[\u4e00-\u9fa5]+[（(]([A-Z][A-Za-z0-9\s&]+)[）)]/);
          if (titleParenMatch) {
            brandEn = titleParenMatch[1].trim();
          }
        }
      }
    }

    // Combine in unified format: "中文/English"
    if (brandCn && brandEn) {
      brand = `${brandCn}/${brandEn}`;
    } else if (brandCn) {
      brand = brandCn;
    } else if (brandEn) {
      brand = brandEn;
    }

    if (!brand) {
      warnings.push('Brand not found');
    }

    // Extract price with priority:
    // 1. If multiPrice exists (滿件優惠), use multiPrice.price as the discounted price
    // 2. Otherwise use finalPrice.price (government subsidy price)
    // 3. Fallback to p (regular price)
    const hasMultiPrice = json.price?.multiPrice?.price;
    const priceStr = hasMultiPrice || json.price?.finalPrice?.price || json.price?.p || json.price?.op || '';
    const price = priceStr ? parseFloat(priceStr) : undefined;
    if (!price) {
      warnings.push('Price not found');
    }

    // Extract original price:
    // 1. If multiPrice exists, use op (original price) to show full discount benefit
    //    e.g., multiPrice 17.41 vs op 21.50 shows savings of 4.09, not vs p 19.90 (only 2.49)
    // 2. If finalPrice exists, use p as the original price before government subsidy
    // 3. Otherwise use regularPrice or op
    const originalPriceStr = hasMultiPrice
      ? (json.price?.op || json.price?.p || '')
      : json.price?.finalPrice?.price
        ? (json.price?.p || json.price?.op || '')
        : (json.price?.regularPrice || json.price?.op || '');
    const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : undefined;

    // Extract specification from sale_attributes or fallback to size
    let specification = '';
    const saleAttributesStr = json.wareInfoReadMap?.sale_attributes;

    if (saleAttributesStr) {
      try {
        const saleAttributes = JSON.parse(saleAttributesStr);
        // sale_attributes format: [{"dim":1,"saleName":"外观","saleValue":"原色钛金属","sequenceNo":2},...]
        // Extract and combine all key-value pairs in "saleName: saleValue" format
        const specs = saleAttributes
          .sort((a: any, b: any) => (a.sequenceNo || 0) - (b.sequenceNo || 0))
          .map((attr: any) => {
            const name = attr.saleName || '';
            const value = attr.saleValue || '';
            return name && value ? `${name}: ${value}` : value;
          })
          .filter((value: string) => value && value.trim());

        specification = specs.join('\n');
      } catch (e) {
        // If parsing fails, fallback to size field
        specification = json.wareInfoReadMap?.size || '';
      }
    } else {
      // Fallback to size field
      specification = json.wareInfoReadMap?.size || '';
    }

    // Extract product ID to construct URL
    const productId = json.wareInfoReadMap?.product_id || '';
    const address = productId ? `https://item.jd.com/${productId}.html` : '';

    return { title, brand, price, originalPrice, specification, address };
  }

  /**
   * Determine discount owner based on vendor type
   */
  private getDiscountOwner(json: JDProductInfo): '平台' | '店舖' {
    return json.wareInfoReadMap?.vender_id ? '店舖' : '平台';
  }

  /**
   * Extract government subsidy discount (政府补贴)
   */
  private extractGovernmentSubsidy(json: JDProductInfo): DiscountItem | null {
    if (!json.price?.finalPrice?.priceContent?.includes('政府补贴')) {
      return null;
    }

    const finalPriceStr = json.price.finalPrice.price || '0';
    const finalPrice = parseFloat(finalPriceStr);
    const regularPrice = parseFloat(json.price.p || '0');

    if (finalPrice > 0 && regularPrice > 0 && finalPrice < regularPrice) {
      // Calculate discount rate: finalPrice / regularPrice
      // e.g., 53.52 / 66.90 = 0.8 → 8折
      const discountRate = finalPrice / regularPrice;
      const discountValue = parseFloat((discountRate * 10).toFixed(1));

      return {
        discountOwner: '政府',
        discountType: '折扣',
        discountValue: discountValue
      };
    }

    return null;
  }

  /**
   * Parse individual promotion pattern from preference description
   */
  private parsePromotionPattern(
    desc: string,
    discountOwner: '平台' | '店舖'
  ): DiscountItem | null {
    // Pattern: "满1享9折" or "满1件8.5折" or "满3件9折"
    const quantityDiscountMatch = desc.match(/满(\d+)(?:件|享)([\d.]+)折/);
    if (quantityDiscountMatch) {
      const quantity = quantityDiscountMatch[1];
      const discountRate = parseFloat(quantityDiscountMatch[2]);
      return {
        discountOwner,
        discountType: '滿件折',
        discountValue: `满${quantity}件${discountRate}折`
      };
    }

    // Pattern: "满800元9.5折" or "满800.01元9.5折" (auto-trim decimal like 800.01→800)
    const amountDiscountMatch = desc.match(/满([\d.]+)元([\d.]+)折/);
    if (amountDiscountMatch) {
      const rawAmount = parseFloat(amountDiscountMatch[1]);
      // Auto-trim: If amount is like 10.01, round down to 10
      const amount = Math.floor(rawAmount);
      const discountRate = parseFloat(amountDiscountMatch[2]);
      return {
        discountOwner,
        discountType: '滿折',
        discountValue: `满${amount}元${discountRate}折`
      };
    }

    // Pattern: "满1件减2" (quantity-based reduction)
    const quantityReductionMatch = desc.match(/满(\d+)件减([\d.]+)/);
    if (quantityReductionMatch) {
      const quantity = quantityReductionMatch[1];
      const reduction = parseFloat(quantityReductionMatch[2]);
      return {
        discountOwner,
        discountType: '滿件減',
        discountValue: `满${quantity}件减${reduction}`
      };
    }

    // Pattern: "满300减30" or "满300.01元减30" (auto-trim decimal like 300.01→300)
    // Note: This pattern must come AFTER the "满X件减X" pattern to avoid conflicts
    // The "元" is optional
    const thresholdReductionMatch = desc.match(/满([\d.]+)元?减([\d.]+)/);
    if (thresholdReductionMatch) {
      const rawThreshold = parseFloat(thresholdReductionMatch[1]);
      // Auto-trim: If threshold is like 10.01, round down to 10
      const threshold = Math.floor(rawThreshold);
      const reduction = parseFloat(thresholdReductionMatch[2]);
      return {
        discountOwner,
        discountType: '滿減',
        discountValue: `满${threshold}减${reduction}`
      };
    }

    // Pattern: "首购礼金\n2元" or "首购礼金 2元" (first purchase gift)
    const firstPurchaseMatch = desc.match(/首购礼金[\s\n]+(\d+\.?\d*)元?/);
    if (firstPurchaseMatch) {
      const amount = parseFloat(firstPurchaseMatch[1]);
      return {
        discountOwner,
        discountType: '首購',
        discountValue: amount
      };
    }

    return null;
  }

  /**
   * Extract promotion discounts from expression.subtrahends
   */
  private extractPromotionDiscounts(
    json: JDProductInfo,
    discountOwner: '平台' | '店舖',
    basePrice?: number
  ): DiscountItem[] {
    const discounts: DiscountItem[] = [];

    if (!json.preference?.preferencePopUp?.expression?.subtrahends) {
      return discounts;
    }

    // First pass: extract non-government discounts to calculate price after shop discounts
    let priceAfterShopDiscounts = basePrice || 0;
    const shopDiscounts: DiscountItem[] = [];

    for (const subtrahend of json.preference.preferencePopUp.expression.subtrahends) {
      if (subtrahend.preferenceDesc) {
        // Skip government subsidies in first pass
        if (subtrahend.topDesc === '补贴' || subtrahend.preferenceDesc.includes('政府补贴')) {
          continue;
        }

        const discount = this.parsePromotionPattern(subtrahend.preferenceDesc, discountOwner);
        if (discount) {
          shopDiscounts.push(discount);

          // Calculate price after this discount for proper sequencing
          if (discount.discountType === '滿件折' && typeof discount.discountValue === 'string') {
            const match = discount.discountValue.match(/满(\d+)件([\d.]+)折/);
            if (match) {
              const quantity = parseInt(match[1]);
              const rate = parseFloat(match[2]);
              // Apply discount if quantity requirement is met (assume 1 item)
              if (quantity <= 1) {
                priceAfterShopDiscounts *= (rate / 10);
              }
            }
          }
        }
      }
    }

    discounts.push(...shopDiscounts);

    // Second pass: extract government subsidies with context
    for (const subtrahend of json.preference.preferencePopUp.expression.subtrahends) {
      if (subtrahend.preferenceDesc &&
          (subtrahend.topDesc === '补贴' || subtrahend.preferenceDesc.includes('政府补贴'))) {
        const govDiscount = this.parseGovernmentSubsidyFromSubtrahend(
          subtrahend,
          priceAfterShopDiscounts
        );
        if (govDiscount) {
          discounts.push(govDiscount);
        }
      }
    }

    return discounts;
  }

  /**
   * Parse government subsidy from subtrahend with intelligent type detection
   */
  private parseGovernmentSubsidyFromSubtrahend(
    subtrahend: {
      preferenceAmount?: string;
      preferenceDesc?: string;
      preferenceType?: string;
      topDesc?: string;
    },
    priceAfterOtherDiscounts: number
  ): DiscountItem | null {
    if (!subtrahend.preferenceAmount) {
      return null;
    }

    const subsidyAmount = parseFloat(subtrahend.preferenceAmount);

    // Try to determine if government subsidy is a percentage discount or fixed amount
    if (priceAfterOtherDiscounts > 0) {
      const subsidyRatio = subsidyAmount / priceAfterOtherDiscounts;

      // Common discount percentages: 5%, 10%, 15%, 20%, 25%, 30%, etc.
      const commonPercentages = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45];
      const isLikelyPercentage = commonPercentages.some(pct =>
        Math.abs(subsidyRatio - pct) < 0.01
      );

      if (isLikelyPercentage && subsidyRatio < 0.5) {
        // It's likely a percentage discount (e.g., 8.5折 = pay 85% = 15% off)
        const discountRate = Math.round((1 - subsidyRatio) * 100) / 10;
        return {
          discountOwner: '政府',
          discountType: '折扣',
          discountValue: discountRate
        };
      }
    }

    // Default: treat as fixed amount reduction
    return {
      discountOwner: '政府',
      discountType: '立減',
      discountValue: subsidyAmount
    };
  }


  /**
   * Extract discounts from joinOrderPreference (滿件打折)
   * Example: "滿2件，總價打9折"
   * Note: When multiPrice exists, the price/originalPrice are already correctly extracted
   * from multiPrice.price and price.p, so no need to calculate originalPrice
   */
  private extractJoinOrderPreference(
    json: JDProductInfo,
    discountOwner: '平台' | '店舖',
    price: number | undefined,
    originalPrice: number | undefined
  ): { discounts: DiscountItem[]; calculatedOriginalPrice?: number } {
    const discounts: DiscountItem[] = [];

    const joinOrderPrefs = json.preference?.preferencePopUp?.joinOrderPreference;
    if (!joinOrderPrefs || joinOrderPrefs.length === 0) {
      return { discounts };
    }

    for (const pref of joinOrderPrefs) {
      if (!pref.value) continue;

      // Pattern: "滿2件，總價打9折" or "满2件，总价打9折"
      const match = pref.value.match(/满(\d+)件[，,]总价打([\d.]+)折/i);
      if (match) {
        const quantity = parseInt(match[1]);
        const discountRate = parseFloat(match[2]);
        discounts.push({
          discountOwner,
          discountType: '滿件折',
          discountValue: `满${quantity}件${discountRate}折`
        });
      }
    }

    return { discounts };
  }

  /**
   * Extract limited purchase discount from morePreference (限購優惠)
   * Example: "购买1-3件时可享受单件价￥14.90，超出数量以结算价为准"
   * Format: "3件-5.10" (3 pieces with 5.10 yuan discount per piece)
   * Calculates discount amount = originalPrice - limitedPrice
   */
  private extractLimitedPurchase(
    json: JDProductInfo,
    originalPrice: number | undefined,
    discountOwner: '平台' | '店舖'
  ): DiscountItem | null {
    const morePrefs = json.preference?.preferencePopUp?.morePreference;
    if (!morePrefs || morePrefs.length === 0) {
      return null;
    }

    // Look for tag=3 (限購 type) in morePreference
    const limitPref = morePrefs.find(pref => pref.tag === 3 && pref.text === '限购');
    if (!limitPref || !limitPref.value) {
      return null;
    }

    // Extract limited purchase price from customTag.p
    const limitedPriceStr = limitPref.customTag?.p;
    if (!limitedPriceStr) {
      return null;
    }

    const limitedPrice = parseFloat(limitedPriceStr);
    if (isNaN(limitedPrice) || limitedPrice <= 0) {
      return null;
    }

    // Extract quantity from value pattern
    // Pattern: "购买1-3件时可享受单件价￥14.90，超出数量以结算价为准"
    // or "购买至少1件时可享受单件价￥9499，超出数量以结算价为准"
    const rangeMatch = limitPref.value.match(/购买(\d+)-(\d+)件时可享受单件价￥([\d.]+)/i);
    const minMatch = limitPref.value.match(/购买至少(\d+)件时可享受单件价￥([\d.]+)/i);

    let quantity = 1;
    if (rangeMatch) {
      // Use the maximum quantity from the range (e.g., "1-3件" → 3)
      quantity = parseInt(rangeMatch[2]);
    } else if (minMatch) {
      // Use the minimum quantity (e.g., "至少1件" → 1)
      quantity = parseInt(minMatch[1]);
    }

    // Calculate discount amount per piece
    // If we have originalPrice, calculate: discountPerPiece = originalPrice - limitedPrice
    // Otherwise, we can't calculate the discount amount
    if (!originalPrice || originalPrice <= limitedPrice) {
      // Can't calculate discount without original price, or if limited price is higher
      return null;
    }

    const discountPerPiece = originalPrice - limitedPrice;

    // Format: "3件-5.10" (3 pieces with 5.10 yuan discount per piece)
    return {
      discountOwner,
      discountType: '限購',
      discountValue: `${quantity}件-${discountPerPiece.toFixed(2)}`
    };
  }

  /**
   * Extract all discount information
   * Returns both discounts and potentially calculated originalPrice
   */
  private extractDiscounts(
    json: JDProductInfo,
    price: number | undefined,
    originalPrice: number | undefined
  ): { discounts: DiscountItem[]; calculatedOriginalPrice?: number } {
    const discountInfo: DiscountItem[] = [];
    let calculatedOriginalPrice: number | undefined;

    // Determine discount owner based on vender type
    const discountOwner = this.getDiscountOwner(json);

    // Get base price from expression or use originalPrice
    const basePrice = json.preference?.preferencePopUp?.expression?.basePrice
      ? parseFloat(json.preference.preferencePopUp.expression.basePrice)
      : originalPrice;

    // 1. Extract all discounts from expression.subtrahends (includes both shop and gov discounts)
    const promotionDiscounts = this.extractPromotionDiscounts(json, discountOwner, basePrice);
    discountInfo.push(...promotionDiscounts);

    // Check if government subsidy was already extracted from subtrahends
    const hasGovernmentSubsidy = promotionDiscounts.some(d => d.discountOwner === '政府');

    // 2. Fallback: Check for government subsidy in price.finalPrice if not in subtrahends
    if (!hasGovernmentSubsidy) {
      const governmentSubsidy = this.extractGovernmentSubsidy(json);
      if (governmentSubsidy) {
        discountInfo.push(governmentSubsidy);
      }
    }

    // 3. Extract joinOrderPreference discounts (滿件打折)
    const joinOrderResult = this.extractJoinOrderPreference(json, discountOwner, price, originalPrice);
    discountInfo.push(...joinOrderResult.discounts);

    // 4. Extract limited purchase discount from morePreference (限購優惠)
    const limitedPurchase = this.extractLimitedPurchase(json, originalPrice, discountOwner);
    if (limitedPurchase) {
      discountInfo.push(limitedPurchase);
    }

    const hasPromotionDiscount = promotionDiscounts.length > 0;
    const hasJoinOrderDiscount = joinOrderResult.discounts.length > 0;
    const hasLimitedPurchase = limitedPurchase !== null;

    // 5. Only add price difference discount (立減) if no other discounts explain the price difference
    if (
      !hasGovernmentSubsidy &&
      !hasPromotionDiscount &&
      !hasJoinOrderDiscount &&
      !hasLimitedPurchase &&
      price &&
      originalPrice &&
      price < originalPrice
    ) {
      const discountAmount = originalPrice - price;
      discountInfo.push({
        discountOwner: discountOwner,
        discountType: '立減',
        discountValue: parseFloat(discountAmount.toFixed(2))
      });
    }

    return { discounts: discountInfo, calculatedOriginalPrice };
  }
}
