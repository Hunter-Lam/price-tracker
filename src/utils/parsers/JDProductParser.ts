import dayjs from 'dayjs';
import type { FormData, DiscountItem } from '../../types';
import type { IProductInfoParser, ParseResult } from './types';

interface JDProductInfo {
  price?: {
    p?: string;        // Final price
    op?: string;       // Original price
    m?: string;        // Market price
  };
  wareInfoReadMap?: {
    sku_name?: string;       // Product name
    cn_brand?: string;       // Brand
    category_id?: string;    // Category
    product_id?: string;     // Product ID
    size?: string;           // Specification
  };
  preference?: {
    preferencePopUp?: {
      morePreference?: Array<{
        text?: string;
        value?: string;
        preferenceType?: string;
      }>;
    };
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

      // Extract price (final price paid)
      const priceStr = json.price?.p || json.price?.op || '';
      const price = priceStr ? parseFloat(priceStr) : undefined;
      if (!price) {
        warnings.push('Price not found');
      }

      // Extract original price
      const originalPriceStr = json.price?.m || json.price?.op || '';
      const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : undefined;

      // Extract specification
      const specification = json.wareInfoReadMap?.size || '';

      // Extract product ID to construct URL
      const productId = json.wareInfoReadMap?.product_id || '';
      const address = productId ? `https://item.jd.com/${productId}.html` : '';

      // Extract discount information
      const discountInfo: DiscountItem[] = [];

      if (json.preference?.preferencePopUp?.morePreference) {
        for (const pref of json.preference.preferencePopUp.morePreference) {
          if (pref.text && pref.value) {
            if (pref.text.includes('限购') || pref.preferenceType === '2') {
              const priceMatch = pref.value.match(/￥([\d.]+)/);
              if (priceMatch && price) {
                const limitPrice = parseFloat(priceMatch[1]);
                const discountAmount = originalPrice ? originalPrice - limitPrice : 0;
                if (discountAmount > 0) {
                  discountInfo.push({
                    discountOwner: '平台' as const,
                    discountType: '立減' as const,
                    discountValue: parseFloat(discountAmount.toFixed(2))
                  });
                }
              }
            }
          }
        }
      }

      // Calculate discount if we have both prices but no explicit discount info
      if (price && originalPrice && price < originalPrice && discountInfo.length === 0) {
        const discountAmount = originalPrice - price;
        discountInfo.push({
          discountOwner: '平台' as const,
          discountType: '立減' as const,
          discountValue: parseFloat(discountAmount.toFixed(2))
        });
      }

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
}
