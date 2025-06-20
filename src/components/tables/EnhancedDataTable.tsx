import React, { useState, useMemo } from 'react';
import { Table, Card, Input, Button, Space, Tag, Typography, Tooltip, Checkbox, Drawer, Select } from 'antd';
import { SearchOutlined, ExpandAltOutlined, CompressOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';


const { Text, Paragraph } = Typography;

interface DataRow {
  [key: string]: unknown;
}

interface EnhancedDataTableProps {
  data: DataRow[];
  loading?: boolean;
  title?: string;
  maxRows?: number;
  enableVirtualization?: boolean;
}

const JsonRenderer: React.FC<{ value: unknown; maxDepth?: number; currentDepth?: number }> = ({ 
  value, 
  maxDepth = 2, 
  currentDepth = 0 
}) => {
  const [expanded, setExpanded] = useState(false);

  if (currentDepth >= maxDepth) {
    return <Text type="secondary" className="text-xs">...</Text>;
  }

  if (typeof value === 'object' && value !== null) {
    const isArray = Array.isArray(value);
    const preview = isArray ? `Array(${value.length})` : `Object(${Object.keys(value).length})`;
    const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0;

    if (isEmpty) {
      return <Text type="secondary" className="text-xs">{preview}</Text>;
    }

    return (
      <div className="json-renderer max-w-xs">
        <Button
          type="link"
          size="small"
          icon={expanded ? <CompressOutlined /> : <ExpandAltOutlined />}
          onClick={() => setExpanded(!expanded)}
          className="p-0 h-auto text-xs"
        >
          <Tag color="blue" className="text-xs">{preview}</Tag>
        </Button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 mt-1 border-l-2 border-blue-200 pl-2 bg-blue-50 rounded text-xs max-h-40 overflow-y-auto"
            >
              {isArray ? (
                value.slice(0, 5).map((item: unknown, index: number) => (
                  <div key={index} className="mb-1 text-xs">
                    <Text type="secondary" className="text-xs">[{index}]: </Text>
                    <JsonRenderer 
                      value={item} 
                      maxDepth={maxDepth} 
                      currentDepth={currentDepth + 1} 
                    />
                  </div>
                ))
              ) : (
                Object.entries(value).slice(0, 5).map(([key, val]) => (
                  <div key={key} className="mb-1 text-xs">
                    <Text strong className="text-xs">{key}: </Text>
                    <JsonRenderer 
                      value={val} 
                      maxDepth={maxDepth} 
                      currentDepth={currentDepth + 1} 
                    />
                  </div>
                ))
              )}
              {(isArray ? value.length > 5 : Object.keys(value).length > 5) && (
                <Text type="secondary" className="text-xs">... and more</Text>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (typeof value === 'string') {
    if (value.length > 50) {
      return (
        <Tooltip title={value}>
          <Text className="text-xs">{value.substring(0, 50)}...</Text>
        </Tooltip>
      );
    }
    return <Text className="text-xs">{value}</Text>;
  }

  if (typeof value === 'number') {
    return <Text type="success" className="text-xs">{value}</Text>;
  }

  if (typeof value === 'boolean') {
    return <Tag color={value ? 'green' : 'red'} className="text-xs">{value.toString()}</Tag>;
  }

  return <Text type="secondary" className="text-xs">{String(value)}</Text>;
};

const HtmlRenderer: React.FC<{ content: string }> = ({ content }) => {
  const [showRaw, setShowRaw] = useState(false);

  const isHtml = /<[^>]*>/g.test(content);

  if (!isHtml) {
    if (content.length > 100) {
      return (
        <Tooltip title={content}>
          <Text className="text-xs">{content.substring(0, 100)}...</Text>
        </Tooltip>
      );
    }
    return <Text className="text-xs">{content}</Text>;
  }

  const cleanText = content.replace(/<[^>]*>/g, '').trim();
  const preview = cleanText.length > 50 ? `${cleanText.substring(0, 50)}...` : cleanText;

  return (
    <div className="html-renderer max-w-xs">
      <div className="flex items-center gap-1 mb-1">
        <Tag color="orange" className="text-xs">HTML</Tag>
        <Button
          type="link"
          size="small"
          onClick={() => setShowRaw(!showRaw)}
          className="text-xs p-0 h-auto"
        >
          {showRaw ? 'Hide' : 'View'}
        </Button>
      </div>
      <div className="text-xs text-gray-600 mb-1">{preview}</div>
      <AnimatePresence>
        {showRaw && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-orange-200 rounded p-2 bg-orange-50 max-h-32 overflow-y-auto"
          >
            <Paragraph code className="whitespace-pre-wrap text-xs mb-0">
              {content}
            </Paragraph>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CellRenderer: React.FC<{ value: unknown }> = ({ value }) => {
  if (value === null || value === undefined) {
    return <Text type="secondary">null</Text>;
  }

  const stringValue = String(value);

  try {
    const parsed = JSON.parse(stringValue);
    if (typeof parsed === 'object') {
      return <JsonRenderer value={parsed} />;
    }
  } catch {
  }

  if (/<[^>]*>/g.test(stringValue)) {
    return <HtmlRenderer content={stringValue} />;
  }

  if (stringValue.startsWith('http://') || stringValue.startsWith('https://')) {
    return (
      <a href={stringValue} target="_blank" rel="noopener noreferrer" className="text-blue-600">
        {stringValue.length > 50 ? `${stringValue.substring(0, 50)}...` : stringValue}
      </a>
    );
  }

  if (stringValue.includes('@') && stringValue.includes('.')) {
    return <Text type="secondary">{stringValue}</Text>;
  }

  if (!isNaN(Date.parse(stringValue)) && stringValue.includes('T')) {
    return (
      <Tooltip title={new Date(stringValue).toLocaleString()}>
        <Text type="secondary">{new Date(stringValue).toLocaleDateString()}</Text>
      </Tooltip>
    );
  }

  if (stringValue.length > 100) {
    return (
      <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
        {stringValue}
      </Paragraph>
    );
  }

  return <Text>{stringValue}</Text>;
};

export const EnhancedDataTable: React.FC<EnhancedDataTableProps> = ({ 
  data, 
  loading = false, 
  title = "Data Table",
  maxRows = 1000,
  enableVirtualization = true
}) => {
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [columnView, setColumnView] = useState<'all' | 'essential' | 'custom'>('essential');

  const allColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const essentialColumns = useMemo(() => {
    const essential = ['ID', 'TITLE', 'VENDOR', 'STATUS', 'PRICE_RANGE_V2', 'PRODUCT_TYPE', 'CREATED_AT'];
    return allColumns.filter(col => 
      essential.some(ess => col.toUpperCase().includes(ess)) ||
      !col.startsWith('_AIRBYTE') && !col.includes('DELETED') && !col.includes('LEGACY')
    ).slice(0, 8);
  }, [allColumns]);

  const visibleColumns = useMemo(() => {
    let cols = allColumns;
    if (columnView === 'essential') {
      cols = essentialColumns;
    }
    return cols.filter(col => !hiddenColumns.has(col));
  }, [allColumns, essentialColumns, hiddenColumns, columnView]);

  const columns: ColumnsType<DataRow> = useMemo(() => {
    if (data.length === 0) return [];

    return visibleColumns.map((key) => {
      const isJsonColumn = data.some(row => {
        const value = row[key];
        if (!value || typeof value !== 'string') return false;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      });

      const isHtmlColumn = data.some(row => {
        const value = row[key];
        return value && typeof value === 'string' && /<[^>]*>/g.test(value);
      });

      return {
        title: (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {isJsonColumn && <Tag color="blue" className="text-xs">JSON</Tag>}
            {isHtmlColumn && <Tag color="orange" className="text-xs">HTML</Tag>}
          </div>
        ),
        dataIndex: key,
        key,
        width: isJsonColumn || isHtmlColumn ? 250 : 150,
        render: (value: unknown) => <CellRenderer value={value} />,
        sorter: (a: DataRow, b: DataRow) => {
          const aVal = String(a[key] || '');
          const bVal = String(b[key] || '');
          return aVal.localeCompare(bVal);
        },
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div className="p-2">
            <Input
              placeholder={`Search ${key}`}
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
              className="mb-2"
              size="small"
            />
            <Space>
              <Button
                type="primary"
                onClick={() => confirm()}
                icon={<SearchOutlined />}
                size="small"
              >
                Search
              </Button>
              <Button onClick={() => clearFilters?.()} size="small">
                Reset
              </Button>
            </Space>
          </div>
        ),
        onFilter: (value: unknown, record: DataRow) =>
          String(record[key] || '').toLowerCase().includes(String(value).toLowerCase()),
      };
    });
  }, [data, visibleColumns]);

  const processedData = useMemo(() => {
    let result = data;
    
    if (result.length > maxRows) {
      console.warn(`Dataset has ${result.length} rows, limiting to ${maxRows} for performance`);
      result = result.slice(0, maxRows);
    }
    
    if (searchText) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value || '').toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    
    return result;
  }, [data, searchText, maxRows]);

  const paginatedData = useMemo(() => {
    if (!enableVirtualization) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize, enableVirtualization]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        title={title}
        extra={
          <Space>
            <Input
              placeholder="Search all columns..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={enableVirtualization ? paginatedData : processedData}
          loading={loading}
          rowKey={(record, index) => index?.toString() || '0'}
          scroll={{ x: 'max-content', y: 600 }}
          pagination={enableVirtualization ? {
            current: currentPage,
            pageSize,
            total: processedData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items${data.length > maxRows ? ` (limited from ${data.length})` : ''}`,
            pageSizeOptions: ['10', '25', '50', '100'],
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            onChange: (page) => setCurrentPage(page),
          } : false}
          size="small"
          bordered
        />

        <Drawer
          title="Column Settings"
          placement="right"
          onClose={() => setColumnSettingsOpen(false)}
          open={columnSettingsOpen}
          width={400}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">View Mode</h4>
              <Select
                value={columnView}
                onChange={(value) => {
                  setColumnView(value);
                  if (value !== 'custom') {
                    setHiddenColumns(new Set());
                  }
                }}
                style={{ width: '100%' }}
                options={[
                  { label: 'Essential Columns Only', value: 'essential' },
                  { label: 'All Columns', value: 'all' },
                  { label: 'Custom Selection', value: 'custom' }
                ]}
              />
            </div>

            {columnView === 'custom' && (
              <div>
                <h4 className="font-medium mb-2">Select Columns to Show</h4>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {allColumns.map(col => (
                    <div key={col} className="flex items-center">
                      <Checkbox
                        checked={!hiddenColumns.has(col)}
                        onChange={(e) => {
                          const newHidden = new Set(hiddenColumns);
                          if (e.target.checked) {
                            newHidden.delete(col);
                          } else {
                            newHidden.add(col);
                          }
                          setHiddenColumns(newHidden);
                        }}
                      >
                        <span className="text-sm">
                          {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Column Types</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Tag color="blue">JSON</Tag>
                  <span>Expandable JSON objects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color="orange">HTML</Tag>
                  <span>HTML content with preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color="green">Essential</Tag>
                  <span>Key product information</span>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      </Card>
    </motion.div>
  );
};
