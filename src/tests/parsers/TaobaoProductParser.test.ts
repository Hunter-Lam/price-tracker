import { describe, it, expect } from 'vitest';
import { TaobaoProductParser } from '../../utils/parsers/TaobaoProductParser';

describe('TaobaoProductParser', () => {
  const parser = new TaobaoProductParser();

  describe('getName', () => {
    it('should return parser name', () => {
      expect(parser.getName()).toBe('Taobao/Tmall Product Parser');
    });
  });

  describe('canParse', () => {
    it('should return true for text with "参数信息"', () => {
      const text = `
Product Name
券后 ¥ 8.9
参数信息
品牌 TestBrand
      `;
      expect(parser.canParse(text)).toBe(true);
    });

    it('should return true for text with "优惠前"', () => {
      const text = `
Product Name
优惠前 ¥ 12.37
      `;
      expect(parser.canParse(text)).toBe(true);
    });

    it('should return true for text with both "券后" and "参数信息"', () => {
      const text = `
券后 ¥ 9.9
参数信息
品牌 Brand
      `;
      expect(parser.canParse(text)).toBe(true);
    });

    it('should return false for JSON text', () => {
      expect(parser.canParse('{"key": "value"}')).toBe(false);
    });

    it('should return false for plain text without Taobao indicators', () => {
      expect(parser.canParse('Just some random text')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse basic Taobao product information', () => {
      const text = `
高露洁官方店洁银牙膏草本清火护龈缓解牙龈出血成人清新口气正品
券后
¥
8.9
优惠前
¥
12.37
参数信息
品牌
Colgate/高露洁
型号
洁银组合-12/16
净含量
120g
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.title).toContain('高露洁');
      expect(result.data?.price).toBe(8.9);
      expect(result.data?.originalPrice).toBe(12.37);
      expect(result.data?.brand).toBe('高露洁/Colgate');
      expect(result.data?.specification).toContain('品牌');
    });

    it('should parse quantity and unit from specifications', () => {
      const text = `
Product Name
¥
50.00
参数信息
品牌
Brand
净含量
500ml
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(500);
      expect(result.data?.unit).toBe('ml');
      expect(result.data?.comparisonUnit).toBe('jin');
    });

    it('should extract quantity from title when not in specs', () => {
      const text = `
Product 750ml Bottle
¥
30.00
参数信息
品牌 Brand
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(750);
      expect(result.data?.unit).toBe('ml');
      expect(result.data?.title).not.toContain('750ml'); // Should be cleaned
    });

    it('should default to 1 piece when no quantity found', () => {
      const text = `
Product Name
¥
50.00
参数信息
品牌 Brand
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(1);
      expect(result.data?.unit).toBe('piece');
      expect(result.data?.comparisonUnit).toBe('piece');
    });

    it('should parse discount information', () => {
      const text = `
Product
¥
50.00
满300减30
超级立减3.47元
直降5.79元
参数信息
品牌 Brand
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.discount).toBeDefined();
      const discounts = result.data?.discount || [];
      expect(discounts.length).toBeGreaterThanOrEqual(3);

      const thresholdDiscount = discounts.find(d => d.discountType === '滿減');
      expect(thresholdDiscount).toBeDefined();
      expect(thresholdDiscount?.discountValue).toBe('满300减30');

      const platformDiscount = discounts.find(
        d => d.discountType === '立減' && d.discountOwner === '平台'
      );
      expect(platformDiscount).toBeDefined();

      const storeDiscount = discounts.find(
        d => d.discountType === '立減' && d.discountOwner === '店舖'
      );
      expect(storeDiscount).toBeDefined();
    });

    it('should parse Taobao coin discount', () => {
      const text = `
Product
¥
40.00
淘金币已抵9.54元
参数信息
品牌 Brand
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.discount).toBeDefined();
      const coinDiscount = result.data?.discount?.find(
        d => d.discountValue === 9.54
      );
      expect(coinDiscount).toBeDefined();
      expect(coinDiscount?.discountOwner).toBe('平台');
    });

    it('should handle VALUE-KEY parameter format (Tmall style)', () => {
      const text = `
Product
¥
50.00
参数信息
500ml
净含量
TestBrand
品牌
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('TestBrand');
      expect(result.data?.specification).toContain('品牌: TestBrand');
      expect(result.data?.specification).toContain('净含量: 500ml');
    });

    it('should handle KEY-VALUE parameter format (Taobao style)', () => {
      const text = `
Product
¥
50.00
参数信息
品牌
TestBrand
净含量
500ml
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('TestBrand');
      expect(result.data?.specification).toContain('品牌: TestBrand');
    });

    it('should handle mixed brand format with Chinese and English', () => {
      const text = `
Product
¥
50.00
参数信息
品牌
SANXINGDUI MUSEUM/三星堆博物馆
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.brand).toBe('三星堆博物馆/SANXINGDUI MUSEUM');
    });

    it('should normalize Chinese units', () => {
      const text = `
Product 500克
¥
30.00
参数信息
品牌 Brand
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.quantity).toBe(500);
      expect(result.data?.unit).toBe('g');
    });

    it('should handle empty input gracefully', () => {
      const result = parser.parse('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Empty input');
    });

    it('should set originalPrice when no final price found', () => {
      const text = `
Product Name
优惠前
¥
20.00
参数信息
品牌
Brand
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.originalPrice).toBe(20.00);
      // When only originalPrice is found, price remains undefined
      // Note: The actual form should handle this by using originalPrice as fallback
      expect(result.warnings).toContain('Price not found');
    });

    it('should parse inline price format', () => {
      const text = `
Product Name
券后 ¥8.9
优惠前 ¥12.37
参数信息
品牌 Brand
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(8.9);
      expect(result.data?.originalPrice).toBe(12.37);
    });

    it('should extract all common parameter keys', () => {
      const text = `
Product
¥
50.00
参数信息
品牌
TestBrand
产地
中国
规格
500ml
颜色
红色
材质
塑料
保质期
12个月
      `.trim();

      const result = parser.parse(text);

      expect(result.success).toBe(true);
      expect(result.data?.specification).toContain('品牌: TestBrand');
      expect(result.data?.specification).toContain('产地: 中国');
      expect(result.data?.specification).toContain('规格: 500ml');
      expect(result.data?.specification).toContain('颜色: 红色');
      expect(result.data?.specification).toContain('材质: 塑料');
      expect(result.data?.specification).toContain('保质期: 12个月');
    });
  });
});
