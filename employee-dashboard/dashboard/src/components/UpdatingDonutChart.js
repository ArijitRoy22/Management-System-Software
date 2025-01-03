// UpdatingDonutChart.js
import React from 'react';
import ReactApexChart from 'react-apexcharts';

class UpdatingDonutChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [44, 55, 13, 33],
      options: {
        chart: {
          width: 380,
          type: 'donut',
        },
        dataLabels: {
          enabled: false
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              show: false
            }
          }
        }],
        legend: {
          position: 'right',
          offsetY: 0,
          height: 230,
        }
      }
    };
  }

  appendData = () => {
    var arr = this.state.series.slice();
    arr.push(Math.floor(Math.random() * (100 - 1 + 1)) + 1);

    this.setState({
      series: arr
    });
  }

  removeData = () => {
    if (this.state.series.length === 1) return;

    var arr = this.state.series.slice();
    arr.pop();

    this.setState({
      series: arr
    });
  }

  randomize = () => {
    this.setState({
      series: this.state.series.map(function() {
        return Math.floor(Math.random() * (100 - 1 + 1)) + 1;
      })
    });
  }

  reset = () => {
    this.setState({
      series: [44, 55, 13, 33]
    });
  }

  render() {
    return (
      <div>
        <div>
          <div className="chart-wrap">
            <div id="chart">
              <ReactApexChart options={this.state.options} series={this.state.series} type="donut" width={380} />
            </div>
          </div>
          <div className="actions">
            <button onClick={this.appendData}>+ ADD</button>
            <button onClick={this.removeData}>- REMOVE</button>
            <button onClick={this.randomize}>RANDOMIZE</button>
            <button onClick={this.reset}>RESET</button>
          </div>
        </div>
        <div id="html-dist"></div>
      </div>
    );
  }
}

export default UpdatingDonutChart;
