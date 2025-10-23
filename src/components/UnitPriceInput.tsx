import React from 'react';
import { Form, InputNumber, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { calculateUnitPrice, ceilToTwo } from '../utils/unitConversion';
import { UnitSelect } from './UnitSelect';
import { UnitPriceDisplay } from './UnitPriceDisplay';

interface UnitPriceInputProps {
  form?: any;
}

export const UnitPriceInput: React.FC<UnitPriceInputProps> = () => {
  const { t } = useTranslation();

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="quantity"
            label={t('form.specQuantity')}
            tooltip={t('form.specQuantityTooltip')}
          >
            <InputNumber
              style={{ width: "100%" }}
              step="0.01"
              precision={2}
              placeholder="500"
              min={0}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="unit"
            label={t('form.specUnit')}
            tooltip={t('form.specUnitTooltip')}
          >
            <UnitSelect placeholder="g" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="comparisonUnit"
            label={t('form.comparisonUnit')}
            tooltip={t('form.comparisonUnitTooltip')}
          >
            <UnitSelect placeholder={t('constants.units.jin')} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item noStyle dependencies={['price', 'quantity', 'unit', 'comparisonUnit']}>
        {({ getFieldValue, setFieldsValue }) => {
          const price = getFieldValue('price');
          const quantity = getFieldValue('quantity');
          const unit = getFieldValue('unit');
          const comparisonUnit = getFieldValue('comparisonUnit');

          // Calculate unit price using utility function
          const calculatedUnitPrice = (price && quantity && unit && comparisonUnit)
            ? calculateUnitPrice(price, quantity, unit, comparisonUnit)
            : null;

          // Apply ceiling round before saving
          const roundedUnitPrice = calculatedUnitPrice !== null ? ceilToTwo(calculatedUnitPrice) : null;

          // Auto-update hidden unitPrice field when calculation changes
          const currentUnitPrice = getFieldValue('unitPrice');
          if (roundedUnitPrice !== null && currentUnitPrice !== roundedUnitPrice) {
            setFieldsValue({ unitPrice: roundedUnitPrice });
          }

          // Display calculated unit price if available
          return calculatedUnitPrice !== null ? (
            <UnitPriceDisplay
              unitPrice={calculatedUnitPrice}
              comparisonUnit={comparisonUnit}
              quantity={quantity}
              unit={unit}
              price={price}
            />
          ) : null;
        }}
      </Form.Item>

      {/* Hidden field to store the calculated unit price */}
      <Form.Item name="unitPrice" hidden>
        <InputNumber />
      </Form.Item>
    </>
  );
};
