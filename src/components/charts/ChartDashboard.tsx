import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { motion } from 'framer-motion';
import { Product } from '../../types/product';
import { VendorDistributionChart } from './VendorDistributionChart';
import { PriceRangeChart } from './PriceRangeChart';
import { ProductTypeChart } from './ProductTypeChart';
import { TimeSeriesChart } from './TimeSeriesChart';
import { InventoryChart } from './InventoryChart';

interface ChartDashboardProps {
  products: Product[];
}

export const ChartDashboard: React.FC<ChartDashboardProps> = ({ products }) => {
  const totalProducts = products.length;
  const totalVendors = new Set(products.map(p => p.vendor)).size;
  const avgPrice = products.reduce((sum, p) => sum + (p.priceRange.min + p.priceRange.max) / 2, 0) / products.length || 0;
  const totalInventory = products.reduce((sum, p) => sum + (p.totalInventory || 0), 0);

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center">
          <div className="text-gray-500">
            <div className="text-lg font-medium mb-2">No Data Available</div>
            <div className="text-sm">Upload a CSV file to see data visualizations</div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <Statistic
                title="Total Products"
                value={totalProducts}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <Statistic
                title="Unique Vendors"
                value={totalVendors}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <Statistic
                title="Average Price"
                value={avgPrice}
                precision={2}
                prefix="$"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <Statistic
                title="Total Inventory"
                value={totalInventory}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card title="Vendor Distribution" className="">
              <VendorDistributionChart products={products} />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card title="Product Types" className="">
              <ProductTypeChart products={products} />
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card title="Price Range Analysis" className="">
              <PriceRangeChart products={products} />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card title="Inventory Levels" className="">
              <InventoryChart products={products} />
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card title="Product Creation Timeline" className="">
          <TimeSeriesChart products={products} />
        </Card>
      </motion.div>
    </motion.div>
  );
};
