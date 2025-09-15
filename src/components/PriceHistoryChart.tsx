import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Typography, Space, Empty, AutoComplete, Button, Row, Col } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import dayjs from 'dayjs';

interface PriceHistoryChartProps {
  data: Product[];
}

interface ChartDataPoint {
  date: string;
  [key: string]: any; // Allow dynamic product price keys
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const [searchFilters, setSearchFilters] = useState({
    product: '',
    brand: '',
    type: ''
  });

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get filtered options based on current selections
  const filteredOptions = useMemo(() => {
    let filteredData = data;

    // Apply filters in order to get cascading options
    if (searchFilters.brand && searchFilters.brand !== '') {
      filteredData = filteredData.filter(item => 
        item.brand.toLowerCase().includes(searchFilters.brand.toLowerCase())
      );
    }

    if (searchFilters.type && searchFilters.type !== '') {
      filteredData = filteredData.filter(item => 
        item.type.toLowerCase().includes(searchFilters.type.toLowerCase())
      );
    }

    if (searchFilters.product && searchFilters.product !== '') {
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchFilters.product.toLowerCase())
      );
    }

    // Get available options based on current filters
    const availableBrands = Array.from(new Set(
      data.filter(item => {
        if (searchFilters.type && searchFilters.type !== '') {
          return item.type.toLowerCase().includes(searchFilters.type.toLowerCase());
        }
        if (searchFilters.product && searchFilters.product !== '') {
          return item.title.toLowerCase().includes(searchFilters.product.toLowerCase());
        }
        return true;
      }).map(item => item.brand)
    )).sort();

    const availableTypes = Array.from(new Set(
      data.filter(item => {
        if (searchFilters.brand && searchFilters.brand !== '') {
          return item.brand.toLowerCase().includes(searchFilters.brand.toLowerCase());
        }
        if (searchFilters.product && searchFilters.product !== '') {
          return item.title.toLowerCase().includes(searchFilters.product.toLowerCase());
        }
        return true;
      }).map(item => item.type)
    )).sort();

    const availableProducts = Array.from(new Set(
      data.filter(item => {
        if (searchFilters.brand && searchFilters.brand !== '') {
          return item.brand.toLowerCase().includes(searchFilters.brand.toLowerCase());
        }
        if (searchFilters.type && searchFilters.type !== '') {
          return item.type.toLowerCase().includes(searchFilters.type.toLowerCase());
        }
        return true;
      }).map(item => item.title)
    )).sort();

