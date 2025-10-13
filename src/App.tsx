import React, { useCallback, useEffect, useState, useRef } from "react";
import { Form, FormProps, Row, Col, Card, Space, Typography, ConfigProvider, theme, App as AntdApp } from "antd";
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next';
import type { FormData, Product, ProductInput } from "./types";
import { ProductForm, ProductTable, ColumnController, ThemeToggle, LanguageToggle, PriceHistoryChart } from "./components";
import type { ColumnConfig } from "./components/ColumnController";
import { useTheme } from "./contexts/ThemeContext";
import { useLanguage } from "./contexts/LanguageContext";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import storage from "./utils/storage";

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
  
  // Column visibility configuration - track only visibility, titles are dynamic
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true,
    title: true,
    brand: true,
    type: true,
    originalPrice: true,
    price: true,
    discount: true,
    address: true,
    specification: true,
    date: true,
    remark: true,
    created_at: true,
    action: true,
  });

  // Generate column config with current translations
  const columnConfig: ColumnConfig[] = [
    { key: "id", title: t('table.id'), visible: columnVisibility.id },
    { key: "title", title: t('table.title'), visible: columnVisibility.title },
    { key: "brand", title: t('table.brand'), visible: columnVisibility.brand },
    { key: "type", title: t('table.type'), visible: columnVisibility.type },
    { key: "originalPrice", title: t('table.originalPrice'), visible: columnVisibility.originalPrice },
    { key: "price", title: t('table.price'), visible: columnVisibility.price },
    { key: "discount", title: t('table.discount'), visible: columnVisibility.discount },
    { key: "address", title: t('table.url'), visible: columnVisibility.address },
    { key: "specification", title: t('table.specification'), visible: columnVisibility.specification },
    { key: "date", title: t('table.date'), visible: columnVisibility.date },
    { key: "remark", title: t('table.remark'), visible: columnVisibility.remark },
    { key: "created_at", title: t('table.createdAt'), visible: columnVisibility.created_at },
    { key: "action", title: t('table.actions'), visible: columnVisibility.action },
  ];

  // Handle column visibility changes
  const handleColumnChange = (columns: ColumnConfig[]) => {
    const newVisibility = columns.reduce((acc, col) => {
      acc[col.key] = col.visible;
      return acc;
    }, {} as Record<string, boolean>);
    setColumnVisibility(newVisibility);
  };

  const loadProducts = useCallback(async () => {
    // Prevent duplicate calls in StrictMode
    if (hasLoadAttempted.current) return;

    try {
      hasLoadAttempted.current = true;

      const result = await storage.getProducts();
      setProducts(result);

      // Log environment info for debugging
      if (storage.isTauriEnvironment()) {
        console.log("Running in Tauri environment - using database storage");
      } else {
        console.log("Running in browser environment - using localStorage");
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      message.error(t('messages.loadProductsFailed'));
      setProducts([]);
    }
  }, [message, t]);

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
        originalPrice: values.originalPrice || undefined,
        discount: values.discount ? JSON.stringify(values.discount) : undefined,
        specification: values.specification || "",
        date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        remark: values.remark || "",
      };

      // Save product using unified storage (works in both browser and Tauri)
      const savedProduct = await storage.saveProduct(productInput);

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
      // Delete product using unified storage (works in both browser and Tauri)
      await storage.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      message.success(t('messages.productDeleted'));
    } catch (error) {
      console.error("Failed to delete product:", error);
      message.error(t('messages.productDeleteFailed'));
    }
  }, [message, t]);

  const handleBulkImport = useCallback(async (products: ProductInput[]) => {
    try {
      // Import products using unified storage (works in both browser and Tauri)
      const savedProducts = await storage.importProducts(products);

      // Update local state with successfully saved products
      setProducts(prev => [...savedProducts, ...prev]);

      return Promise.resolve();
    } catch (error) {
      console.error("Bulk import failed:", error);
      throw error;
    }
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    // Parse discount data
    let discountData = [];
    if (product.discount) {
      try {
        discountData = JSON.parse(product.discount);
      } catch (error) {
        console.error("Failed to parse discount:", error);
      }
    }

    // Check if the address is a URL
    const isUrl = (address: string): boolean => {
      if (!address) return false;
      const trimmed = address.trim();
      return trimmed.startsWith('http://') ||
             trimmed.startsWith('https://') ||
             trimmed.includes('://') ||
             /^www\./i.test(trimmed) ||
             /\.(com|org|net|edu|gov|mil|int|co|cn|hk|tw|jp|kr|uk|de|fr|ca|au|br|in|ru|mx|it|es|nl|be|ch|se|no|dk|pl|cz|at|hu|gr|pt|ie|fi|bg|ro|hr|si|sk|lt|lv|ee|lu|mt|cy)($|\/)/i.test(trimmed);
    };

    // Set form values
    form.setFieldsValue({
      title: product.title,
      brand: product.brand,
      type: product.type,
      price: product.price,
      originalPrice: product.originalPrice || undefined,
      discount: discountData.length > 0 ? discountData : undefined,
      specification: product.specification || '',
      date: product.date ? dayjs(product.date) : dayjs(),
      remark: product.remark || '',
      source: {
        type: isUrl(product.url || '') ? 'URL' : '商鋪',
        address: product.url || ''
      }
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    message.info(t('messages.productLoadedForEdit'));
  }, [form, message, t]);

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
                <ProductForm
                  form={form}
                  loading={loading}
                  sourceTypeRule={sourceTypeRule}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  onSourceTypeChange={handleSourceTypeChange}
                />
              </Card>

              <Card
                variant="outlined"
              >
                <ProductTable
                  data={products}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onImport={handleBulkImport}
                  visibleColumns={columnConfig}
                  columnController={
                    <ColumnController
                      columns={columnConfig}
                      onColumnChange={handleColumnChange}
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
