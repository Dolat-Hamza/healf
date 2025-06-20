import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Product } from '../../types/product';

interface ProductTypeChartProps {
  products: Product[];
}

export const ProductTypeChart: React.FC<ProductTypeChartProps> = ({ products }) => {
  const typeCounts = products.reduce((acc, product) => {
    const type = product.productType || 'Uncategorized';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      height: '100%'
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: sortedTypes.map(([type]) => type),
      labels: {
        rotation: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of Products'
      },
      allowDecimals: false
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> products'
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        color: '#1890ff'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      type: 'column',
      name: 'Products',
      data: sortedTypes.map(([, count]) => count)
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
