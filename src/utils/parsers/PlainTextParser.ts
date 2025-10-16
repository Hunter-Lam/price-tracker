import dayjs from 'dayjs';
import type { FormData, DiscountItem } from '../../types';
import type { IProductInfoParser, ParseResult } from './types';

/**
 * Parser for plain text product information (copy-pasted from e-commerce sites)
 *
 * Example formats:
 * - 华佗牌针灸针承臻一次性针无菌针灸专用针医用中医针炙非银针
 * - 券后 ¥ 16.8 起
 * - 超级立减活动价 ¥ 20.8 起
 * - 满300减30
 * - 超级立减4元
 */
export class PlainTextParser implements IProductInfoParser {
  getName(): string {
    return 'Plain Text Parser';
  }

  canParse(text: string): boolean {
    const trimmed = text.trim();

    // Not JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return false;
    }

    // Has multiple lines (typical for plain text product info)
    const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      return false;
    }

    // Contains price indicators or discount patterns
    const hasPriceIndicator = /[¥￥]/.test(trimmed);
    const hasDiscountPattern = /减|折|立减|满/.test(trimmed);

    return hasPriceIndicator || hasDiscountPattern;
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

      // Extract brand and title from first line
      const { brand, title } = this.extractBrandAndTitle(lines[0], warnings);

      // Extract prices
      const { price, originalPrice } = this.extractPrices(lines, warnings);

      // Extract discount information
      const discountInfo = this.extractDiscounts(lines);

      const formData: Partial<FormData> = {
        title,
        brand,
        price,
        originalPrice,
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
   * Extract brand and title from the first line
   */
  private extractBrandAndTitle(fullTitle: string, warnings: string[]): { brand: string; title: string } {
    let brand = '';
    let title = fullTitle;

    // Pattern 1: Brand + 牌 (e.g., 华佗牌...)
    const brandWithPaiMatch = fullTitle.match(/^([^牌]{2,6})牌(.+)/);
    if (brandWithPaiMatch) {
      brand = brandWithPaiMatch[1];
      title = brandWithPaiMatch[2].trim();
      return { brand, title };
    }

    // Pattern 2: Brand in parentheses (e.g., 三星（SAMSUNG）)
    const brandParenMatch = fullTitle.match(/^([^（(]+)[（(]([^）)]+)[）)](.+)/);
    if (brandParenMatch) {
      brand = brandParenMatch[1].trim();
      title = (brandParenMatch[1] + brandParenMatch[3]).trim();
      return { brand, title };
    }

    // Pattern 3: First 2-6 characters before separator might be brand
    const potentialBrandMatch = fullTitle.match(/^([^\s，。、]{2,6})[，。、\s](.+)/);
    if (potentialBrandMatch) {
      brand = potentialBrandMatch[1];
      title = fullTitle; // Keep full title if uncertain
      return { brand, title };
    }

    // If no brand found
    warnings.push('Brand not extracted, please fill manually');
    return { brand, title };
  }

  /**
   * Extract prices from lines
   * Handles both same-line and multi-line formats
   */
  private extractPrices(lines: string[], warnings: string[]): { price?: number; originalPrice?: number } {
    const prices: number[] = [];

    console.log('Plain text parser - lines:', lines);

    // Try same-line pattern first
    const pricePattern = /[¥￥]\s*(\d+\.?\d*)/g;
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

    let price: number | undefined;
    let originalPrice: number | undefined;

    if (prices.length > 0) {
      prices.sort((a, b) => a - b);
      price = prices[0]; // Lowest price is final price
      if (prices.length > 1) {
        originalPrice = prices[prices.length - 1]; // Highest is original
      }
    }

    console.log('Final price:', price, 'Original price:', originalPrice);

    if (!price) {
      warnings.push('Price not found');
    }

    return { price, originalPrice };
  }

  /**
   * Extract discount information from lines
   */
  private extractDiscounts(lines: string[]): DiscountItem[] {
    const discountInfo: DiscountItem[] = [];

    for (const line of lines) {
      // Pattern: 满300减30
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

      // Pattern: 超级立减4元, 立减4元
      const instantMatch = line.match(/立减(\d+\.?\d*)元?/i);
      if (instantMatch) {
        const reduction = parseFloat(instantMatch[1]);
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
        discountInfo.push({
          discountOwner: '店舖' as const,
          discountType: '折扣' as const,
          discountValue: discount
        });
      }
    }

    return discountInfo;
  }
}
