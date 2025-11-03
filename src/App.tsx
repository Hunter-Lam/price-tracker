import React, { useCallback, useEffect, useState, useRef } from "react";
import { Form, FormProps, Row, Col, Card, Space, Typography, ConfigProvider, theme, App as AntdApp, Button } from "antd";
import { FileTextOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from "dayjs";
import { useTranslation } from 'react-i18next';
import type { FormData, Product, ProductInput } from "./types";
import { ProductForm, ProductTable, ColumnController, ThemeToggle, LanguageToggle, PriceHistoryChart, PasteParseModal, JDSpecImporter } from "./components";
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
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const hasLoadAttempted = useRef(false);
  
  // Column visibility configuration - track only visibility, titles are dynamic
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    // Try to load saved column visibility settings from localStorage
    const savedSettings = localStorage.getItem('columnVisibility');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Failed to parse saved column visibility settings:', error);
      }
    }
    // Default column visibility settings
    return {
      id: true,
      title: true,
      brand: true,
      type: true,
      originalPrice: true,
      price: true,
      unitPrice: true,
      discount: true,
      specification: true,
      date: true,
      remark: true,
      created_at: true,
      action: true,
    };
  });

  // Generate column config with current translations
  const columnConfig: ColumnConfig[] = [
    { key: "id", title: t('table.id'), visible: columnVisibility.id },
    { key: "title", title: t('table.title'), visible: columnVisibility.title },
    { key: "brand", title: t('table.brand'), visible: columnVisibility.brand },
    { key: "type", title: t('table.type'), visible: columnVisibility.type },
    { key: "originalPrice", title: t('table.originalPrice'), visible: columnVisibility.originalPrice },
    { key: "price", title: t('table.price'), visible: columnVisibility.price },
    { key: "unitPrice", title: t('table.unitPrice'), visible: columnVisibility.unitPrice },
    { key: "discount", title: t('table.discount'), visible: columnVisibility.discount },
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

  // Save column visibility settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
  }, [columnVisibility]);

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
        address: values.source?.address || "",
        title: values.title || "",
        brand: values.brand || "",
        type: values.type || "",
        price: values.price || 0,
        originalPrice: values.originalPrice || undefined,
        discount: values.discount ? JSON.stringify(values.discount) : undefined,
        specification: values.specification || "",
        date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        remark: values.remark || "",
        quantity: values.quantity || undefined,
        unit: values.unit || undefined,
        unitPrice: values.unitPrice || undefined,
        comparisonUnit: values.comparisonUnit || undefined,
      };

      if (editingProductId !== null) {
        // Update existing product
        const updatedProduct = await storage.updateProduct(editingProductId, productInput);

        // Update local state
        setProducts(prev => prev.map(p => p.id === editingProductId ? updatedProduct : p));

        message.success(t('messages.productUpdated'));
      } else {
        // Save new product using unified storage (works in both browser and Tauri)
        const savedProduct = await storage.saveProduct(productInput);

        // Update local state
        setProducts(prev => [savedProduct, ...prev]);

        message.success(t('messages.productSaved'));
      }

      // Reset form and editing state
      form.resetFields();
      form.setFieldValue("date", dayjs());
      setEditingProductId(null);
    } catch (error) {
      console.error("Failed to save product:", error);
      message.error(editingProductId !== null ? t('messages.productUpdateFailed') : t('messages.productSaveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<FormData>["onFinishFailed"] = (errorInfo) => {
    console.log("表單提交失敗:", errorInfo);

    // Focus on the first field with error
    if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
      const firstErrorField = errorInfo.errorFields[0].name;
      form.scrollToField(firstErrorField, {
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleSourceTypeChange = useCallback((rule: Array<{ type: string }>) => {
    setSourceTypeRule(rule);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingProductId(null);
    form.resetFields();
    form.setFieldValue("date", dayjs());
  }, [form]);

  const handleInsertAsNew = useCallback(async () => {
    // Validate the form first
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Prepare product data for saving as new
      const productInput: ProductInput = {
        address: values.source?.address || "",
        title: values.title || "",
        brand: values.brand || "",
        type: values.type || "",
        price: values.price || 0,
        originalPrice: values.originalPrice || undefined,
        discount: values.discount ? JSON.stringify(values.discount) : undefined,
        specification: values.specification || "",
        date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        remark: values.remark || "",
        quantity: values.quantity || undefined,
        unit: values.unit || undefined,
        unitPrice: values.unitPrice || undefined,
        comparisonUnit: values.comparisonUnit || undefined,
      };

      // Save as new product (ignore editingProductId)
      const savedProduct = await storage.saveProduct(productInput);

      // Update local state
      setProducts(prev => [savedProduct, ...prev]);

      // Reset form and editing state
      form.resetFields();
      form.setFieldValue("date", dayjs());
      setEditingProductId(null);

      message.success(t('messages.productSaved'));
    } catch (error: any) {
      // If validation failed, don't show error message
      if (error?.errorFields) {
        return;
      }
      console.error("Failed to insert as new:", error);
      message.error(t('messages.productSaveFailed'));
    } finally {
      setLoading(false);
    }
  }, [form, t, message]);

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

    // Set editing state
    setEditingProductId(product.id || null);

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
      quantity: product.quantity || undefined,
      unit: product.unit || undefined,
      unitPrice: product.unitPrice || undefined,
      comparisonUnit: product.comparisonUnit || undefined,
      source: {
        type: isUrl(product.address || '') ? 'URL' : '商鋪',
        address: product.address || ''
      }
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    message.info(t('messages.productLoadedForEdit'));
  }, [form, message, t]);

  const handleParsedData = useCallback((parsedData: any) => {
    // Fill the form with parsed data
    if (parsedData) {
      console.log('Parsed data:', parsedData);

      // Ensure discount is properly set (undefined or array, never null)
      const formValues = {
        ...parsedData,
        discount: parsedData.discount && parsedData.discount.length > 0
          ? parsedData.discount
          : undefined
      };

      console.log('Form values to set:', formValues);
      form.setFieldsValue(formValues);
      message.success(t('pasteParser.parseSuccess'));

      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [form, message, t]);

  const handleJDImport = useCallback((specification: string) => {
    // Auto-fill specification field only
    form.setFieldsValue({
      specification: specification,
    });
  }, [form]);

  return (
    <div className="app-container" style={{ 
      minHeight: '100vh', 
      padding: '24px 0'
    }}>
        <div className="container">
          <Row justify="center">
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
                title={
                  <Space>
                    <span>{editingProductId !== null ? t('form.editProduct') : t('form.addProduct')}</span>
                    <Button
                      icon={<FileTextOutlined />}
                      onClick={() => setPasteModalOpen(true)}
                      size="small"
                    >
                      {t('pasteParser.pasteButton')}
                    </Button>
                  </Space>
                }
                variant="outlined"
              >
                <ProductForm
                  form={form}
                  loading={loading}
                  sourceTypeRule={sourceTypeRule}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  onSourceTypeChange={handleSourceTypeChange}
                  isEditing={editingProductId !== null}
                  onCancelEdit={handleCancelEdit}
                  onInsertAsNew={handleInsertAsNew}
                  specImporterButton={<JDSpecImporter onImport={handleJDImport} />}
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

        <PasteParseModal
          open={pasteModalOpen}
          onCancel={() => setPasteModalOpen(false)}
          onParse={handleParsedData}
        />
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
