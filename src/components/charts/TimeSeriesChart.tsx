import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Product } from '../../types/product';

interface TimeSeriesChartProps {
  products: Product[];
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ products }) => {
  const monthlyData = products.reduce((acc, product) => {
    if (product.createdAt) {
      const date = new Date(product.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const [year, monthNum] = month.split('-');
      return [Date.UTC(parseInt(year), parseInt(monthNum) - 1, 1), count];
    });

  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
      height: '100%'
    },
    title: {
      text: undefined
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Products Created'
      },
      min: 0,
      allowDecimals: false
    },
    tooltip: {
      headerFormat: '<b>{series.name}</b><br>',
      pointFormat: '{point.x:%e %b %Y}: {point.y} products'
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: true,
          radius: 4,
          lineColor: '#666666',
          lineWidth: 1
        },
        color: '#F59E0B'
      }
    },
    legend: {
      enabled: false
    },
    series: [{
      type: 'spline',
      name: 'Products Created',
      data: sortedData
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
