import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Product } from '../../types/product';

interface PriceRangeChartProps {
  products: Product[];
}

export const PriceRangeChart: React.FC<PriceRangeChartProps> = ({ products }) => {
  const priceRanges = [
    { label: '$0-$10', min: 0, max: 10 },
    { label: '$10-$25', min: 10, max: 25 },
    { label: '$25-$50', min: 25, max: 50 },
    { label: '$50-$100', min: 50, max: 100 },
    { label: '$100-$200', min: 100, max: 200 },
    { label: '$200+', min: 200, max: Infinity }
  ];

  const rangeCounts = priceRanges.map(range => {
    const count = products.filter(product => {
      const avgPrice = (product.priceRange.min + product.priceRange.max) / 2;
      return avgPrice >= range.min && avgPrice < range.max;
    }).length;
    return { name: range.label, count };
  });

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
      height: '100%'
    },
    title: {
      text: undefined
    },
    xAxis: {
      categories: rangeCounts.map(item => item.name),
      title: {
        text: 'Price Range'
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
      pointFormat: '<b>{point.y}</b> products in this price range'
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        color: '#10B981'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      type: 'column',
      name: 'Products',
      data: rangeCounts.map(item => item.count)
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
