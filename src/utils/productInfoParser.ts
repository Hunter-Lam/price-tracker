import dayjs from 'dayjs';
import type { FormData, DiscountItem } from '../types';

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

interface ParseResult {
  success: boolean;
  data?: Partial<FormData>;
  warnings?: string[];
  error?: string;
}

/**
 * Parse JD.com product information JSON
 */
export function parseJDProductInfo(jsonText: string): ParseResult {
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
        // Parse different types of promotions
        if (pref.text && pref.value) {
          // Try to parse limit buy discount
          if (pref.text.includes('限购') || pref.preferenceType === '2') {
            const priceMatch = pref.value.match(/￥([\d.]+)/);
            if (priceMatch && price) {
              const limitPrice = parseFloat(priceMatch[1]);
              const discountAmount = originalPrice ? originalPrice - limitPrice : 0;
              if (discountAmount > 0) {
                discountInfo.push({
                  discountOwner: '平台' as const,  // Platform
                  discountType: '立減' as const,   // Instant reduction
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

    // Only add discount if we have discount info
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
 * Parse plain text product information (from copy-paste)
 * Example format:
 * 华佗牌针灸针承臻一次性针无菌针灸专用针医用中医针炙非银针
 * 券后 ¥ 16.8 起
 * 超级立减活动价 ¥ 20.8 起
 * 满300减30
 * 超级立减4元
 */
export function parsePlainTextProductInfo(text: string): ParseResult {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length === 0) {
      return {
        success: false,
        error: 'Empty input'
      };
    }

    const warnings: string[] = [];

    // First line is usually the product title
    let fullTitle = lines[0];
    let brand = '';
    let title = fullTitle;

    // Try to extract brand name from title
    // Common patterns:
    // 1. 华佗牌... -> brand: 华佗
    // 2. 品牌名 + 产品描述
    // 3. 品牌名（BRAND）产品描述

    // Pattern 1: Brand + 牌
    const brandWithPaiMatch = fullTitle.match(/^([^牌]{2,6})牌(.+)/);
    if (brandWithPaiMatch) {
      brand = brandWithPaiMatch[1];
      title = brandWithPaiMatch[2].trim();
    } else {
      // Pattern 2: Brand in parentheses like 三星（SAMSUNG）
      const brandParenMatch = fullTitle.match(/^([^（(]+)[（(]([^）)]+)[）)](.+)/);
      if (brandParenMatch) {
        brand = brandParenMatch[1].trim();
        title = (brandParenMatch[1] + brandParenMatch[3]).trim();
      } else {
        // Pattern 3: Check if first 2-6 characters before space or special char could be brand
        const potentialBrandMatch = fullTitle.match(/^([^\s，。、]{2,6})[，。、\s](.+)/);
        if (potentialBrandMatch) {
          // This is a guess - might be brand or part of title
          brand = potentialBrandMatch[1];
          title = fullTitle; // Keep full title if uncertain
        }
      }
    }

    // If no brand found, leave it empty (user can fill manually)
    if (!brand) {
      warnings.push('Brand not extracted, please fill manually');
    }

    // Extract prices
    let price: number | undefined;
    let originalPrice: number | undefined;

    // Look for price patterns: ¥ 16.8, ¥16.8,券后, 活动价, etc.
    // Also handle multi-line format where ¥ and number are on separate lines
    const pricePattern = /[¥￥]\s*(\d+\.?\d*)/g;
    const prices: number[] = [];

    console.log('Plain text parser - lines:', lines);

    // First, try to find prices in same line
    for (const line of lines) {
      let match;
      while ((match = pricePattern.exec(line)) !== null) {
        const priceValue = parseFloat(match[1]);
        console.log('Found price in line:', line, 'value:', priceValue);
        if (priceValue > 0) {
          prices.push(priceValue);
        }
      }
    }

    // If no prices found, try multi-line pattern (¥ on one line, number on next)
    if (prices.length === 0) {
      for (let i = 0; i < lines.length - 1; i++) {
        const currentLine = lines[i];
        const nextLine = lines[i + 1];

        // Check if current line has ¥ and next line is a number
        if (/[¥￥]/.test(currentLine)) {
          const numberMatch = nextLine.match(/^(\d+\.?\d*)$/);
          if (numberMatch) {
            const priceValue = parseFloat(numberMatch[1]);
            console.log('Found multi-line price: ¥ +', nextLine, 'value:', priceValue);
            if (priceValue > 0) {
              prices.push(priceValue);
            }
          }
        }
      }
    }

    console.log('All extracted prices:', prices);

    // Extract discount information
    const discountInfo: DiscountItem[] = [];

    for (const line of lines) {
      // Pattern: 满300减30
      const thresholdMatch = line.match(/满(\d+)减(\d+)/);
      if (thresholdMatch) {
        const threshold = parseInt(thresholdMatch[1]);
        const reduction = parseInt(thresholdMatch[2]);
        // Format must match what DiscountInput expects: "满300减30"
        discountInfo.push({
          discountOwner: '平台' as const,
          discountType: '滿減' as const,
          discountValue: `满${threshold}减${reduction}`
        });
      }

      // Pattern: 超级立减4元, 立减4元
      const instantMatch = line.match(/立减(\d+\.?\d*)元?/i);
      if (instantMatch) {
        const reduction = parseFloat(instantMatch[1]);
        // For 立減, DiscountInput expects a number
        discountInfo.push({
          discountOwner: '平台' as const,
          discountType: '立減' as const,
          discountValue: reduction
        });
      }

      // Pattern: 8折, 85折
      const discountMatch = line.match(/(\d+\.?\d*)折/);
      if (discountMatch) {
        const discount = parseFloat(discountMatch[1]);
        // For 折扣, DiscountInput expects a number
        discountInfo.push({
          discountOwner: '店舖' as const,
          discountType: '折扣' as const,
          discountValue: discount
        });
      }
    }

    // Determine final price and original price
    if (prices.length > 0) {
      // Sort prices to get lowest and highest
      prices.sort((a, b) => a - b);
      price = prices[0]; // Lowest price is usually the final price

      if (prices.length > 1) {
        originalPrice = prices[prices.length - 1]; // Highest price is original price
      }
    }

    console.log('Final price:', price, 'Original price:', originalPrice);

    if (!price) {
      warnings.push('Price not found');
    }

    const formData: Partial<FormData> = {
      title,
      brand,
      price,
      originalPrice,
      date: dayjs()
    };

    // Add discount info if any
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
 * Main parser function that tries different formats
 */
export function parseProductInfo(text: string): ParseResult {
  const trimmedText = text.trim();

  // Try to detect JSON format
  if (trimmedText.startsWith('{')) {
    // Try JD format first
    const jdResult = parseJDProductInfo(trimmedText);
    if (jdResult.success) {
      return jdResult;
    }
    // If JSON parsing failed, return the error
    return jdResult;
  }

  // Try plain text format
  const plainTextResult = parsePlainTextProductInfo(trimmedText);
  if (plainTextResult.success) {
    return plainTextResult;
  }

  return {
    success: false,
    error: 'Unsupported format. Currently supports: JD.com product info JSON, plain text product info'
  };
}
