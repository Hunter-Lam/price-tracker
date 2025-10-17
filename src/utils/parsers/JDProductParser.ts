import dayjs from 'dayjs';
import type { FormData, DiscountItem } from '../../types';
import type { IProductInfoParser, ParseResult } from './types';

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
  };
  preference?: {
    preferencePopUp?: {
      morePreference?: Array<{
        text?: string;
        value?: string;
        preferenceType?: string;
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

      // Extract discount information
      const discountInfo = this.extractDiscounts(json, price, originalPrice);

      const formData: Partial<FormData> = {
        title,
        brand,
        price,
        originalPrice,
        specification,
        date: dayjs(),
        source: {
          type: 'URL',
          address
        }
      };

      if (discountInfo.length > 0) {
        formData.discount = discountInfo;
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
   * Extract basic product information
   */
  private extractBasicInfo(json: JDProductInfo, warnings: string[]) {
    // Extract product name
    const title = json.wareInfoReadMap?.sku_name || '';
    if (!title) {
      warnings.push('Product name not found');
    }

    // Extract brand
    const brand = json.wareInfoReadMap?.cn_brand || '';
    if (!brand) {
      warnings.push('Brand not found');
    }

    // Extract price (use finalPrice.price if available, otherwise use p)
    const priceStr = json.price?.finalPrice?.price || json.price?.p || json.price?.op || '';
    const price = priceStr ? parseFloat(priceStr) : undefined;
    if (!price) {
      warnings.push('Price not found');
    }

    // Extract original price (regularPrice is preferred, then op, m is max price)
    // If finalPrice exists, use p as the original price before government subsidy
    const originalPriceStr = json.price?.finalPrice?.price
      ? (json.price?.p || json.price?.op || '')
      : (json.price?.regularPrice || json.price?.op || '');
    const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : undefined;

    // Extract specification
    const specification = json.wareInfoReadMap?.size || '';

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
    // Pattern: "满1件8.5折" or "满3件9折"
    const quantityDiscountMatch = desc.match(/满(\d+)件([\d.]+)折/);
    if (quantityDiscountMatch) {
      const quantity = quantityDiscountMatch[1];
      const discountRate = parseFloat(quantityDiscountMatch[2]);
      return {
        discountOwner,
        discountType: '滿件折',
        discountValue: `满${quantity}件${discountRate}折`
      };
    }

    // Pattern: "满800元9.5折"
    const amountDiscountMatch = desc.match(/满(\d+)元([\d.]+)折/);
    if (amountDiscountMatch) {
      const amount = amountDiscountMatch[1];
      const discountRate = parseFloat(amountDiscountMatch[2]);
      return {
        discountOwner,
        discountType: '滿折',
        discountValue: `满${amount}元${discountRate}折`
      };
    }

    // Pattern: "满1件减2" (quantity-based reduction)
    const quantityReductionMatch = desc.match(/满(\d+)件减(\d+)/);
    if (quantityReductionMatch) {
      const quantity = quantityReductionMatch[1];
      const reduction = quantityReductionMatch[2];
      return {
        discountOwner,
        discountType: '滿件減',
        discountValue: `满${quantity}件减${reduction}`
      };
    }

    // Pattern: "满300减30" (amount-based reduction)
    const thresholdReductionMatch = desc.match(/满(\d+)减(\d+)/);
    if (thresholdReductionMatch) {
      const threshold = thresholdReductionMatch[1];
      const reduction = thresholdReductionMatch[2];
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
    discountOwner: '平台' | '店舖'
  ): DiscountItem[] {
    const discounts: DiscountItem[] = [];

    if (!json.preference?.preferencePopUp?.expression?.subtrahends) {
      return discounts;
    }

    for (const subtrahend of json.preference.preferencePopUp.expression.subtrahends) {
      if (subtrahend.preferenceDesc) {
        const discount = this.parsePromotionPattern(subtrahend.preferenceDesc, discountOwner);
        if (discount) {
          discounts.push(discount);
        }
      }
    }

    return discounts;
  }

  /**
   * Extract limited purchase discount (限購)
   */
  private extractLimitedPurchase(
    json: JDProductInfo,
    price: number | undefined,
    originalPrice: number | undefined,
    discountOwner: '平台' | '店舖',
    hasGovernmentSubsidy: boolean,
    hasPromotionDiscount: boolean
  ): DiscountItem | null {
    // Don't add limit purchase if government subsidy or promotion discount already exists
    if (hasGovernmentSubsidy || hasPromotionDiscount) {
      return null;
    }

    if (!json.commonLimitInfo?.limitText) {
      return null;
    }

    const limitText = json.commonLimitInfo.limitText;
    // Extract limit number from text like "仅限购买1件" or "最多可购买9999件"
    const limitMatch = limitText.match(/(\d+)件/);
    if (!limitMatch) {
      return null;
    }

    const limitNum = parseInt(limitMatch[1]);

    // Only create 限購 discount for meaningful limits (< 100)
    // Values like 9999 are effectively no limit at all
    if (limitNum >= 100) {
      return null;
    }

    // If there's also a price difference, store it as "quantity-amount" format
    // e.g., "1-185.18" means limit 1 item with 185.18 discount
    let discountValue: string | number = limitNum.toString();
    if (price && originalPrice && price < originalPrice) {
      const discountAmount = parseFloat((originalPrice - price).toFixed(2));
      discountValue = `${limitNum}-${discountAmount}`;
    }

    return {
      discountOwner,
      discountType: '限購',
      discountValue: discountValue
    };
  }

  /**
   * Extract all discount information
   */
  private extractDiscounts(
    json: JDProductInfo,
    price: number | undefined,
    originalPrice: number | undefined
  ): DiscountItem[] {
    const discountInfo: DiscountItem[] = [];

    // Determine discount owner based on vender type
    const discountOwner = this.getDiscountOwner(json);

    // 1. Check for government subsidy (政府补贴) - highest priority
    const governmentSubsidy = this.extractGovernmentSubsidy(json);
    if (governmentSubsidy) {
      discountInfo.push(governmentSubsidy);
    }

    // 2. Extract promotion discounts from expression.subtrahends
    const promotionDiscounts = this.extractPromotionDiscounts(json, discountOwner);
    discountInfo.push(...promotionDiscounts);

    const hasGovernmentSubsidy = governmentSubsidy !== null;
    const hasPromotionDiscount = promotionDiscounts.length > 0;

    // 3. Check for limited purchase discount (限購)
    const limitedPurchase = this.extractLimitedPurchase(
      json,
      price,
      originalPrice,
      discountOwner,
      hasGovernmentSubsidy,
      hasPromotionDiscount
    );
    if (limitedPurchase) {
      discountInfo.push(limitedPurchase);
    }

    // 4. Only add price difference discount (立減) if no other discounts explain the price difference
    const hasLimitPurchase = limitedPurchase !== null;
    if (
      !hasLimitPurchase &&
      !hasGovernmentSubsidy &&
      !hasPromotionDiscount &&
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

    return discountInfo;
  }
}
