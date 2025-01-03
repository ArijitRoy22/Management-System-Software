// GradientPieChart.js
// import React from 'react';
// import ReactApexChart from 'react-apexcharts';

// const GradientPieChart = ({ data, title }) => {
//   const series = data.map(item => item.value);
//   const labels = data.map(item => item.name);

//   const options = {
//     chart: {
//       type: 'donut',
//     },
//     plotOptions: {
//       pie: {
//         startAngle: -90,
//         endAngle: 270,
//         donut: {
//           size: '70%',
//           background: 'transparent',
//         },
//       },
//     },
//     fill: {
//       type: 'gradient',
//     },
//     dataLabels: {
//       enabled: false,
      
//     },
//     legend: {
//       position: 'bottom',
//       formatter: function(val, opts) {
//         return val + " - " + opts.w.globals.series[opts.seriesIndex]
//       }
//     },
//     labels,
//   };

//   return (
//     <div className="chart">
//       <ReactApexChart options={options} series={series} type="donut" height={400} />
//     </div>
//   );
// };

// export default GradientPieChart;


import React from 'react';
import ReactApexChart from 'react-apexcharts';

const GradientPieChart = ({ data, title }) => {
  const series = data.map(item => item.value);
  const labels = data.map(item => item.name);

  // Define a custom color palette to ensure uniqueness
  const colors = [
    '#008FFB', // Blue
    '#00E396', // Green
    '#FEB019', // Yellow
    '#FF4560', // Red
    '#775DD0', // Purple
    '#66DA26', // Lime Green
    '#546E7A', // Slate Gray
    '#F86624', // Orange
    '#D4AF37', // Gold
    '#A6206A', // Magenta
];


  const options = {
    chart: {
      type: 'donut',
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: {
          size: '70%',
          background: 'transparent',
        },
      },
    },
    fill: {
      type: 'gradient',
    },
    colors,  // Apply the custom color palette here
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'bottom',
      formatter: function (val, opts) {
        return val + " - " + opts.w.globals.series[opts.seriesIndex];
      },
    },
    labels,
  };

  return (
    <div className="chart">
      <ReactApexChart options={options} series={series} type="donut" height={400} />
    </div>
  );
};

export default GradientPieChart;
