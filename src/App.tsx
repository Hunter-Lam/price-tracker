import React, { useCallback, useEffect, useState, useRef } from "react";
import { Button, DatePicker, Form, FormProps, Input, InputNumber, Select, Row, Col, Card, Space, Typography, ConfigProvider, theme, App as AntdApp } from "antd";
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from "dayjs";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from 'react-i18next';
import type { FormData, Product, ProductInput } from "./types";
import { CATEGORIES, CATEGORY_KEYS } from "./constants";
import { SourceInput, DiscountSection, DiscountParser, ProductTable, ColumnController, ThemeToggle, LanguageToggle, PriceHistoryChart } from "./components";
import type { ColumnConfig } from "./components/ColumnController";
import { useTheme } from "./contexts/ThemeContext";
import { useLanguage } from "./contexts/LanguageContext";
import { useDocumentTitle } from "./hooks/useDocumentTitle";

const AppContent: React.FC = () => {
  const { message } = AntdApp.useApp();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  // Update document title when language changes
  useDocumentTitle();
  const [sourceTypeRule, setSourceTypeRule] = useState<Array<{ type: string }>>([{ type: "url" }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const hasLoadAttempted = useRef(false);
  
  // Column visibility configuration
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { key: "id", title: "ID", visible: true },
    { key: "title", title: t('table.title'), visible: true },
    { key: "brand", title: t('table.brand'), visible: true },
    { key: "type", title: t('table.type'), visible: true },
    { key: "price", title: t('table.price'), visible: true },
    { key: "specification", title: t('table.specification'), visible: true },
    { key: "date", title: t('table.date'), visible: true },
    { key: "remark", title: t('table.remark'), visible: true },
    { key: "created_at", title: t('table.createdAt'), visible: true },
    { key: "action", title: t('table.actions'), visible: true },
  ]);

  const loadProducts = useCallback(async () => {
    // Prevent duplicate calls in StrictMode
    if (hasLoadAttempted.current) return;
    
    try {
      hasLoadAttempted.current = true;
      
      // Check if we're in Tauri environment
      if (typeof window === 'undefined' || !(window as any).__TAURI__) {
        console.warn("Not running in Tauri environment - using empty product list");
        setProducts([]);
        return;
      }
      
      const result = await invoke<Product[]>("get_products");
      setProducts(result);
    } catch (error) {
      console.error("Failed to load products:", error);
      
      // Only show error if we're actually in Tauri environment
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        message.error(t('messages.loadProductsFailed'));
      } else {
        console.warn("API call failed - not in Tauri environment");
        setProducts([]);
      }
    }
  }, [message]);

  // Load products from database on component mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onFinish: FormProps<FormData>["onFinish"] = async (values) => {
    console.log("表單提交成功:", values);
    setLoading(true);
    
    try {
      // Prepare product data for saving
      const productInput: ProductInput = {
        url: values.source?.address || "",
        title: values.title || "",
        brand: values.brand || "",
        type: values.type || "",
        price: values.price || 0,
        specification: values.specification || "",
        date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        remark: values.remark || "",
      };
      
      // Check if we're in Tauri environment
      if (typeof window === 'undefined' || !(window as any).__TAURI__) {
        message.warning(t('messages.notInTauriEnvironment'));
        return;
      }
      
      // Save to database via Tauri
      const savedProduct = await invoke<Product>("save_product", { product: productInput });
      
      // Update local state
      setProducts(prev => [savedProduct, ...prev]);
      
      // Reset form
      form.resetFields();
      form.setFieldValue("date", dayjs());
      
      message.success(t('messages.productSaved'));
    } catch (error) {
      console.error("Failed to save product:", error);
      message.error(t('messages.productSaveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<FormData>["onFinishFailed"] = (errorInfo) => {
    console.log("表單提交失敗:", errorInfo);
  };

  const handleSourceTypeChange = useCallback((rule: Array<{ type: string }>) => {
    setSourceTypeRule(rule);
  }, []);

  const handleDeleteProduct = useCallback(async (id: number) => {
    try {
      // Check if we're in Tauri environment
      if (typeof window === 'undefined' || !(window as any).__TAURI__) {
        message.warning(t('messages.notInTauriEnvironmentDelete'));
        return;
      }
      
      await invoke("delete_product", { id });
      setProducts(prev => prev.filter(p => p.id !== id));
      message.success(t('messages.productDeleted'));
    } catch (error) {
      console.error("Failed to delete product:", error);
      message.error(t('messages.productDeleteFailed'));
    }
  }, [message]);

  useEffect(() => {
    form.validateFields([["source", "address"]]);
  }, [sourceTypeRule, form]);

  return (
    <div className="app-container" style={{ 
      minHeight: '100vh', 
      padding: '24px 0'
    }}>
        <div className="container">
          <Row justify="center">
            <Col xs={24} sm={24} md={24} lg={24} xl={20} xxl={18}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
              <Col>
                <Typography.Title 
                  level={1} 
                  style={{ 
                    margin: 0
                  }}
                >
                  {t('app.title')}
                </Typography.Title>
              </Col>
              <Col>
                <Space>
                  <LanguageToggle />
                  <ThemeToggle />
                </Space>
              </Col>
            </Row>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card 
                title={t('form.addProduct')} 
                variant="outlined"
              >
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
                onSourceTypeChange={handleSourceTypeChange} 
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
              </Card>

              <Card 
                variant="outlined"
              >
                <ProductTable 
                  data={products} 
                  onDelete={handleDeleteProduct}
                  visibleColumns={columnConfig}
                  columnController={
                    <ColumnController
                      columns={columnConfig}
                      onColumnChange={setColumnConfig}
                    />
                  }
                />
              </Card>

              <PriceHistoryChart data={products} />
            </Space>
            </Col>
          </Row>
        </div>
      </div>
  );
};

const App: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  
  const antdLocale = language === 'en-US' ? enUS : zhCN;
  
  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
