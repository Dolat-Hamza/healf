import React, { useState, useEffect } from 'react';
import { Card, Progress, Alert, Space, Typography } from 'antd';
import { motion } from 'framer-motion';

const { Text } = Typography;

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  rowsProcessed: number;
  isOptimized: boolean;
}

interface PerformanceMonitorProps {
  dataSize: number;
  isProcessing: boolean;
  onOptimizationSuggestion?: (suggestion: string) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  dataSize,
  isProcessing,
  onOptimizationSuggestion
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    rowsProcessed: 0,
    isOptimized: true
  });

  useEffect(() => {
    const startTime = performance.now();
    
    const updateMetrics = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const estimatedMemory = dataSize * 0.001; // KB per row estimate
      
      const newMetrics: PerformanceMetrics = {
        renderTime,
        memoryUsage: estimatedMemory,
        rowsProcessed: dataSize,
        isOptimized: dataSize <= 2000
      };
      
      setMetrics(newMetrics);
      
      if (dataSize > 5000 && onOptimizationSuggestion) {
        onOptimizationSuggestion(
          `Large dataset detected (${dataSize} rows). Consider enabling virtualization and pagination for better performance.`
        );
      }
    };
    
    if (!isProcessing) {
      updateMetrics();
    }
  }, [dataSize, isProcessing, onOptimizationSuggestion]);

  const getPerformanceStatus = () => {
    if (dataSize <= 1000) return { status: 'success', text: 'Excellent' };
    if (dataSize <= 2000) return { status: 'normal', text: 'Good' };
    if (dataSize <= 5000) return { status: 'warning', text: 'Fair' };
    return { status: 'exception', text: 'Needs Optimization' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card size="small" className="mb-4">
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <Text strong>Performance Monitor</Text>
            <Text type={performanceStatus.status === 'success' ? 'success' : 
                      performanceStatus.status === 'warning' ? 'warning' : 'danger'}>
              {performanceStatus.text}
            </Text>
          </div>
          
          <Progress
            percent={Math.min(100, (2000 / Math.max(dataSize, 1)) * 100)}
            status={performanceStatus.status as "success" | "normal" | "exception"}
            size="small"
            format={() => `${dataSize} rows`}
          />
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <Text type="secondary">Render Time</Text>
              <div>{metrics.renderTime.toFixed(2)}ms</div>
            </div>
            <div>
              <Text type="secondary">Memory Est.</Text>
              <div>{metrics.memoryUsage.toFixed(1)}KB</div>
            </div>
            <div>
              <Text type="secondary">Optimization</Text>
              <div>{metrics.isOptimized ? '✓ Active' : '⚠ Needed'}</div>
            </div>
          </div>
          
          {!metrics.isOptimized && (
            <Alert
              message="Performance Tip"
              description="Large dataset detected. Virtualization and pagination are automatically enabled to maintain smooth performance."
              type="info"
              showIcon
            />
          )}
        </Space>
      </Card>
    </motion.div>
  );
};
