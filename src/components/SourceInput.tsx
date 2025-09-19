import React, { useState } from "react";
import { Button, Form, Input, Select, Space, App } from "antd";
import type { FormInstance } from "antd";
import { useTranslation } from 'react-i18next';
import { SOURCES, SOURCE_KEYS } from "../constants";
import { formatUrl } from "../utils/urlFormatter";
import { fetchJDProductInfo } from "../utils/urlParser";

interface SourceInputProps {
  form: FormInstance;
  onSourceTypeChange: (rule: Array<{ type: string }>) => void;
}

const SourceInput: React.FC<SourceInputProps> = ({ form, onSourceTypeChange }) => {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const { t } = useTranslation();

  const handleParseUrl = async () => {
    const value = form.getFieldValue(["source", "address"]);
    if (!value) return;

    setLoading(true);

    try {
      const formattedUrl = formatUrl(value);
      form.setFieldValue(["source", "address"], formattedUrl);

      await navigator.clipboard.writeText(formattedUrl);
      if (formattedUrl !== value) {
        message.success(t('source.urlAutoFormatted'));
      } else {
        message.success(t('source.urlCopied'));
      }

      if (formattedUrl.includes("item.jd.com")) {
        message.loading(t('source.fetchingProductInfo'));

        const productInfo = await fetchJDProductInfo(formattedUrl);

        if (productInfo) {
          form.setFieldsValue({
            title: productInfo.title,
            brand: productInfo.brand,
            price: productInfo.price,
          });
          message.success(t('source.productInfoSuccess'));
        } else {
          message.warning(t('source.productInfoFailed'));
        }
      }
    } catch (error) {
      message.error(t('source.parseError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form.Item label={t('source.productSource')}>
      <Space.Compact style={{ width: '100%' }}>
        <Form.Item noStyle name={["source", "type"]} initialValue={SOURCES[0]}>
          <Select 
            style={{ width: 120 }}
            options={SOURCE_KEYS.map((key, index) => ({ 
              label: t(`constants.sources.${key}`), 
              value: SOURCES[index] 
            }))}
            onChange={(value: string) => {
              const rule = value === SOURCES[0] ? [{ type: "url" }] : [{ type: "string" }];
              onSourceTypeChange(rule);
            }}
          />
        </Form.Item>
        <Form.Item noStyle name={["source", "address"]}>
          <Input
            placeholder={t('source.placeholder')}
            style={{ width: 'calc(100% - 180px)' }}
          />
        </Form.Item>
        <Button 
          type="primary" 
          onClick={handleParseUrl}
          loading={loading}
          style={{ width: 60 }}
        >
          {t('source.parse')}
        </Button>
      </Space.Compact>
    </Form.Item>
  );
};

export default SourceInput;
