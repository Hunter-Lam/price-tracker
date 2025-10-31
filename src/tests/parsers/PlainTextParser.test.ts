import { describe, it, expect } from 'vitest';
import { PlainTextParser } from '../../utils/parsers/PlainTextParser';

describe('PlainTextParser', () => {
  const parser = new PlainTextParser();

  describe('getName', () => {
    it('should return parser name', () => {
      expect(parser.getName()).toBe('Plain Text Parser');
    });
  });

  describe('canParse', () => {
    it('should return true for multi-line text with price', () => {
      const text = `
Product Name
¥ 99.99
Some description
      `;
      expect(parser.canParse(text)).toBe(true);
    });

    it('should return true for text with discount patterns', () => {
      const text = `
Product Name
满300减30
立减10元
      `;
      expect(parser.canParse(text)).toBe(true);
    });

    it('should return false for JSON', () => {
      expect(parser.canParse('{"key": "value"}')).toBe(false);
    });

    it('should return false for single line without price or discount', () => {
      expect(parser.canParse('Just one line')).toBe(false);
    });

    it('should return false for empty text', () => {
      expect(parser.canParse('')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse basic product information', () => {
      const text = `
华佗牌针灸针承臻一次性针无菌针灸专用针医用中医针炙非银针
券后 ¥ 16.8 起
超级立减活动价 ¥ 20.8 起
满300减30
超级立减4元
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('华佗');
      expect(result.data?.title).toContain('针灸针');
      expect(result.data?.price).toBe(16.8);
      expect(result.data?.originalPrice).toBe(20.8);
    });

    it('should extract brand with "牌" pattern', () => {
      const text = `
三九牌感冒灵颗粒
¥ 30.00
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('三九');
      expect(result.data?.title).toBe('感冒灵颗粒');
    });

    it('should extract brand with parentheses pattern', () => {
      const text = `
三星（SAMSUNG）手机
¥ 5000.00
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('三星');
    });

    it('should extract multiple prices correctly', () => {
      const text = `
Product Name
¥ 50.00
¥ 100.00
¥ 75.00
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(50.00); // Lowest price
      expect(result.data?.originalPrice).toBe(100.00); // Highest price
    });

    it('should parse multi-line price format', () => {
      const text = `
Product Name
¥
99.99
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(99.99);
    });

    it('should extract discount information', () => {
      const text = `
Product Name
¥ 50.00
满300减30
立减20元
8折
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.discount).toBeDefined();
      const discounts = result.data?.discount || [];

      const thresholdDiscount = discounts.find(d => d.discountType === '滿減');
      expect(thresholdDiscount).toBeDefined();
      expect(thresholdDiscount?.discountValue).toBe('满300减30');

      const instantDiscount = discounts.find(d => d.discountType === '立減');
      expect(instantDiscount).toBeDefined();
      expect(instantDiscount?.discountValue).toBe(20);

      const percentDiscount = discounts.find(d => d.discountType === '折扣');
      expect(percentDiscount).toBeDefined();
      expect(percentDiscount?.discountValue).toBe(8);
    });

    it('should handle discount with 超级立减 prefix', () => {
      const text = `
Product Name
¥ 50.00
超级立减15.5元
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.discount).toBeDefined();
      const discount = result.data?.discount?.find(d => d.discountValue === 15.5);
      expect(discount).toBeDefined();
    });

    it('should add warning when price not found', () => {
      const text = `
Product Name
No price here
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Price not found');
    });

    it('should add warning when brand not extracted', () => {
      const text = `
P
¥ 50.00
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Brand not extracted, please fill manually');
    });

    it('should handle empty input gracefully', () => {
      const result = parser.parse('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty input');
    });

    it('should parse Chinese currency symbol', () => {
      const text = `
Product Name
￥ 88.88
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(88.88);
    });

    it('should extract brand from potential first characters', () => {
      const text = `
格力 空调挂机
¥ 2000.00
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('格力');
    });
  });
});
