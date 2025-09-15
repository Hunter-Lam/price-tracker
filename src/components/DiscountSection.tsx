import React from "react";
import { Button, Form, Select, Space, theme } from "antd";
import type { FormInstance } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';
import { DISCOUNT_ORGANIZERS, DISCOUNT_ORGANIZER_KEYS, DISCOUNT_METHODS, DISCOUNT_METHOD_KEYS } from "../constants";
import DiscountInput from "./DiscountInput";

interface DiscountSectionProps {
  form: FormInstance;
}

const DiscountSection: React.FC<DiscountSectionProps> = ({ form }) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  
  return (
    <Form.Item name="discount" label={t('discount.title')}>
      <Form.List name="discount">
        {(fields, { add, remove }) => (
          <Space direction="vertical" style={{ width: '100%' }}>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: 8, 
                width: '100%' 
              }}>
                <Space wrap>
                  <Form.Item
                    {...restField}
                    name={[name, "discountOwner"]}
                    rules={[{ required: true, message: t('discount.providerRequired') }]}
                    style={{ marginBottom: 0, minWidth: 120 }}
                  >
                    <Select 
                      placeholder={t('discount.providerPlaceholder')} 
                      popupMatchSelectWidth={false} 
                      options={DISCOUNT_ORGANIZER_KEYS.map((key, index) => ({ 
                        label: t(`constants.discountOrganizers.${key}`), 
                        value: DISCOUNT_ORGANIZERS[index] 
                      }))}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    {...restField}
                    name={[name, "discountType"]}
                    rules={[{ required: true, message: t('discount.typeRequired') }]}
                    style={{ marginBottom: 0, minWidth: 120 }}
                  >
                    <Select 
                      placeholder={t('discount.typePlaceholder')} 
                      popupMatchSelectWidth={false} 
                      options={DISCOUNT_METHOD_KEYS.map((key, index) => ({ 
                        label: t(`constants.discountMethods.${key}`), 
                        value: DISCOUNT_METHODS[index] 
                      }))}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    {...restField}
                    name={[name, "discountValue"]}
                    rules={[{ required: true, message: t('discount.valueRequired') }]}
                    style={{ marginBottom: 0, minWidth: 200 }}
                  >
                    <DiscountInput 
                      format={form.getFieldValue(["discount", name, "discountType"])} 
                    />
                  </Form.Item>
                </Space>
                
                <MinusCircleOutlined 
                  style={{ 
                    color: token.colorError, 
                    cursor: 'pointer',
                    fontSize: 16,
                    padding: 4,
                    marginTop: 6
                  }}
                  onClick={() => remove(name)} 
                />
              </div>
            ))}
            
            <Button 
              type="dashed" 
              onClick={() => add()} 
              block 
              icon={<PlusOutlined />}
              style={{ marginTop: 8 }}
            >
              {t('discount.addDiscount')}
            </Button>
          </Space>
        )}
      </Form.List>
    </Form.Item>
  );
};

export default DiscountSection;
