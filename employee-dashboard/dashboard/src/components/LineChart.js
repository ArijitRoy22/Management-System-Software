import React from 'react';
import Chart from 'react-apexcharts';

const convertToHoursAndMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hours ${mins} minutes`;
};

const convertToHoursAndMinutes1 = (minutes) => {
    const hours = Math.floor(minutes / 60);
    return `${hours} hours`;
};

const aggregateDailyHours = (data) => {
    const dailyTotal = data.reduce((acc, item) => {
        const date = item.date;
        const value = item.value;

        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += value;
        return acc;
    }, {});

    return Object.entries(dailyTotal).map(([date, value]) => ({
        date,
        value
    }));
};

const LineChart = ({ data, totalData, title, xaxisTitle, yaxisTitle, showTotalPoint, isDefault }) => {
    const aggregatedData = aggregateDailyHours(data);
    const uniqueDates = [...new Set(data.map(item => item.date))];

    const chartOptions = {
        chart: {
            type: 'line'
        },
        xaxis: {
            categories: uniqueDates,
            title: {
                text: xaxisTitle
            }
        },
        yaxis: {
            title: {
                text: yaxisTitle
            },
            labels: {
                formatter: (value) => convertToHoursAndMinutes1(value)
            }
        },
        title: {
            text: title
        },
        stroke: {
            curve: 'smooth'
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 5,
            colors: ['#FF4560', '#00E396']
        },
        series: [
            {
                name: 'Daily Time',
                data: uniqueDates.map(date => {
                    const entry = aggregatedData.find(item => item.date === date);
                    return entry ? entry.value : 0;
                }),
                color: '#00E396'
            },
            
        ],
        tooltip: {
            y: {
                formatter: (value) => convertToHoursAndMinutes(value)
            }
        }
    };

    // Handle case for default filter type
    if (isDefault) {
        
        const uniqueMonths = [...new Set(data.map(item => item.date && item.date.substring(0, 7)))].filter(month => month);
        chartOptions.xaxis.categories = uniqueMonths;
        chartOptions.series = [
            {
                name: 'Total Time',
                data: totalData.map(item => item.value),
                color: '#00E396'
            }
        ];
    }

    return (
        <div>
            <Chart options={chartOptions} series={chartOptions.series} type="line" height="350" />
        </div>
    );
};

export default LineChart;
