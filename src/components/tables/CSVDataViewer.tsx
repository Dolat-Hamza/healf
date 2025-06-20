import React, { useState, useMemo } from 'react';
import { Card, Tabs, Button, Upload, message, Statistic, Row, Col, Alert } from 'antd';
import { UploadOutlined, TableOutlined, BarChartOutlined, FileTextOutlined, WarningOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { EnhancedDataTable } from './EnhancedDataTable';
import { ChartDashboard } from '../charts/ChartDashboard';
import { PerformanceMonitor } from '../performance/PerformanceMonitor';
import { parseCSVToProducts } from '../../lib/csv-parser';
import { useCSVPerformance } from '../../hooks/useCSVPerformance';
import { Product } from '../../types/product';



interface CSVDataViewerProps {
  initialData?: Record<string, unknown>[];
  onDataChange?: (data: Record<string, unknown>[]) => void;
}

export const CSVDataViewer: React.FC<CSVDataViewerProps> = ({ 
  initialData = [], 
  onDataChange 
}) => {
  const [rawData, setRawData] = useState<Record<string, unknown>[]>(initialData);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('table');

  const {
    processedData,
    isLimited,
    totalRows,
    visibleRows,
    loadNextChunk,
    hasMoreChunks
  } = useCSVPerformance(rawData, {
    chunkSize: 500,
    maxRows: 2000,
    enableVirtualization: true
  });

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      
      const firstLine = text.split('\n')[0];
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const delimiter = tabCount > commaCount ? '\t' : ',';
      
      console.log('Detected delimiter:', delimiter === '\t' ? 'TAB' : 'COMMA');
      
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        delimiter: delimiter,
        quoteChar: '"',
        escapeChar: '"',
      });

      if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
      }

      const data = result.data as Record<string, unknown>[];
      console.log('Parsed headers:', Object.keys(data[0] || {}));
      console.log('Sample row:', data[0]);

      setRawData(data);
      onDataChange?.(data);

      try {
        const parsedProducts = parseCSVToProducts(text);
        setProducts(parsedProducts);
        console.log('Successfully parsed as products:', parsedProducts.length);
      } catch (error) {
        console.warn('Could not parse as products:', error);
        setProducts([]);
      }

      message.success(`Successfully loaded ${data.length} rows`);
    } catch (error) {
      message.error('Failed to parse CSV file');
      console.error('CSV parsing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    accept: '.csv',
    beforeUpload: (file: File) => {
      handleFileUpload(file);
      return false;
    },
    showUploadList: false,
  };

  const stats = useMemo(() => {
    if (rawData.length === 0) return null;

    const totalRows = rawData.length;
    const totalColumns = Object.keys(rawData[0] || {}).length;
    const jsonColumns = Object.keys(rawData[0] || {}).filter(key => {
      const sampleValue = rawData[0]?.[key];
      if (!sampleValue || typeof sampleValue !== 'string') return false;
      try {
        JSON.parse(sampleValue);
        return true;
      } catch {
        return false;
      }
    }).length;

    const htmlColumns = Object.keys(rawData[0] || {}).filter(key => {
      const sampleValue = rawData[0]?.[key];
      return sampleValue && typeof sampleValue === 'string' && /<[^>]*>/g.test(sampleValue);
    }).length;

    return { totalRows, totalColumns, jsonColumns, htmlColumns };
  }, [rawData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">CSV Data Viewer</h2>
            <p className="text-gray-600">
              Upload and visualize CSV data with smart rendering for JSON and HTML content
            </p>
          </div>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} type="primary" loading={loading}>
              Upload CSV File
            </Button>
          </Upload>
        </div>

        {stats && (
          <>
            <Row gutter={16} className="mt-4">
              <Col span={6}>
                <Statistic title="Total Rows" value={totalRows} />
              </Col>
              <Col span={6}>
                <Statistic title="Visible Rows" value={visibleRows} />
              </Col>
              <Col span={6}>
                <Statistic title="JSON Columns" value={stats.jsonColumns} />
              </Col>
              <Col span={6}>
                <Statistic title="HTML Columns" value={stats.htmlColumns} />
              </Col>
            </Row>
            
            {isLimited && (
              <Alert
                className="mt-4"
                message="Large Dataset Detected"
                description={`Your CSV has ${totalRows} rows. For optimal performance, we're showing ${visibleRows} rows. Use pagination and search to explore your data efficiently.`}
                type="warning"
                icon={<WarningOutlined />}
                showIcon
                action={
                  hasMoreChunks && (
                    <Button size="small" onClick={loadNextChunk}>
                      Load More Rows
                    </Button>
                  )
                }
              />
            )}
          </>
        )}
      </Card>

      {rawData.length > 0 && (
        <>
          <PerformanceMonitor
            dataSize={totalRows}
            isProcessing={loading}
            onOptimizationSuggestion={(suggestion: string) => {
              message.info(suggestion);
            }}
          />
          
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
            items={[
              {
                key: 'table',
                label: (
                  <span>
                    <TableOutlined />
                    Data Table
                  </span>
                ),
                children: (
                  <EnhancedDataTable 
                    data={processedData} 
                    loading={loading}
                    title="CSV Data with Smart Rendering"
                    maxRows={2000}
                    enableVirtualization={true}
                  />
                )
              },
              {
                key: 'charts',
                label: (
                  <span>
                    <BarChartOutlined />
                    Visualizations
                  </span>
                ),
                children: products.length > 0 ? (
                  <ChartDashboard products={products} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileTextOutlined className="text-4xl mb-4" />
                    <p>Chart visualizations are available when CSV data can be parsed as products</p>
                    <p className="text-sm">Upload a product CSV file to see charts and analytics</p>
                  </div>
                )
              }
            ]}
            />
          </Card>
        </>
      )}

      {rawData.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-500">
            <FileTextOutlined className="text-6xl mb-4" />
            <h3 className="text-lg font-medium mb-2">No Data Loaded</h3>
            <p>Upload a CSV file to start exploring your data</p>
          </div>
        </Card>
      )}
    </motion.div>
  );
};
