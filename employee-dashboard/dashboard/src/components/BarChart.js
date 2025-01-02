import React from 'react';
import ReactApexChart from 'react-apexcharts';

const BarChart = ({ data, title, columnWidth = '60%', text='Number of Employees' }) => {
  const categories = data.map(item => item.name);
  const seriesData = data.map(item => Math.round(item.value));

  const dynamicHeight = Math.max(400, data.length * 20); // Adjust height dynamically based on the number of items

  const options = {
    chart: {
      type: 'bar',
      height: dynamicHeight,
    },
    plotOptions: {
      bar: {
        horizontal: false, // Vertical bar chart
        columnWidth: columnWidth,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45, // Rotate labels for better readability
        maxHeight: 100, // Limit label height
        style: {
          fontSize: '10px', // Adjust font size
        },
        formatter: function(value) {
          return value.length > 10 ? value.substring(0, 10) + '...' : value; // Truncate long labels
        },
      },
      tooltip: {
        enabled: false, // Disable tooltips on x-axis labels
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
        },
      },
      title: {
        text: text,
      },
    },
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '18px',
      },
    },
    fill: {
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#66DA26', '#546E7A', '#D4526E', '#8D5B4C', '#F86624'],
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val, opts) {
          const fullLabel = categories[opts.dataPointIndex]; // Get the full label from categories
          return `${fullLabel}: ${val} employees`;
        },
        
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Remove grid lines
        },
      },
    },
  };

  const series = [
    {
      name: title,
      data: seriesData,
    },
  ];

  return (
    <div className="chart">
      <ReactApexChart options={options} series={series} type="bar" height={dynamicHeight}/>
    </div>
  );
};

export default BarChart;
