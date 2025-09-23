import React, { useEffect } from "react";
import { Button, DatePicker, Form, FormProps, Input, InputNumber, Select, Row, Col, Space } from "antd";
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next';
import type { FormData } from "../types";
import { CATEGORIES, CATEGORY_KEYS } from "../constants";
import { SourceInput, DiscountSection, DiscountParser } from "./";

interface ProductFormProps {
  form: any;
  loading: boolean;
  sourceTypeRule: Array<{ type: string }>;
  onFinish: FormProps<FormData>["onFinish"];
  onFinishFailed: FormProps<FormData>["onFinishFailed"];
  onSourceTypeChange: (rule: Array<{ type: string }>) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  form,
  loading,
  sourceTypeRule,
  onFinish,
  onFinishFailed,
  onSourceTypeChange,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    form.validateFields([["source", "address"]]);
  }, [sourceTypeRule, form]);

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

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="title"
            label={t('form.productTitle')}
            rules={[{ required: true, message: t('form.productTitleRequired') }]}
          >
            <Input placeholder={t('form.productTitlePlaceholder')} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="brand"
            label={t('form.brand')}
            rules={[{ required: true, message: t('form.brandRequired') }]}
          >
            <Input placeholder={t('form.brandPlaceholder')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
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
        <Col xs={24} sm={12}>
          <Form.Item
            name="date"
            label={t('form.date')}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

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

      <DiscountParser form={form} />

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
        </Space>
      </Form.Item>
    </Form>
  );
};