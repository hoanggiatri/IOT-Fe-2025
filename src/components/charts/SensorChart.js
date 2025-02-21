import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register all required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const SensorChart = ({ title, data, color, unit }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${title} (${unit})`
      }
    },
    scales: {
      x: {
        type: 'category',
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        type: 'linear',
        display: true,
        beginAtZero: true,
        title: {
          display: true,
          text: title
        }
      }
    }
  };

  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: title,
        data: data.map(d => d.value),
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
        fill: false
      }
    ]
  };

  return (
    <div className="chart-container">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default SensorChart;