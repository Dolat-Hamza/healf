import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Product } from '../../types/product';

interface VendorDistributionChartProps {
  products: Product[];
}

export const VendorDistributionChart: React.FC<VendorDistributionChartProps> = ({ products }) => {
  const vendorCounts = products.reduce((acc, product) => {
    const vendor = product.vendor || 'Unknown';
    acc[vendor] = (acc[vendor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedVendors = Object.entries(vendorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const chartData = sortedVendors.map(([vendor, count], index) => ({
    name: vendor,
    y: count,
    color: colors[index % colors.length]
  }));

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      height: '100%'
    },
    title: {
      text: undefined
    },
    tooltip: {
      pointFormat: '<b>{point.name}</b>: {point.y} products ({point.percentage:.1f}%)'
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        },
        showInLegend: true,
        innerSize: '40%'
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal'
    },
    series: [{
      type: 'pie',
      name: 'Vendors',
      data: chartData
    }]
  };

  return (
    <div className="h-full">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};
