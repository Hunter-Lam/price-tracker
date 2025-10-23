/**
 * Unit conversion utilities for price calculation
 * Base unit for weight: 斤 (jin)
 * 1 斤 = 500g = 0.5kg
 */

import type { TFunction } from 'i18next';

/**
 * Round up to 2 decimal places (ceiling)
 * Used for unit price calculations to ensure conservative pricing
 */
export const ceilToTwo = (value: number): number => {
  return Math.ceil(value * 100) / 100;
};

/**
 * Translate unit name to localized string
 * @param unitValue - The unit value (e.g., "g", "jin", "kg")
 * @param t - Translation function from react-i18next
 * @returns Localized unit name
 */
export const translateUnit = (unitValue: string, t: TFunction): string => {
  return t(`constants.units.${unitValue}`, { defaultValue: unitValue });
};

/**
 * Conversion rates to jin (斤) as base unit
 * Note: 'piece' is excluded as it's a count unit, not weight/volume
 */
const CONVERSION_TO_JIN: Record<string, number> = {
  'g': 1 / 500,      // 500g = 1斤
  'kg': 2,           // 1kg = 2斤
  'jin': 1,          // 1斤 = 1斤
  'liang': 0.1,      // 10兩 = 1斤
  'ml': 1 / 500,     // Approximate: treat as g for liquids
  'l': 2,            // Approximate: treat as kg for liquids
};

/**
 * Check if a unit is convertible to jin (斤)
 * 'piece' cannot be converted as it's a count unit, not weight/volume
 */
export const isConvertibleToJin = (unit: string): boolean => {
  return unit in CONVERSION_TO_JIN;
};

/**
 * Convert a quantity to 斤
 * @param quantity - The quantity to convert
 * @param unit - The unit of the quantity
 * @returns The quantity in 斤, or null if not convertible
 */
export const convertToJin = (quantity: number, unit: string): number | null => {
  if (!isConvertibleToJin(unit)) {
    return null;
  }
  return quantity * CONVERSION_TO_JIN[unit];
};

/**
 * Convert between any two compatible units
 * @param quantity - The quantity to convert
 * @param fromUnit - The source unit
 * @param toUnit - The target unit
 * @returns The converted quantity, or null if conversion is not possible
 */
export const convertUnit = (
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null => {
  // If same unit, return as-is (works for all units including 'piece')
  if (fromUnit === toUnit) {
    return quantity;
  }

  // 'piece' cannot be converted to other units
  if (fromUnit === 'piece' || toUnit === 'piece') {
    return null;
  }

  // Both must be convertible weight/volume units
  if (!isConvertibleToJin(fromUnit) || !isConvertibleToJin(toUnit)) {
    return null;
  }

  // Convert from source to jin, then to target
  const jinQuantity = convertToJin(quantity, fromUnit);
  if (jinQuantity === null) {
    return null;
  }

  // Convert from jin to target unit
  const conversionRate = CONVERSION_TO_JIN[toUnit];
  return jinQuantity / conversionRate;
};

/**
 * Calculate unit price in a specific comparison unit
 * @param price - Total price
 * @param quantity - Quantity
 * @param unit - Unit of quantity
 * @param comparisonUnit - Unit for price comparison
 * @returns Unit price in comparison unit, or null if not calculable
 */
export const calculateUnitPrice = (
  price: number,
  quantity: number,
  unit: string,
  comparisonUnit: string
): number | null => {
  if (quantity <= 0) {
    return null;
  }

  // Convert quantity to comparison unit
  const convertedQuantity = convertUnit(quantity, unit, comparisonUnit);
  if (convertedQuantity === null || convertedQuantity === 0) {
    return null;
  }

  return price / convertedQuantity;
};

/**
 * Calculate price per jin (斤) - for backward compatibility
 * Used by ProductTable for fallback display of legacy records
 * @param price - Total price
 * @param quantity - Quantity
 * @param unit - Unit of quantity
 * @returns Price per jin, or null if not convertible
 */
export const calculatePricePerJin = (
  price: number,
  quantity: number,
  unit: string
): number | null => {
  return calculateUnitPrice(price, quantity, unit, 'jin');
};
