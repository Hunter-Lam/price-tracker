import React, { useEffect, useRef } from "react";
import { Button, DatePicker, Form, FormProps, Input, InputNumber, Select, Row, Col, Space } from "antd";
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next';
import type { FormData } from "../types";
import { CATEGORIES, CATEGORY_KEYS } from "../constants";
import { SourceInput, DiscountSection } from "./";
import { UnitSelect } from "./UnitSelect";
import { UnitPriceDisplay } from "./UnitPriceDisplay";
import { calculateUnitPrice, ceilToTwo } from "../utils/unitConversion";

interface ProductFormProps {
  form: any;
  loading: boolean;
  sourceTypeRule: Array<{ type: string }>;
  onFinish: FormProps<FormData>["onFinish"];
  onFinishFailed: FormProps<FormData>["onFinishFailed"];
  onSourceTypeChange: (rule: Array<{ type: string }>) => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  onInsertAsNew?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  form,
  loading,
  sourceTypeRule,
  onFinish,
  onFinishFailed,
  onSourceTypeChange,
  isEditing = false,
  onCancelEdit,
  onInsertAsNew,
}) => {
  const { t } = useTranslation();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    form.validateFields([["source", "address"]]);
  }, [sourceTypeRule, form]);

  const handleUnitChange = (unit: string) => {
    const currentComparisonUnit = form.getFieldValue('comparisonUnit');
    const defaultComparisonUnit = unit === 'piece' ? 'piece' : 'jin';

    // Auto-set comparison unit if empty or incompatible
    if (!currentComparisonUnit ||
        (unit === 'piece' && currentComparisonUnit !== 'piece') ||
        (unit !== 'piece' && currentComparisonUnit === 'piece')) {
      form.setFieldsValue({ comparisonUnit: defaultComparisonUnit });
    }
  };

  const handleOriginalPriceChange = (value: number | null) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only auto-fill if original price has a value and final price is empty
    if (value && value > 0) {
      const currentFinalPrice = form.getFieldValue('price');
      if (!currentFinalPrice) {
        // Set a timeout to auto-fill the final price after 500ms
        timeoutRef.current = setTimeout(() => {
          form.setFieldValue('price', value);
        }, 500);
      }
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Form
      form={form}
      name="productForm"
      layout="vertical"
      initialValues={{
        remember: true,
        date: dayjs()
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      size="large"
    >
      <SourceInput
        form={form}
        onSourceTypeChange={onSourceTypeChange}
      />

      <Form.Item
        name="title"
        label={t('form.productTitle')}
        rules={[{ required: true, message: t('form.productTitleRequired') }]}
      >
        <Input placeholder={t('form.productTitlePlaceholder')} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="brand"
            label={t('form.brand')}
            rules={[{ required: true, message: t('form.brandRequired') }]}
          >
            <Input placeholder={t('form.brandPlaceholder')} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="type"
            label={t('form.productType')}
            rules={[{ required: true, message: t('form.productTypeRequired') }]}
          >
            <Select
              placeholder={t('form.productTypePlaceholder')}
              options={CATEGORY_KEYS.map((key, index) => ({
                label: t(`constants.categories.${key}`),
                value: CATEGORIES[index]
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="date"
            label={t('form.date')}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={4}>
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
        <Col xs={24} sm={4}>
          <Form.Item
            name="unit"
            label={t('form.specUnit')}
            tooltip={t('form.specUnitTooltip')}
          >
            <UnitSelect placeholder="g" onChange={handleUnitChange} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={4}>
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

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
              name="originalPrice"
              label={t('form.originalPrice')}
          >
            <InputNumber
                style={{ width: "100%" }}
                step="0.01"
                precision={2}
                placeholder="0.00"
                min={0}
                addonAfter={t('form.currency')}
                onChange={handleOriginalPriceChange}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="price"
            label={t('form.finalPrice')}
            rules={[{ required: true, message: t('form.finalPriceRequired') }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              step="0.01"
              precision={2}
              placeholder="0.00"
              min={0}
              addonAfter={t('form.currency')}
            />
          </Form.Item>
        </Col>
      </Row>

      <DiscountSection form={form} />

      <Form.Item
        name="specification"
        label={t('form.specification')}
      >
        <Input.TextArea
          rows={3}
          placeholder={t('form.specificationPlaceholder')}
          autoSize
        />
      </Form.Item>

      <Form.Item
        name="remark"
        label={t('form.remark')}
      >
        <Input.TextArea
          rows={3}
          placeholder={t('form.remarkPlaceholder')}
          autoSize
        />
      </Form.Item>

      <Form.Item>
        <Space size="middle" wrap>
          {isEditing ? (
            <>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                {t('form.update')}
              </Button>
              <Button
                onClick={onInsertAsNew}
                size="large"
                loading={loading}
              >
                {t('form.insertAsNew')}
              </Button>
              <Button
                onClick={onCancelEdit}
                size="large"
              >
                {t('form.cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                {t('form.submit')}
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  form.setFieldValue("date", dayjs());
                }}
                size="large"
              >
                {t('form.clear')}
              </Button>
            </>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};