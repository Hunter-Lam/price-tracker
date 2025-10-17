import dayjs from 'dayjs';
import type { FormData, DiscountItem } from '../../types';
import type { IProductInfoParser, ParseResult } from './types';

/**
 * Parser for Taobao and Tmall product information (plain text format)
 *
 * Example format:
 * 高露洁官方店洁银牙膏草本清火护龈缓解牙龈出血成人清新口气正品
 * 券后 ¥ 8.9
 * 优惠前 ¥ 12.37 (or 新品促销 ¥ 19.75)
 * 满300减30
 * 超级立减3.47元
 *
 * 参数信息
 * 品牌 Colgate/高露洁
 * 型号 洁银组合-12/16
 */
export class TaobaoProductParser implements IProductInfoParser {
  getName(): string {
    return 'Taobao/Tmall Product Parser';
  }

  canParse(text: string): boolean {
    const trimmed = text.trim();

    // Not JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return false;
    }

    // Taobao-specific indicators
    const hasTaobaoIndicators =
      /参数信息/.test(trimmed) ||
      /优惠前/.test(trimmed) ||
      /淘金币/.test(trimmed) ||
      (/券后/.test(trimmed) && /参数信息/.test(trimmed));

    return hasTaobaoIndicators;
  }

  parse(text: string): ParseResult {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

      if (lines.length === 0) {
        return {
          success: false,
          error: 'Empty input'
        };
      }

      const warnings: string[] = [];

      // Extract title (first line)
      const title = lines[0];

      // Extract brand from parameters section
      const brand = this.extractBrand(lines);
      if (!brand) {
        warnings.push('Brand not found in parameters');
      }

      // Extract prices
      const { price, originalPrice } = this.extractPrices(lines, warnings);

      // Extract specifications
      const specification = this.extractSpecification(lines);

      // Extract discounts
      const discountInfo = this.extractDiscounts(lines);

      const formData: Partial<FormData> = {
        title,
        brand: brand || '',
        price,
        originalPrice,
        specification,
        date: dayjs()
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
   * Extract brand from parameters section
   */
  private extractBrand(lines: string[]): string {
    // Look for "品牌" line followed by brand name
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i] === '品牌') {
        const brandLine = lines[i + 1];
        // Handle format like "Colgate/高露洁" or "PUKEM/布克之雪"
        const parts = brandLine.split('/');
        // Prefer Chinese name if available
        return parts.length > 1 ? parts[1] : parts[0];
      }
    }

    // Fallback: try to extract from first line
    const firstLine = lines[0];
    const brandMatch = firstLine.match(/^([^牌]{2,10})牌/);
    if (brandMatch) {
      return brandMatch[1];
    }

    return '';
  }

  /**
   * Extract prices (handles券后 and 优惠前 format)
   */
  private extractPrices(lines: string[], warnings: string[]): { price?: number; originalPrice?: number } {
    let price: number | undefined;
    let originalPrice: number | undefined;

    console.log('Taobao parser - lines:', lines);

    // Look for "券后" or just "¥" for final price
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i];
      const nextLine = lines[i + 1];

      // Pattern: 券后 \n ¥ \n 8.9
      if (currentLine === '券后' || currentLine.includes('券后')) {
        // Next line might be ¥, and line after that is the price
        if (nextLine === '¥' && i < lines.length - 2) {
          const priceValue = parseFloat(lines[i + 2]);
          if (!isNaN(priceValue) && priceValue > 0) {
            price = priceValue;
            console.log('Found 券后 price:', priceValue);
          }
        } else {
          // Try to parse price from same line or next line
          const priceMatch = (currentLine + ' ' + nextLine).match(/¥?\s*(\d+\.?\d*)/);
          if (priceMatch) {
            const priceValue = parseFloat(priceMatch[1]);
            if (!isNaN(priceValue) && priceValue > 0) {
              price = priceValue;
              console.log('Found 券后 price (inline):', priceValue);
            }
          }
        }
      }

      // Pattern: 优惠前 \n ¥ \n 12.37 OR 新品促销 \n ¥ \n 19.75
      if (currentLine === '优惠前' || currentLine.includes('优惠前') ||
          currentLine === '新品促销' || currentLine.includes('新品促销')) {
        if (nextLine === '¥' && i < lines.length - 2) {
          const priceValue = parseFloat(lines[i + 2]);
          if (!isNaN(priceValue) && priceValue > 0) {
            originalPrice = priceValue;
            console.log('Found original price (优惠前/新品促销):', priceValue);
          }
        } else {
          const priceMatch = (currentLine + ' ' + nextLine).match(/¥?\s*(\d+\.?\d*)/);
          if (priceMatch) {
            const priceValue = parseFloat(priceMatch[1]);
            if (!isNaN(priceValue) && priceValue > 0) {
              originalPrice = priceValue;
              console.log('Found original price (inline):', priceValue);
            }
          }
        }
      }

      // If just ¥ on a line, next line is price
      if (currentLine === '¥' && !price) {
        const priceValue = parseFloat(nextLine);
        if (!isNaN(priceValue) && priceValue > 0) {
          price = priceValue;
          console.log('Found price after ¥:', priceValue);
        }
      }
    }

    console.log('Taobao final prices - price:', price, 'originalPrice:', originalPrice);

    if (!price) {
      warnings.push('Price not found');
    }

    return { price, originalPrice };
  }

  /**
   * Extract specification/model from parameters
   */
  private extractSpecification(lines: string[]): string {
    const specs: string[] = [];

    // Look for common spec fields
    const specFields = ['型号', '规格', '颜色分类', '售卖规格'];

    for (let i = 0; i < lines.length - 1; i++) {
      if (specFields.includes(lines[i])) {
        const specValue = lines[i + 1];
        if (specValue && specValue.length < 100) {
          specs.push(specValue);
          break; // Just take the first one found
        }
      }
    }

    return specs.join(', ');
  }

  /**
   * Extract discount information
   */
  private extractDiscounts(lines: string[]): DiscountItem[] {
    const discountInfo: DiscountItem[] = [];

    for (const line of lines) {
      // Pattern: 满300减30, 商品券满21减16
      const thresholdMatch = line.match(/满(\d+)减(\d+)/);
      if (thresholdMatch) {
        const threshold = parseInt(thresholdMatch[1]);
        const reduction = parseInt(thresholdMatch[2]);
        discountInfo.push({
          discountOwner: '平台' as const,
          discountType: '滿減' as const,
          discountValue: `满${threshold}减${reduction}`
        });
      }

      // Pattern: 超级立减3.47元, 立减3.47元, 立减4元
      const instantMatch = line.match(/立减(\d+\.?\d*)元?/i);
      if (instantMatch) {
        const reduction = parseFloat(instantMatch[1]);
        discountInfo.push({
          discountOwner: '平台' as const,
          discountType: '立減' as const,
          discountValue: reduction
        });
      }

      // Pattern: 淘金币已抵9.54元
      const coinMatch = line.match(/淘金币已抵(\d+\.?\d*)元?/);
      if (coinMatch) {
        const reduction = parseFloat(coinMatch[1]);
        discountInfo.push({
          discountOwner: '平台' as const,
          discountType: '立減' as const,
          discountValue: reduction
        });
      }
    }

    return discountInfo;
  }
}
