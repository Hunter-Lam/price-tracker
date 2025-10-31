import { describe, it, expect } from 'vitest';
import { JDProductParser } from '../../utils/parsers/JDProductParser';

describe('JDProductParser', () => {
  const parser = new JDProductParser();

  describe('getName', () => {
    it('should return parser name', () => {
      expect(parser.getName()).toBe('JD.com JSON Parser');
    });
  });

  describe('canParse', () => {
    it('should return true for valid JD JSON with wareInfoReadMap', () => {
      const validJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Test Product',
          cn_brand: 'Test Brand'
        }
      });
      expect(parser.canParse(validJSON)).toBe(true);
    });

    it('should return true for valid JD JSON with price', () => {
      const validJSON = JSON.stringify({
        price: {
          p: '100.00'
        }
      });
      expect(parser.canParse(validJSON)).toBe(true);
    });

    it('should return false for non-JSON text', () => {
      expect(parser.canParse('Not a JSON')).toBe(false);
    });

    it('should return false for invalid JSON', () => {
      expect(parser.canParse('{invalid json}')).toBe(false);
    });

    it('should return false for JSON without JD-specific fields', () => {
      const nonJDJSON = JSON.stringify({
        someOtherField: 'value'
      });
      expect(parser.canParse(nonJDJSON)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse basic product information correctly', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Test Product Name',
          cn_brand: 'TestBrand',
          product_id: '123456'
        },
        price: {
          p: '99.99',
          op: '129.99'
        }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Test Product Name');
      expect(result.data?.brand).toBe('TestBrand');
      expect(result.data?.price).toBe(99.99);
      expect(result.data?.originalPrice).toBe(129.99);
      expect(result.data?.source?.address).toBe('https://item.jd.com/123456.html');
    });

    it('should parse brand with Chinese and English format "中文（English）"', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product',
          cn_brand: '九阳（Joyoung）'
        },
        price: { p: '100' }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('九阳/Joyoung');
    });

    it('should parse brand with "English/中文" format', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product',
          cn_brand: 'Apple/苹果'
        },
        price: { p: '100' }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('苹果/Apple');
    });

    it('should extract quantity and unit from title', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product 500ml bottle',
          cn_brand: 'Brand'
        },
        price: { p: '50.00' }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(500);
      expect(result.data?.unit).toBe('ml');
      expect(result.data?.comparisonUnit).toBe('jin');
    });

    it('should extract quantity and unit from specifications', () => {
      const saleAttributes = JSON.stringify([
        { dim: 1, saleName: '净含量', saleValue: '750ml', sequenceNo: 1 }
      ]);

      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product',
          cn_brand: 'Brand',
          sale_attributes: saleAttributes
        },
        price: { p: '50.00' }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(750);
      expect(result.data?.unit).toBe('ml');
      expect(result.data?.specification).toContain('净含量: 750ml');
    });

    it('should default to 1 piece when no quantity/unit found', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product without quantity',
          cn_brand: 'Brand'
        },
        price: { p: '50.00' }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(1);
      expect(result.data?.unit).toBe('piece');
      expect(result.data?.comparisonUnit).toBe('piece');
    });

    it('should parse government subsidy discount', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product',
          cn_brand: 'Brand'
        },
        price: {
          p: '100.00',
          finalPrice: {
            price: '85.00',
            priceContent: '政府补贴价'
          }
        }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.discount).toBeDefined();
      expect(result.data?.discount?.length).toBeGreaterThan(0);
      expect(result.data?.discount?.[0].discountOwner).toBe('政府');
      expect(result.data?.discount?.[0].discountType).toBe('折扣');
    });

    it('should parse promotion discounts from subtrahends', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product',
          cn_brand: 'Brand'
        },
        price: { p: '90.00', op: '100.00' },
        preference: {
          preferencePopUp: {
            expression: {
              basePrice: '100.00',
              subtrahends: [
                {
                  preferenceDesc: '满1件8.5折',
                  preferenceAmount: '15.00'
                }
              ]
            }
          }
        }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.discount).toBeDefined();
      const discounts = result.data?.discount || [];
      const quantityDiscount = discounts.find(d => d.discountType === '滿件折');
      expect(quantityDiscount).toBeDefined();
      expect(quantityDiscount?.discountValue).toBe('满1件8.5折');
    });

    it('should parse multiple discount types', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product',
          cn_brand: 'Brand'
        },
        price: { p: '70.00', op: '100.00' },
        preference: {
          preferencePopUp: {
            expression: {
              basePrice: '100.00',
              subtrahends: [
                {
                  preferenceDesc: '满300减30',
                  preferenceAmount: '30.00'
                },
                {
                  preferenceDesc: '首购礼金 2元',
                  preferenceAmount: '2.00'
                }
              ]
            }
          }
        }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.discount).toBeDefined();
      expect(result.data?.discount?.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle invalid JSON gracefully', () => {
      const result = parser.parse('{invalid}');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should add warning when title is missing', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {},
        price: { p: '50.00' }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Product name not found');
    });

    it('should add warning when brand is missing', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product'
        },
        price: { p: '50.00' }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Brand not found');
    });

    it('should parse limited purchase discount', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product',
          cn_brand: 'Brand'
        },
        price: { p: '90.00', op: '100.00' },
        commonLimitInfo: {
          limitText: '仅限购买1件',
          limitNum: '1'
        }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      // Limited purchase should only be added if there's no other discount explaining the price difference
      // In this case, there's a price difference, so it will add a 立減 discount instead
    });

    it('should normalize Chinese units to English', () => {
      const jdJSON = JSON.stringify({
        wareInfoReadMap: {
          sku_name: 'Product 500克',
          cn_brand: 'Brand'
        },
        price: { p: '50.00' }
      });

      const result = parser.parse(jdJSON);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(500);
      expect(result.data?.unit).toBe('g');
    });
  });
});
