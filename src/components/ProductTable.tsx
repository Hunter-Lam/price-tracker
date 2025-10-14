import React, { useMemo, useState } from "react";
import { Table, TableColumnsType, Typography, Tag, Space, Button, Popconfirm, Row, Col, App, Modal, Upload, Alert, Divider } from "antd";
import { LinkOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, InfoCircleOutlined, EditOutlined, EnvironmentOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { Product, ProductInput } from "../types";
import { ColumnConfig } from "./ColumnController";
import { exportToCSV, getVisibleColumnKeys } from "../utils/csvExport";
import { parseCSV, importCSVFile, generateCSVTemplate, type CSVImportResult } from "../utils/csvImport";
import { openExternalUrl } from "../utils/openUrl";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

interface ProductTableProps {
  data?: Product[];
  onDelete?: (id: number) => void;
  onEdit?: (product: Product) => void;
  onImport?: (products: ProductInput[]) => Promise<void>;
  visibleColumns?: ColumnConfig[];
  columnController?: React.ReactNode;
}

const ProductTable: React.FC<ProductTableProps> = ({ data = [], onDelete, onEdit, onImport, visibleColumns, columnController }) => {
  const { message } = App.useApp();
  const { t } = useTranslation();

  // Function to check if an address is a URL
  const isUrl = (address: string): boolean => {
    if (!address) return false;
    const trimmed = address.trim();
    return trimmed.startsWith('http://') ||
           trimmed.startsWith('https://') ||
           trimmed.includes('://') ||
           /^www\./i.test(trimmed) ||
           /\.(com|org|net|edu|gov|mil|int|co|cn|hk|tw|jp|kr|uk|de|fr|ca|au|br|in|ru|mx|it|es|nl|be|ch|se|no|dk|pl|cz|at|hu|gr|pt|ie|fi|bg|ro|hr|si|sk|lt|lv|ee|lu|mt|cy)($|\/)/i.test(trimmed);
  };

  // Import modal state
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  // Generate filter options from data
  const filterOptions = useMemo(() => {
    const brands = Array.from(new Set(data.map(item => item.brand))).sort();
    const types = Array.from(new Set(data.map(item => item.type))).sort();
    const titles = Array.from(new Set(data.map(item => item.title))).sort();
    
    return {
      brands: brands.map(brand => ({ text: brand, value: brand })),
      types: types.map(type => ({ text: type, value: type })),
      titles: titles.map(title => ({ text: title, value: title }))
    };
  }, [data]);

  // CSV export function
  const handleExportCSV = () => {
    if (data.length === 0) {
      message.warning(t('messages.noDataToExport'));
      return;
    }

    try {
      const visibleColumnKeys = getVisibleColumnKeys(visibleColumns);
      exportToCSV(data, {
        filename: t('table.productList'),
        visibleColumns: visibleColumnKeys,
        t
      });
      message.success(t('messages.exportSuccess', { count: data.length }));
    } catch (error) {
      console.error('CSV export error:', error);
      message.error(t('messages.exportFailed'));
    }
  };

  // CSV import handlers
  const handleImportCSV = () => {
    if (!onImport) {
      message.warning('Import functionality not available');
      return;
    }
    setIsImportModalVisible(true);
  };

  const handleFileUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      setIsProcessing(true);
      const csvContent = await importCSVFile(file as File);
      const result = parseCSV(csvContent, { t });
      setImportResult(result);

      if (onSuccess) {
        onSuccess('ok');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(t('csvImport.processingFailed', { error: errorMessage }));
      if (onError) {
        onError(new Error(errorMessage));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length === 0) {
      setImportResult(null);
    }
  };

  const handleImportConfirm = async () => {
    if (!importResult || importResult.success.length === 0 || !onImport) {
      message.warning(t('csvImport.noValidProducts'));
      return;
    }

    try {
      setIsImporting(true);
      await onImport(importResult.success);
      message.success(t('csvImport.importSuccess', { count: importResult.success.length }));
      setIsImportModalVisible(false);
      setFileList([]);
      setImportResult(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(t('csvImport.importFailed', { error: errorMessage }));
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = generateCSVTemplate(t);
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${t('csvImport.templateFilename')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns: TableColumnsType<Product> = [
    {
      title: t('table.id'),
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (id: number) => (
        <Typography.Text type="secondary">#{id}</Typography.Text>
      ),
    },
    {
      title: t('table.title'),
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
      filters: filterOptions.titles,
      onFilter: (value, record) => record.title === value,
      filterSearch: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title: string) => (
        <Typography.Text strong>{title}</Typography.Text>
      ),
    },
    {
      title: t('table.brand'),
      dataIndex: "brand",
      key: "brand",
      width: 120,
      filters: filterOptions.brands,
      onFilter: (value, record) => record.brand === value,
      sorter: (a, b) => a.brand.localeCompare(b.brand),
      render: (brand: string) => (
        <Tag color="blue">{brand}</Tag>
      ),
    },
    {
      title: t('table.type'),
      dataIndex: "type",
      key: "type",
      width: 120,
      filters: filterOptions.types,
      onFilter: (value, record) => record.type === value,
      sorter: (a, b) => a.type.localeCompare(b.type),
      render: (type: string) => (
        <Tag color="green">{type}</Tag>
      ),
    },
    {
      title: t('table.originalPrice'),
      dataIndex: "originalPrice",
      key: "originalPrice",
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.originalPrice || 0) - (b.originalPrice || 0),
      render: (originalPrice: number) => (
        originalPrice ? (
          <Typography.Text style={{ color: '#8c8c8c', textDecoration: 'line-through' }}>
            ¥{originalPrice.toFixed(2)}
          </Typography.Text>
        ) : '-'
      ),
    },
    {
      title: t('table.price'),
      dataIndex: "price",
      key: "price",
      width: 100,
      align: 'right',
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <Typography.Text strong style={{ color: '#f5222d' }}>
          ¥{typeof price === 'number' ? price.toFixed(2) : '0.00'}
        </Typography.Text>
      ),
    },
    {
      title: t('table.discount'),
      dataIndex: "discount",
      key: "discount",
      width: 120,
      render: (discount: string) => {
        if (!discount) return '-';
        try {
          const discountData = JSON.parse(discount);
          return (
            <Space direction="vertical" size="small" style={{ fontSize: '12px' }}>
              {discountData.map((item: any, index: number) => (
                <Tag key={index} color="orange" style={{ fontSize: '11px', margin: 0 }}>
                  {item.discountOwner}: {item.discountType} {item.discountValue}
                </Tag>
              ))}
            </Space>
          );
        } catch {
          return <Typography.Text type="secondary">{discount}</Typography.Text>;
        }
      },
    },
    {
      title: t('table.url'),
      dataIndex: "address",
      key: "address",
      width: 60,
      align: 'center',
      render: (address: string) => {
        if (!address) return '-';

        if (isUrl(address)) {
          // Display as clickable link icon for URLs with tooltip
          return (
            <Button
              type="text"
              size="small"
              icon={<LinkOutlined />}
              onClick={() => openExternalUrl(address, (msg) => message.warning(msg))}
              title={address}
              style={{ padding: 4 }}
            />
          );
        } else {
          // Display as clickable address icon for shop addresses
          return (
            <Button
              type="text"
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(address);
                message.success(t('messages.addressCopied'));
              }}
              title={address}
              style={{ padding: 4 }}
            />
          );
        }
      },
    },
    {
      title: t('table.specification'),
      dataIndex: "specification",
      key: "specification",
      width: 150,
      ellipsis: true,
      render: (specification: string) => (
        <Typography.Text type="secondary">
          {specification || '-'}
        </Typography.Text>
      ),
    },
    {
      title: t('table.date'),
      dataIndex: "date",
      key: "date",
      width: 120,
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      render: (date: string) => (
        <Typography.Text>
          {date ? dayjs(date).format('YYYY-MM-DD') : '-'}
        </Typography.Text>
      ),
    },
    {
      title: t('table.remark'),
      dataIndex: "remark",
      key: "remark",
      width: 150,
      ellipsis: true,
      render: (remark: string) => (
        <Typography.Text type="secondary">
          {remark || '-'}
        </Typography.Text>
      ),
    },
    {
      title: t('table.createdAt'),
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      sorter: (a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf(),
      render: (created_at: string) => (
        <Typography.Text type="secondary">
          {created_at ? dayjs(created_at).format('YYYY-MM-DD HH:mm') : '-'}
        </Typography.Text>
      ),
    },
    {
      title: t('table.actions'),
      key: "action",
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {onEdit && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              title={t('table.editProduct')}
            />
          )}
          {onDelete && record.id && (
            <Popconfirm
              title={t('table.confirmDelete')}
              description={t('table.confirmDeleteDesc')}
              onConfirm={() => onDelete(record.id!)}
              okText={t('table.confirm')}
              cancelText={t('table.cancel')}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                title={t('table.deleteProduct')}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Filter columns based on visibility settings
  const filteredColumns = useMemo(() => {
    if (!visibleColumns) return columns;
    
    const visibilityMap = visibleColumns.reduce((acc, col) => {
      acc[col.key] = col.visible;
      return acc;
    }, {} as Record<string, boolean>);

    return columns.filter(column => {
      const key = column.key as string;
      return visibilityMap[key] !== false; // Show column if not explicitly hidden
    });
  }, [columns, visibleColumns]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t('table.productList')} ({data.length} {t('table.items')})
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            {onImport && (
              <Button
                type="default"
                icon={<UploadOutlined />}
                onClick={handleImportCSV}
              >
                {t('table.importCSV')}
              </Button>
            )}
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              disabled={data.length === 0}
            >
              {t('table.exportCSV')}
            </Button>
            {columnController}
          </Space>
        </Col>
      </Row>
      <Table<Product>
        columns={filteredColumns}
        dataSource={data}
        rowKey={(record) => record.id?.toString() || record.address}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          responsive: true,
          showTotal: (total, range) =>
            t('table.paginationTotal', { start: range[0], end: range[1], total }),
        }}
        scroll={{ x: 1200 }}
        size="middle"
        bordered={false}
      />

      {/* CSV Import Modal */}
      <Modal
        title={t('csvImport.title')}
        open={isImportModalVisible}
        onCancel={() => {
          setIsImportModalVisible(false);
          setFileList([]);
          setImportResult(null);
        }}
        width={800}
        footer={[
          <Button
            key="template"
            icon={<DownloadOutlined />}
            onClick={downloadTemplate}
          >
            {t('csvImport.downloadTemplate')}
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setIsImportModalVisible(false);
              setFileList([]);
              setImportResult(null);
            }}
          >
            {t('csvImport.cancel')}
          </Button>,
          <Button
            key="import"
            type="primary"
            loading={isImporting}
            disabled={!importResult || importResult.success.length === 0}
            onClick={handleImportConfirm}
          >
            {t('csvImport.import', { count: importResult?.success.length || 0 })}
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message={t('csvImport.instructions')}
            description={
              <div>
                <Paragraph style={{ margin: '8px 0' }}>
                  {t('csvImport.description')}
                </Paragraph>
                <Text code>{t('csvImport.columns')}</Text>
                <Paragraph style={{ margin: '8px 0 4px 0', whiteSpace: 'pre-line' }}>
                  {t('csvImport.requirements')}
                </Paragraph>
              </div>
            }
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
          />

          <Upload
            accept=".csv"
            fileList={fileList}
            customRequest={handleFileUpload}
            onChange={handleFileChange}
            maxCount={1}
          >
            <Button
              icon={<UploadOutlined />}
              loading={isProcessing}
              disabled={isProcessing}
            >
              {isProcessing ? t('csvImport.processing') : t('csvImport.selectFile')}
            </Button>
          </Upload>

          {importResult && (
            <>
              <Divider />

              {importResult.success.length > 0 && (
                <div>
                  <Typography.Title level={5} style={{ color: '#52c41a', margin: '0 0 16px 0' }}>
                    ✅ {t('csvImport.readyToImport', { count: importResult.success.length })}
                  </Typography.Title>
                  <Table
                    columns={[
                      { title: t('table.title'), dataIndex: 'title', key: 'title', ellipsis: true },
                      { title: t('table.brand'), dataIndex: 'brand', key: 'brand', width: 120 },
                      { title: t('table.type'), dataIndex: 'type', key: 'type', width: 100 },
                      { title: t('table.price'), dataIndex: 'price', key: 'price', width: 100, render: (price: number) => `$${price.toFixed(2)}` },
                    ]}
                    dataSource={importResult.success.map((item, index) => ({ ...item, key: index }))}
                    pagination={{ pageSize: 5, size: 'small' }}
                    size="small"
                    scroll={{ y: 200 }}
                  />
                </div>
              )}

              {importResult.errors.length > 0 && (
                <div>
                  <Typography.Title level={5} style={{ color: '#ff4d4f', margin: '16px 0 16px 0' }}>
                    ❌ {t('csvImport.errorsFound', { count: importResult.errors.length })}
                  </Typography.Title>
                  <Table
                    columns={[
                      { title: 'Row', dataIndex: 'row', key: 'row', width: 80 },
                      { title: 'Error', dataIndex: 'error', key: 'error', ellipsis: true },
                    ]}
                    dataSource={importResult.errors.map((error, index) => ({ ...error, key: index }))}
                    pagination={{ pageSize: 5, size: 'small' }}
                    size="small"
                    scroll={{ y: 200 }}
                  />
                </div>
              )}
            </>
          )}
        </Space>
      </Modal>
    </Space>
  );
};

export default ProductTable;
