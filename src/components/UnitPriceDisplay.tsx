import React from 'react';
import { useTranslation } from 'react-i18next';
import { convertUnit, ceilToTwo, translateUnit } from '../utils/unitConversion';

interface UnitPriceDisplayProps {
  unitPrice: number;
  comparisonUnit: string;
  quantity: number;
  unit: string;
  price: number;
}

/**
 * Display component for calculated unit price
 * Shows the unit price in a highlighted info box with calculation details
 */
export const UnitPriceDisplay: React.FC<UnitPriceDisplayProps> = ({
  unitPrice,
  comparisonUnit,
  quantity,
  unit,
  price,
}) => {
  const { t } = useTranslation();

  // Convert the spec quantity to comparison unit for display
  const convertedQuantity = convertUnit(quantity, unit, comparisonUnit);

  // Apply ceiling round to unit price
  const displayUnitPrice = ceilToTwo(unitPrice);

  // Translate unit names for display
  const translatedComparisonUnit = translateUnit(comparisonUnit, t);
  const translatedUnit = translateUnit(unit, t);

  const calculationFormula = convertedQuantity !== null
    ? t('form.unitPriceFormula', {
        price: price.toFixed(2),
        quantity: ceilToTwo(convertedQuantity).toFixed(2),
        unit: translatedComparisonUnit,
        unitPrice: displayUnitPrice.toFixed(2),
        comparisonUnit: translatedComparisonUnit
      })
    : t('form.unitPriceFormula', {
        price: price.toFixed(2),
        quantity: quantity.toFixed(2),
        unit: translatedUnit,
        unitPrice: displayUnitPrice.toFixed(2),
        comparisonUnit: translatedComparisonUnit
      });

  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '12px 16px',
        backgroundColor: '#f0f5ff',
        borderRadius: '6px',
        border: '1px solid #d6e4ff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', color: '#595959' }}>
          {t('form.calculatedUnitPrice')}:
        </span>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
            ¥{displayUnitPrice.toFixed(2)}
          </span>
          <span style={{ fontSize: '14px', color: '#8c8c8c', marginLeft: '4px' }}>
            / {translatedComparisonUnit}
          </span>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '6px' }}>
        {calculationFormula}
      </div>
    </div>
  );
};
