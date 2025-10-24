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
 * 直降5.79元
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

      // Extract prices
      const { price, originalPrice } = this.extractPrices(lines, warnings);

      // Extract specifications (returns both map and formatted string)
      const { specsMap, specsString } = this.extractSpecification(lines);

      // Extract brand from specs map
      const brand = this.extractBrandFromSpecs(specsMap);
      if (!brand) {
        warnings.push('Brand not found in parameters');
      }

      // Extract discounts
      const discountInfo = this.extractDiscounts(lines);

      const formData: Partial<FormData> = {
        title,
        brand: brand || '',
        price,
        originalPrice,
        specification: specsString,
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
   * Extract brand from specs map
   * Unified format: "中文/英文" or just brand name if only one part
   */
  private extractBrandFromSpecs(specsMap: Map<string, string>): string {
    const brandValue = specsMap.get('品牌');

    if (!brandValue) {
      return '';
    }

    // Handle format like "Colgate/高露洁" or "SANXINGDUI MUSEUM/三星堆博物馆"
    const parts = brandValue.split('/').map(p => p.trim());

    if (parts.length >= 2) {
      // Determine which is Chinese and which is English
      const isChinese = (text: string) => /[\u4e00-\u9fa5]/.test(text);
      const brandCn = parts.find(p => isChinese(p)) || '';
      const brandEn = parts.find(p => !isChinese(p) && /^[A-Za-z]/.test(p)) || '';

      // Return unified format: "中文/英文"
      if (brandCn && brandEn) {
        return `${brandCn}/${brandEn}`;
      } else if (brandCn) {
        return brandCn;
      } else if (brandEn) {
        return brandEn;
      }
    }

    // Single part, return as is
    return parts[0] || '';
  }


  /**
   * Extract prices (handles券后 and 优惠前 format)
   */
  private extractPrices(lines: string[], warnings: string[]): { price?: number; originalPrice?: number } {
    let price: number | undefined;
    let originalPrice: number | undefined;

    console.log('Taobao parser - lines:', lines);

    // Track which lines we've already processed to avoid double-processing
    const processedIndices = new Set<number>();

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
            processedIndices.add(i + 1); // Mark the ¥ line as processed
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
            processedIndices.add(i + 1); // Mark the ¥ line as processed
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

      // If just ¥ on a line, next line is a price (skip if already processed)
      if (currentLine === '¥' && !processedIndices.has(i)) {
        const priceValue = parseFloat(nextLine);
        if (!isNaN(priceValue) && priceValue > 0) {
          // If we already have a price (e.g., 券后 price), this ¥ is the original price
          if (price && !originalPrice) {
            originalPrice = priceValue;
            console.log('Found original price after second ¥:', priceValue);
          } else if (!price) {
            // First ¥ found, use as price
            price = priceValue;
            console.log('Found price after ¥:', priceValue);
          }
        }
      }
    }

    console.log('Taobao final prices - price:', price, 'originalPrice:', originalPrice);

    if (!price) {
      warnings.push('Price not found');
    }

    // If no originalPrice found, set it to the same as price (no discount)
    if (price && !originalPrice) {
      originalPrice = price;
    }

    return { price, originalPrice };
  }

  /**
   * Extract specification/model from parameters
   * Extracts ALL parameter fields from the parameters section
   *
   * Strategy:
   * - Detect format automatically (KEY-VALUE for Taobao, VALUE-KEY for Tmall)
   * - Extract all key-value pairs in the parameters section
   * - Each pair consists of two consecutive lines
   *
   * @returns Object with specsMap (Map of key-value pairs) and specsString (formatted string)
   */
  private extractSpecification(lines: string[]): { specsMap: Map<string, string>; specsString: string } {
    const specs: Map<string, string> = new Map();

    // Find "参数信息" section
    let paramsStartIndex = -1;
    let paramsEndIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '参数信息') {
        paramsStartIndex = i;
      } else if (paramsStartIndex >= 0 && lines[i].endsWith('信息') && lines[i] !== '参数信息') {
        paramsEndIndex = i;
        break;
      }
    }

    if (paramsStartIndex === -1) {
      return { specsMap: new Map(), specsString: '' };
    }

    // Filter out empty lines in parameters section
    const paramLines: string[] = [];
    for (let i = paramsStartIndex + 1; i < paramsEndIndex; i++) {
      const line = lines[i];
      if (line && line.trim()) {
        paramLines.push(line.trim());
      }
    }

    if (paramLines.length === 0) {
      return { specsMap: new Map(), specsString: '' };
    }

    // Common parameter keys to help identify which line is the key
    const commonKeys = [
      '品牌', '产地', '型号', '规格', '颜色分类', '材质', '款式', '货号',
      '大小', '适用年龄段', '功能', '包装', '包装规格',
      '系列', '省份', '城市', '规格描述', '是否进口', '总净含量',
      '生产许可证编号', '厂名', '厂址', '厂家联系方式', '配料表',
      '保质期', '净含量', '成分', '特性', '用途', '特殊添加成分',
      '适用对象', '流行元素', '风格', '元素年代', '套件种类',
      '适用空间', '个数', '适用场景', '适用群体', '单件净含量',
      '酒精度数', '香型', '包装方式', '售卖规格', '生产企业',
      '贴膜特点', '贴膜工艺', '适用手机型号', '适用品牌',
      '适用机型', '屏幕尺寸', '颜色', '容量', '版本', '套餐',
      '尺码', '重量', '产品名称', '适用性别', '适用季节'
    ];

    // Detect format and format change point
    // 3 possible formats:
    // 1. All VALUE-KEY pairs
    // 2. All KEY-VALUE pairs
    // 3. VALUE-KEY pairs, then KEY-VALUE pairs (format switches once, never back)
    //
    // Strategy: Find format change by detecting consecutive known keys
    let formatChangeIndex = -1;
    for (let j = 0; j < paramLines.length - 1; j++) {
      // Two consecutive known keys indicate format switch point
      // The first key is the last key in VALUE-KEY format
      // The second key is the first key in KEY-VALUE format
      if (commonKeys.includes(paramLines[j]) && commonKeys.includes(paramLines[j + 1])) {
        formatChangeIndex = j + 1; // Format changes at the second key
        break;
      }
    }

    // If no format change detected, determine which format dominates
    if (formatChangeIndex === -1) {
      let valueKeyCount = 0;
      let keyValueCount = 0;

      for (let j = 0; j < paramLines.length - 1; j += 2) {
        const isFirstKey = commonKeys.includes(paramLines[j]);
        const isSecondKey = j + 1 < paramLines.length && commonKeys.includes(paramLines[j + 1]);

        if (!isFirstKey && isSecondKey) {
          valueKeyCount++;
        } else if (isFirstKey && !isSecondKey) {
          keyValueCount++;
        }
      }

      if (valueKeyCount > keyValueCount) {
        formatChangeIndex = paramLines.length; // All VALUE-KEY
      } else {
        formatChangeIndex = 0; // All KEY-VALUE
      }
    }

    // Parse VALUE-KEY section (before format change point)
    let i = 0;
    if (formatChangeIndex > 0) {
      while (i < formatChangeIndex) {
        if (i + 1 < paramLines.length && commonKeys.includes(paramLines[i + 1])) {
          // VALUE-KEY format: value is on current line, key is on next line
          specs.set(paramLines[i + 1], paramLines[i]);
          i += 2;
        } else {
          // Orphaned line, skip
          i += 1;
        }
      }
    }

    // Parse KEY-VALUE section (from format change point onwards)
    const startIndex = formatChangeIndex > 0 ? formatChangeIndex : 0;
    i = startIndex;
    while (i < paramLines.length) {
      const currentLine = paramLines[i];

      if (commonKeys.includes(currentLine)) {
        // KEY-VALUE format: key is on current line, value is on next line
        if (i + 1 < paramLines.length && !commonKeys.includes(paramLines[i + 1])) {
          specs.set(currentLine, paramLines[i + 1]);
          i += 2;
        } else {
          // Orphaned key, skip
          i += 1;
        }
      } else if (formatChangeIndex === 0 && i + 1 < paramLines.length && commonKeys.includes(paramLines[i + 1])) {
        // Edge case: formatChangeIndex=0 but we found VALUE-KEY pattern
        // This can happen if our detection was wrong, fall back to VALUE-KEY
        specs.set(paramLines[i + 1], currentLine);
        i += 2;
      } else {
        // Unknown key - determine format based on context
        if (i + 1 < paramLines.length) {
          const line1 = currentLine;
          const line2 = paramLines[i + 1];

          // If we're past format change point (formatChangeIndex > 0), assume KEY-VALUE format
          // Otherwise, use heuristic
          let key: string, value: string;
          if (formatChangeIndex > 0 && startIndex > 0) {
            // We're in KEY-VALUE section, treat current line as key
            key = line1;
            value = line2;
          } else if (line1.length <= line2.length) {
            // Heuristic: shorter or equal length line is more likely the key
            key = line1;
            value = line2;
          } else {
            key = line2;
            value = line1;
          }

          if (key && value) {
            specs.set(key, value);
          }
          i += 2;
        } else {
          // Last orphaned line, skip
          i += 1;
        }
      }
    }

    // Combine specs in formatted style: KEY: VALUE
    const specParts: string[] = [];
    for (const [mapKey, mapValue] of specs) {
      // Map stores entries as: specs.set(key, value)
      // So mapKey is the actual key, mapValue is the actual value
      specParts.push(`${mapKey}: ${mapValue}`);
    }

    return {
      specsMap: specs,
      specsString: specParts.join('\n')
    };
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
        continue;
      }

      // Pattern: 超级立减3.47元, 立减3.47元, 立减4元 (platform discounts)
      const instantMatch = line.match(/立减(\d+\.?\d*)元?/i);
      if (instantMatch) {
        const reduction = parseFloat(instantMatch[1]);
        discountInfo.push({
          discountOwner: '平台' as const,
          discountType: '立減' as const,
          discountValue: reduction
        });
        continue;
      }

      // Pattern: 直降5.79元 (store discounts)
      const storeDiscountMatch = line.match(/直降(\d+\.?\d*)元?/i);
      if (storeDiscountMatch) {
        const reduction = parseFloat(storeDiscountMatch[1]);
        discountInfo.push({
          discountOwner: '店舖' as const,
          discountType: '立減' as const,
          discountValue: reduction
        });
        continue;
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
        continue;
      }
    }

    return discountInfo;
  }
}