    return {
      brands: availableBrands,
      types: availableTypes,
      products: availableProducts
    };
  }, [data, searchFilters]);

  // Process data for chart
  const { chartData, productLines } = useMemo(() => {
    let filteredData = data;

    // Filter by brand
    if (searchFilters.brand && searchFilters.brand !== '') {
      filteredData = filteredData.filter(item => 
        item.brand.toLowerCase().includes(searchFilters.brand.toLowerCase())
      );
    }

    // Filter by type
    if (searchFilters.type && searchFilters.type !== '') {
      filteredData = filteredData.filter(item => 
        item.type.toLowerCase().includes(searchFilters.type.toLowerCase())
      );
    }

    // Filter by specific product
    if (searchFilters.product && searchFilters.product !== '') {
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchFilters.product.toLowerCase())
      );
    }

    // Individual mode: separate lines for each product
    const productGroups = filteredData
      .filter(item => item.date && item.price)
      .reduce((groups, item) => {
        const key = item.title;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
        return groups;
      }, {} as Record<string, Product[]>);

    // Get all unique dates
    const allDates = Array.from(new Set(
      filteredData.map(item => dayjs(item.date).format('YYYY-MM-DD'))
    )).sort();

    // Create chart data with separate columns for each product
    const processedData: ChartDataPoint[] = allDates.map(date => {
      const dataPoint: ChartDataPoint = { date };
      
      Object.entries(productGroups).forEach(([productTitle, products]) => {
        const productOnDate = products.find(p => dayjs(p.date).format('YYYY-MM-DD') === date);
        if (productOnDate) {
          dataPoint[productTitle] = Number(productOnDate.price);
        }
      });

      return dataPoint;
    });

    const productLinesList = Object.keys(productGroups);
    return { chartData: processedData, productLines: productLinesList };
  }, [data, searchFilters]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (chartData.length === 0) return { count: 0, average: 0, min: 0, max: 0 };
    
    let allPrices: number[] = [];
    
    // Collect all price values from all product lines
    chartData.forEach(item => {
      productLines.forEach(productLine => {
        if (item[productLine] != null) {
          allPrices.push(item[productLine]);
        }
      });
    });
    
    if (allPrices.length === 0) return { count: 0, average: 0, min: 0, max: 0 };
    
    const sum = allPrices.reduce((acc, price) => acc + price, 0);
    return {
      count: allPrices.length,
      average: sum / allPrices.length,
      min: Math.min(...allPrices),
      max: Math.max(...allPrices)
    };
  }, [chartData, productLines]);

  // Generate colors for different product lines
  const colors = ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#faad14', '#f5222d'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${t('priceHistory.date')}: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {`${entry.name}: ¥${entry.value?.toFixed(2) || 'N/A'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card title={t('priceHistory.title')} variant="outlined">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Search Filters */}
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text strong>{t('priceHistory.type')}</Typography.Text>
              <AutoComplete
                value={searchFilters.type}
                onChange={(value) => handleFilterChange('type', value)}
                placeholder={t('priceHistory.searchType')}
                allowClear
                options={filteredOptions.types.map(type => ({ value: type, label: type }))}
                filterOption={(inputValue, option) =>
                  option!.value.toString().toLowerCase().includes(inputValue.toLowerCase())
                }
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text strong>{t('priceHistory.brand')}</Typography.Text>
              <AutoComplete
                value={searchFilters.brand}
                onChange={(value) => handleFilterChange('brand', value)}
                placeholder={t('priceHistory.searchBrand')}
                allowClear
                options={filteredOptions.brands.map(brand => ({ value: brand, label: brand }))}
                filterOption={(inputValue, option) =>
                  option!.value.toString().toLowerCase().includes(inputValue.toLowerCase())
                }
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text strong>{t('priceHistory.productTitle')}</Typography.Text>
              <AutoComplete
                value={searchFilters.product}
                onChange={(value) => handleFilterChange('product', value)}
                placeholder={t('priceHistory.searchProduct')}
                allowClear
                options={filteredOptions.products.map(product => ({ value: product, label: product }))}
                filterOption={(inputValue, option) =>
                  option!.value.toString().toLowerCase().includes(inputValue.toLowerCase())
                }
                style={{ width: '100%' }}
              />
            </Space>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button 
              onClick={() => {
                setSearchFilters({
                  product: '',
                  brand: '',
                  type: ''
                });
              }}
              icon={<ClearOutlined />}
            >
              {t('priceHistory.clearAllFilters')}
            </Button>
          </Col>
        </Row>

        {/* Statistics */}
        {chartData.length > 0 && (searchFilters.type || searchFilters.brand || searchFilters.product) && (
          <Space wrap>
            <Typography.Text style={{ color: '#722ed1' }}>
              {t('priceHistory.dataPoints')}: {statistics.count}
            </Typography.Text>
            <Typography.Text style={{ color: '#1890ff' }}>
              {t('priceHistory.averagePrice')}: ¥{statistics.average.toFixed(2)}
            </Typography.Text>
            <Typography.Text style={{ color: '#52c41a' }}>
              {t('priceHistory.minPrice')}: ¥{statistics.min.toFixed(2)}
            </Typography.Text>
            <Typography.Text style={{ color: '#f5222d' }}>
              {t('priceHistory.maxPrice')}: ¥{statistics.max.toFixed(2)}
            </Typography.Text>
          </Space>
        )}

        {/* Chart */}
        {chartData.length > 0 && (searchFilters.type || searchFilters.brand || searchFilters.product) ? (
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => dayjs(value).format('MM-DD')}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `¥${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {productLines.map((productLine, index) => (
                  <Line 
                    key={productLine}
                    type="monotone" 
                    dataKey={productLine} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={2}
                    dot={{ 
                      fill: colors[index % colors.length], 
                      strokeWidth: 2, 
                      r: 3
                    }}
                    activeDot={{ 
                      r: 5, 
                      stroke: colors[index % colors.length], 
                      strokeWidth: 2
                    }}
                    name={productLine}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty 
            description={
              !searchFilters.type && !searchFilters.brand && !searchFilters.product 
                ? t('priceHistory.noFiltersSelected') 
                : t('priceHistory.noPriceData')
            }
            style={{ padding: '60px 0' }}
          />
        )}
      </Space>
    </Card>
  );
};

export default PriceHistoryChart;
