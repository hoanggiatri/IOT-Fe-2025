import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  FaThermometerHalf,
  FaTint,
  FaLightbulb,
  FaWind
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CHART_COLORS, SENSOR_UNITS } from '../utils/constants';
import '../styles/components/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({
    temperature: [],
    humidity: [],
    light: [],
    airQuality: []
  });

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setSensorData(prev => ({
        temperature: [...prev.temperature, {
          time: new Date().toLocaleTimeString(),
          value: Math.random() * 10 + 20 // 20-30°C
        }].slice(-10),
        humidity: [...prev.humidity, {
          time: new Date().toLocaleTimeString(),
          value: Math.random() * 20 + 40 // 40-60%
        }].slice(-10),
        light: [...prev.light, {
          time: new Date().toLocaleTimeString(),
          value: Math.random() * 500 + 100 // 100-600 lux
        }].slice(-10),
        airQuality: [...prev.airQuality, {
          time: new Date().toLocaleTimeString(),
          value: Math.random() * 100 + 50 // 50-150 AQI
        }].slice(-10)
      }));
    }, 2000);

    return () => clearInterval(updateInterval);
  }, []);

  const chartData = {
    labels: sensorData.temperature.map(d => d.time),
    datasets: [
      {
        label: `Temperature (${SENSOR_UNITS.temperature})`,
        data: sensorData.temperature.map(d => d.value),
        borderColor: CHART_COLORS.temperature,
        backgroundColor: CHART_COLORS.temperature,
        yAxisID: 'y',
      },
      {
        label: `Humidity (${SENSOR_UNITS.humidity})`,
        data: sensorData.humidity.map(d => d.value),
        borderColor: CHART_COLORS.humidity,
        backgroundColor: CHART_COLORS.humidity,
        yAxisID: 'y',
      },
      {
        label: `Light (${SENSOR_UNITS.light})`,
        data: sensorData.light.map(d => d.value),
        borderColor: CHART_COLORS.light,
        backgroundColor: CHART_COLORS.light,
        yAxisID: 'y',
      },
      {
        label: `Air Quality (${SENSOR_UNITS.airQuality})`,
        data: sensorData.airQuality.map(d => d.value),
        borderColor: CHART_COLORS.airQuality,
        backgroundColor: CHART_COLORS.airQuality,
        yAxisID: 'y',
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Sensor Data Overview',
        font: {
          size: 20 // Larger title font
        }
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14 // Larger legend font
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          font: {
            size: 12 // Larger axis labels
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12 // Larger axis labels
          }
        }
      }
    }
  };

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="card-temperature">
            <Statistic
              title="Temperature"
              value={sensorData.temperature[sensorData.temperature.length - 1]?.value.toFixed(1)}
              suffix="°C"
              prefix={<FaThermometerHalf />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-humidity">
            <Statistic
              title="Humidity"
              value={sensorData.humidity[sensorData.humidity.length - 1]?.value.toFixed(1)}
              suffix="%"
              prefix={<FaTint />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-light">
            <Statistic
              title="Light"
              value={sensorData.light[sensorData.light.length - 1]?.value.toFixed(1)}
              suffix="lux"
              prefix={<FaLightbulb />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-air-quality">
            <Statistic
              title="Air Quality"
              value={sensorData.airQuality[sensorData.airQuality.length - 1]?.value.toFixed(1)}
              suffix="AQI"
              prefix={<FaWind />}
            />
          </Card>
        </Col>
      </Row>
      <div className="chart-container">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default Dashboard;