import { describe, it, expect } from 'vitest';
import {
  ceilToTwo,
  isConvertibleToJin,
  convertToJin,
  convertUnit,
  calculateUnitPrice,
  calculatePricePerJin,
} from '../../utils/unitConversion';

describe('unitConversion', () => {
  describe('ceilToTwo', () => {
    it('should round up to 2 decimal places', () => {
      expect(ceilToTwo(1.234)).toBe(1.24);
      expect(ceilToTwo(1.231)).toBe(1.24);
      expect(ceilToTwo(1.239)).toBe(1.24);
    });

    it('should handle whole numbers', () => {
      expect(ceilToTwo(5)).toBe(5);
      expect(ceilToTwo(10.00)).toBe(10);
    });

    it('should handle numbers already with 2 decimals', () => {
      expect(ceilToTwo(1.23)).toBe(1.23);
      expect(ceilToTwo(99.99)).toBe(99.99);
    });

    it('should round up even tiny fractions', () => {
      expect(ceilToTwo(1.001)).toBe(1.01);
      expect(ceilToTwo(1.999)).toBe(2.00);
    });
  });

  describe('isConvertibleToJin', () => {
    it('should return true for weight units', () => {
      expect(isConvertibleToJin('g')).toBe(true);
      expect(isConvertibleToJin('kg')).toBe(true);
      expect(isConvertibleToJin('jin')).toBe(true);
      expect(isConvertibleToJin('liang')).toBe(true);
    });

    it('should return true for volume units (treated as weight)', () => {
      expect(isConvertibleToJin('ml')).toBe(true);
      expect(isConvertibleToJin('l')).toBe(true);
    });

    it('should return false for piece', () => {
      expect(isConvertibleToJin('piece')).toBe(false);
    });

    it('should return false for unknown units', () => {
      expect(isConvertibleToJin('unknown')).toBe(false);
      expect(isConvertibleToJin('oz')).toBe(false);
    });
  });

  describe('convertToJin', () => {
    it('should convert grams to jin correctly', () => {
      expect(convertToJin(500, 'g')).toBe(1);
      expect(convertToJin(1000, 'g')).toBe(2);
      expect(convertToJin(250, 'g')).toBe(0.5);
    });

    it('should convert kg to jin correctly', () => {
      expect(convertToJin(1, 'kg')).toBe(2);
      expect(convertToJin(0.5, 'kg')).toBe(1);
      expect(convertToJin(2, 'kg')).toBe(4);
    });

    it('should keep jin as jin', () => {
      expect(convertToJin(1, 'jin')).toBe(1);
      expect(convertToJin(5, 'jin')).toBe(5);
    });

    it('should convert liang to jin correctly', () => {
      expect(convertToJin(10, 'liang')).toBe(1);
      expect(convertToJin(5, 'liang')).toBe(0.5);
      expect(convertToJin(20, 'liang')).toBe(2);
    });

    it('should convert ml to jin (approximate)', () => {
      expect(convertToJin(500, 'ml')).toBe(1);
      expect(convertToJin(1000, 'ml')).toBe(2);
    });

    it('should convert liters to jin (approximate)', () => {
      expect(convertToJin(1, 'l')).toBe(2);
      expect(convertToJin(0.5, 'l')).toBe(1);
    });

    it('should return null for piece', () => {
      expect(convertToJin(5, 'piece')).toBeNull();
    });

    it('should return null for unknown units', () => {
      expect(convertToJin(100, 'unknown')).toBeNull();
    });
  });

  describe('convertUnit', () => {
    it('should return same value when units are the same', () => {
      expect(convertUnit(100, 'g', 'g')).toBe(100);
      expect(convertUnit(5, 'jin', 'jin')).toBe(5);
      expect(convertUnit(1, 'piece', 'piece')).toBe(1);
    });

    it('should convert g to kg correctly', () => {
      expect(convertUnit(1000, 'g', 'kg')).toBe(1);
      expect(convertUnit(500, 'g', 'kg')).toBe(0.5);
    });

    it('should convert g to jin correctly', () => {
      expect(convertUnit(500, 'g', 'jin')).toBe(1);
      expect(convertUnit(1000, 'g', 'jin')).toBe(2);
    });

    it('should convert jin to g correctly', () => {
      expect(convertUnit(1, 'jin', 'g')).toBe(500);
      expect(convertUnit(2, 'jin', 'g')).toBe(1000);
    });

    it('should convert kg to jin correctly', () => {
      expect(convertUnit(1, 'kg', 'jin')).toBe(2);
      expect(convertUnit(0.5, 'kg', 'jin')).toBe(1);
    });

    it('should return null when converting from piece', () => {
      expect(convertUnit(1, 'piece', 'jin')).toBeNull();
      expect(convertUnit(1, 'piece', 'g')).toBeNull();
    });

    it('should return null when converting to piece', () => {
      expect(convertUnit(500, 'g', 'piece')).toBeNull();
      expect(convertUnit(1, 'jin', 'piece')).toBeNull();
    });

    it('should return null for unknown units', () => {
      expect(convertUnit(100, 'unknown', 'g')).toBeNull();
      expect(convertUnit(100, 'g', 'unknown')).toBeNull();
    });
  });

  describe('calculateUnitPrice', () => {
    it('should calculate price per jin correctly', () => {
      const price = 30;
      const quantity = 500;
      const unit = 'g';
      const comparisonUnit = 'jin';

      const unitPrice = calculateUnitPrice(price, quantity, unit, comparisonUnit);
      expect(unitPrice).toBe(30); // 30元 for 500g = 30元/斤
    });

    it('should calculate price per kg correctly', () => {
      const price = 50;
      const quantity = 1;
      const unit = 'jin';
      const comparisonUnit = 'kg';

      const unitPrice = calculateUnitPrice(price, quantity, unit, comparisonUnit);
      expect(unitPrice).toBe(100); // 50元/斤 = 100元/kg (1斤=0.5kg)
    });

    it('should handle same unit for quantity and comparison', () => {
      const price = 100;
      const quantity = 2;
      const unit = 'kg';
      const comparisonUnit = 'kg';

      const unitPrice = calculateUnitPrice(price, quantity, unit, comparisonUnit);
      expect(unitPrice).toBe(50); // 100元 for 2kg = 50元/kg
    });

    it('should return null for zero quantity', () => {
      const unitPrice = calculateUnitPrice(100, 0, 'g', 'jin');
      expect(unitPrice).toBeNull();
    });

    it('should return null for negative quantity', () => {
      const unitPrice = calculateUnitPrice(100, -5, 'g', 'jin');
      expect(unitPrice).toBeNull();
    });

    it('should return null when units are not convertible', () => {
      const unitPrice = calculateUnitPrice(100, 1, 'piece', 'jin');
      expect(unitPrice).toBeNull();
    });

    it('should calculate price per piece correctly', () => {
      const price = 50;
      const quantity = 5;
      const unit = 'piece';
      const comparisonUnit = 'piece';

      const unitPrice = calculateUnitPrice(price, quantity, unit, comparisonUnit);
      expect(unitPrice).toBe(10); // 50元 for 5 pieces = 10元/piece
    });
  });

  describe('calculatePricePerJin', () => {
    it('should calculate price per jin from grams', () => {
      const pricePerJin = calculatePricePerJin(30, 500, 'g');
      expect(pricePerJin).toBe(30); // 30元 for 500g = 30元/斤
    });

    it('should calculate price per jin from kg', () => {
      const pricePerJin = calculatePricePerJin(100, 1, 'kg');
      expect(pricePerJin).toBe(50); // 100元 for 1kg = 50元/斤
    });

    it('should calculate price per jin from jin', () => {
      const pricePerJin = calculatePricePerJin(60, 2, 'jin');
      expect(pricePerJin).toBe(30); // 60元 for 2斤 = 30元/斤
    });

    it('should return null for piece', () => {
      const pricePerJin = calculatePricePerJin(100, 5, 'piece');
      expect(pricePerJin).toBeNull();
    });
  });

  describe('complex conversion scenarios', () => {
    it('should handle ml to jin conversion for liquids', () => {
      const result = convertUnit(750, 'ml', 'jin');
      expect(result).toBe(1.5); // 750ml = 1.5斤 (approximate)
    });

    it('should handle liter to jin conversion', () => {
      const result = convertUnit(1.5, 'l', 'jin');
      expect(result).toBe(3); // 1.5L = 3斤 (approximate)
    });

    it('should calculate unit price with volume units', () => {
      const price = 45;
      const quantity = 750;
      const unit = 'ml';
      const comparisonUnit = 'jin';

      const unitPrice = calculateUnitPrice(price, quantity, unit, comparisonUnit);
      expect(unitPrice).toBe(30); // 45元 for 750ml = 30元/斤
    });
  });
});
