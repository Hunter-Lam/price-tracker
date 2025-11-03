import React, { useMemo, useState } from "react";
import { Table, TableColumnsType, Typography, Space, Button, Popconfirm, Row, Col, App, Modal, Upload, Alert, Divider } from "antd";
import { LinkOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, InfoCircleOutlined, EditOutlined, EnvironmentOutlined, CopyOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { Product, ProductInput } from "../types";
import { ColumnConfig } from "./ColumnController";
import { exportToCSV, getVisibleColumnKeys } from "../utils/csvExport";
import { parseCSV, importCSVFile, generateCSVTemplate, type CSVImportResult } from "../utils/csvImport";
import { openExternalUrl } from "../utils/openUrl";
import { calculatePricePerJin, isConvertibleToJin, ceilToTwo, translateUnit } from "../utils/unitConversion";
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

  // Page size state with localStorage persistence
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = localStorage.getItem('productTablePageSize');
    return saved ? parseInt(saved, 20) : 20;
  });

  // Save page size to localStorage when it changes
  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    localStorage.setItem('productTablePageSize', size.toString());
  };

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

  // Specification modal state
  const [specModalVisible, setSpecModalVisible] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<string>('');
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
      width: 50,
      render: (id: number) => (
        <Typography.Text type="secondary">#{id}</Typography.Text>
      ),
    },
    {
      title: t('table.title'),
      dataIndex: "title",
      key: "title",
      width: 180,
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
      width: 100,
      filters: filterOptions.brands,
      onFilter: (value, record) => record.brand === value,
      sorter: (a, b) => a.brand.localeCompare(b.brand),
      render: (brand: string) => (
        <Typography.Text>{brand}</Typography.Text>
      ),
    },
    {
      title: t('table.type'),
      dataIndex: "type",
      key: "type",
      width: 90,
      filters: filterOptions.types,
      onFilter: (value, record) => record.type === value,
      sorter: (a, b) => a.type.localeCompare(b.type),
      render: (type: string) => (
        <Typography.Text>{type}</Typography.Text>
      ),
    },
    {
      title: t('table.originalPrice'),
      dataIndex: "originalPrice",
      key: "originalPrice",
      width: 85,
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
      width: 85,
      align: 'right',
      sorter: (a, b) => a.price - b.price,
      render: (price: number, record: Product) => {
        const hasOriginalPrice = record.originalPrice && record.originalPrice > 0;
        const hasDifference = hasOriginalPrice && record.originalPrice! > price;
        const pricePercentage = hasDifference
          ? (Math.ceil(price / record.originalPrice! * 1000) / 10).toFixed(1)
          : null;

        return (
          <div>
            <Typography.Text strong style={{ color: '#f5222d' }}>
              ¥{typeof price === 'number' ? price.toFixed(2) : '0.00'}
            </Typography.Text>
            {pricePercentage && (
              <div style={{ fontSize: '11px', color: '#52c41a' }}>
                {pricePercentage}%
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t('table.unitPrice'),
      key: "unitPrice",
      width: 110,
      align: 'right',
      sorter: (a, b) => {
        const unitPriceA = a.unitPrice || 0;
        const unitPriceB = b.unitPrice || 0;
        return unitPriceA - unitPriceB;
      },
      render: (_, record: Product) => {
        // Show saved unit price if available
        if (record.unitPrice && record.comparisonUnit) {
          const displayUnitPrice = ceilToTwo(record.unitPrice);
          const translatedComparisonUnit = translateUnit(record.comparisonUnit, t);
          const translatedUnit = record.unit ? translateUnit(record.unit, t) : '';

          return (
            <div>
              <div>
                <Typography.Text strong style={{ color: '#1890ff' }}>
                  ¥{displayUnitPrice.toFixed(2)}
                </Typography.Text>
                <Typography.Text style={{ fontSize: '11px', color: '#8c8c8c', marginLeft: '2px' }}>
                  /{translatedComparisonUnit}
                </Typography.Text>
              </div>
              {record.quantity && record.unit && (
                <div style={{ fontSize: '10px', color: '#bfbfbf', marginTop: '2px' }}>
                  ({record.quantity} {translatedUnit})
                </div>
              )}
            </div>
          );
        }

        // Fallback: calculate on-the-fly if no saved unit price (legacy records)
        if (record.quantity && record.quantity > 0 && record.unit) {
          const unitPrice = ceilToTwo(record.price / record.quantity);
          const pricePerJin = isConvertibleToJin(record.unit)
            ? calculatePricePerJin(record.price, record.quantity, record.unit)
            : null;
          const displayPricePerJin = pricePerJin !== null ? ceilToTwo(pricePerJin) : null;
          const translatedUnit = translateUnit(record.unit, t);

          return (
            <div>
              <div>
                <Typography.Text strong style={{ color: '#1890ff' }}>
                  ¥{unitPrice.toFixed(2)}
                </Typography.Text>
                <Typography.Text style={{ fontSize: '11px', color: '#8c8c8c', marginLeft: '2px' }}>
                  /{translatedUnit}
                </Typography.Text>
              </div>
              {displayPricePerJin !== null && record.unit !== 'jin' && (
                <div style={{ fontSize: '11px', color: '#52c41a', marginTop: '2px' }}>
                  ≈¥{displayPricePerJin.toFixed(2)}/{translateUnit('jin', t)}
                </div>
              )}
              <div style={{ fontSize: '10px', color: '#bfbfbf', marginTop: '2px' }}>
                {record.quantity} {translatedUnit}
              </div>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: t('table.discount'),
      dataIndex: "discount",
      key: "discount",
      width: 160,
      render: (discount: string) => {
        if (!discount) return '-';
        try {
          const discountData = JSON.parse(discount);
          return (
            <div style={{ fontSize: '12px' }}>
              {discountData.map((item: any, index: number) => (
                <div key={index} style={{ marginBottom: index < discountData.length - 1 ? '4px' : 0 }}>
                  {item.discountOwner}: {item.discountType} {item.discountValue}
                </div>
              ))}
            </div>
          );
        } catch {
          return <Typography.Text>{discount}</Typography.Text>;
        }
      },
    },
    {
      title: t('table.specification'),
      dataIndex: "specification",
      key: "specification",
      width: 140,
      render: (specification: string) => {
        if (!specification) return '-';
        return (
          <Paragraph
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              cursor: 'pointer'
            }}
            ellipsis={{ rows: 3 }}
            onClick={() => {
              setSelectedSpec(specification);
              setSpecModalVisible(true);
            }}
          >
            {specification}
          </Paragraph>
        );
      },
    },
    {
      title: t('table.date'),
      dataIndex: "date",
      key: "date",
      width: 105,
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
      width: 140,
      render: (remark: string) => (
        <Paragraph
          type="secondary"
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
          ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
        >
          {remark || '-'}
        </Paragraph>
      ),
    },
    {
      title: t('table.createdAt'),
      dataIndex: "created_at",
      key: "created_at",
      width: 130,
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
          {record.address && (
            isUrl(record.address) ? (
              <Button
                type="text"
                size="small"
                icon={<LinkOutlined />}
                onClick={() => openExternalUrl(record.address, (msg) => message.warning(msg))}
                title={record.address}
              />
            ) : (
              <Button
                type="text"
                size="small"
                icon={<EnvironmentOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(record.address);
                  message.success(t('messages.addressCopied'));
                }}
                title={record.address}
              />
            )
          )}
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
          pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          responsive: true,
          showTotal: (total, range) =>
            t('table.paginationTotal', { start: range[0], end: range[1], total }),
          onShowSizeChange: handlePageSizeChange,
        }}
        scroll={{ x: 1385 }}
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

      {/* Specification Modal */}
      <Modal
        title={
          <Space>
            {t('table.specification')}
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(selectedSpec);
                message.success(t('messages.specificationCopied'));
              }}
            />
          </Space>
        }
        open={specModalVisible}
        onCancel={() => setSpecModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        <Paragraph
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '60vh',
            overflowY: 'auto'
          }}
        >
          {selectedSpec}
        </Paragraph>
      </Modal>
    </Space>
  );
};

export default ProductTable;
