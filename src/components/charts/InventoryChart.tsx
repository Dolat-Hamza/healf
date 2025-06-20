import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Product } from '../../types/product';

interface InventoryChartProps {
  products: Product[];
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ products }) => {
  const inventoryRanges = [
    { label: 'Out of Stock', min: 0, max: 0 },
    { label: 'Low (1-10)', min: 1, max: 10 },
    { label: 'Medium (11-50)', min: 11, max: 50 },
    { label: 'High (51-100)', min: 51, max: 100 },
    { label: 'Very High (100+)', min: 101, max: Infinity }
  ];

  const inventoryCounts = inventoryRanges.map(range => {
    const count = products.filter(product => {
      const inventory = product.totalInventory;
      return inventory >= range.min && inventory <= range.max;
    }).length;
    return {
      name: range.label,
      y: count,
      color: range.min === 0 ? '#EF4444' : 
             range.min === 1 ? '#F59E0B' :
             range.min === 11 ? '#10B981' :
             range.min === 51 ? '#3B82F6' : '#8B5CF6'
    };
  });

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
          format: '<b>{point.name}</b>: {point.percentage:.1f}%'
        },
        showInLegend: true
      }
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal'
    },
    series: [{
      type: 'pie',
      name: 'Inventory Levels',
      data: inventoryCounts
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
