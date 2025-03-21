import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Space, Button, Switch, Progress, Slider, Select } from 'antd';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { 
  ROOMS, 
  CHART_COLORS, 
  SENSOR_UNITS, 
  LIGHT_STANDARDS,
  SENSOR_THRESHOLDS,
  DEVICE_SETTINGS,
  SENSOR_ADVICE 
} from '../../utils/constants';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { 
  FireOutlined, 
  CloudOutlined, 
  BulbOutlined 
} from '@ant-design/icons';
import '../../styles/components/rooms/Room.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const Bedroom1 = () => {
  const room = ROOMS.BEDROOM_1;
  const [data, setData] = useState([]);
  const [deviceStates, setDeviceStates] = useState({
    light: { on: false, level: DEVICE_SETTINGS.light.defaultLevel },
    fan: { on: false, level: DEVICE_SETTINGS.fan.defaultLevel }
  });

  useEffect(() => {
    const fetchData = () => {
      const newData = {
        timestamp: new Date(),
        temperature: (Math.random() * 10 + 20).toFixed(1),
        humidity: (Math.random() * 20 + 40).toFixed(1),
        light: Math.floor(Math.random() * 500 + 100),
      };
      setData(prevData => [...prevData, newData].slice(-10));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSensorIcon = (sensor) => {
    switch(sensor) {
      case 'temperature':
        return <FireOutlined />;
      case 'humidity':
        return <CloudOutlined />;
      case 'light':
        return <BulbOutlined />;
      default:
        return null;
    }
  };

  const getSensorAdvice = (sensor, value) => {
    const advice = SENSOR_ADVICE[sensor];
    if (!advice) return '';

    if (sensor === 'light') {
      const standard = LIGHT_STANDARDS.BEDROOM_1;
      if (value < standard.min) return 'Light level is too low for sleeping area';
      if (value > standard.max) return 'Light level is too high for sleeping area';
      return 'Light level is optimal for bedroom';
    }

    const thresholds = SENSOR_THRESHOLDS.BEDROOM_1?.[sensor];
    if (!thresholds) return '';

    if (value < thresholds.min) return advice.tooLow;
    if (value > thresholds.max) return advice.tooHigh;
    return advice.optimal;
  };

  const renderSensorValue = (sensor, value) => {
    const advice = getSensorAdvice(sensor, value);
    const thresholds = sensor === 'light' 
      ? LIGHT_STANDARDS.BEDROOM_1 
      : SENSOR_THRESHOLDS.BEDROOM_1?.[sensor];

    const getProgressPercent = () => {
      if (sensor === 'light') return (value / thresholds.max) * 100;
      if (thresholds?.max) return (value / thresholds.max) * 100;
      return 0;
    };

    const getProgressStatus = () => {
      if (sensor === 'light') {
        if (value < thresholds.min || value > thresholds.max) return 'warning';
        return 'success';
      }

      if (!thresholds) return 'normal';

      if (value < thresholds.min || value > thresholds.max) return 'warning';
      if (value > thresholds.critical) return 'exception';
      return 'success';
    };

    const getProgressColor = () => {
      const status = getProgressStatus();
      switch (status) {
        case 'warning':
          return '#faad14';
        case 'exception':
          return '#ff4d4f';
        case 'success':
          return '#52c41a';
        default:
          return '#1890ff';
      }
    };

    return (
      <Card>
        <Statistic
          title={sensor.charAt(0).toUpperCase() + sensor.slice(1)}
          value={value}
          suffix={SENSOR_UNITS[sensor]}
          prefix={getSensorIcon(sensor)}
          valueStyle={{ 
            color: getProgressColor()
          }}
        />
        {advice && (
          <Progress 
            percent={Math.min(getProgressPercent(), 100)}
            strokeColor={getProgressColor()}
            showInfo={false}
            size="small"
            style={{ marginTop: 8 }}
          />
        )}
        {advice && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: 4, textAlign: 'center' }}>
            {advice}
          </div>
        )}
      </Card>
    );
  };

  const renderDeviceControl = (device) => {
    const settings = DEVICE_SETTINGS[device];
    const state = deviceStates[device];

    return (
      <Card size="small" title={device.replace('-', ' ').toUpperCase()}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Switch
            checked={state.on}
            onChange={(checked) => handleDeviceToggle(device, checked)}
          />
          {state.on && settings.type === 'dimmer' && (
            <Slider
              min={0}
              max={100}
              value={state.level}
              onChange={(value) => handleDeviceLevelChange(device, value)}
              marks={{ 0: '0%', 50: '50%', 100: '100%' }}
            />
          )}
          {state.on && settings.type === 'speed' && (
            <Select
              value={state.level}
              onChange={(value) => handleDeviceLevelChange(device, value)}
              style={{ width: '100%' }}
            >
              {settings.levels.map(level => (
                <Select.Option key={level} value={level}>
                  Speed {level}
                </Select.Option>
              ))}
            </Select>
          )}
        </Space>
      </Card>
    );
  };

  const handleDeviceToggle = (device, checked) => {
    setDeviceStates(prev => ({
      ...prev,
      [device]: { ...prev[device], on: checked }
    }));
  };

  const handleDeviceLevelChange = (device, value) => {
    setDeviceStates(prev => ({
      ...prev,
      [device]: { ...prev[device], level: value }
    }));
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bedroom 1 Sensor Data',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartData = {
    labels: data.map((_, index) => `${index + 1}m ago`),
    datasets: room.sensors.map(sensor => ({
      label: sensor.charAt(0).toUpperCase() + sensor.slice(1),
      data: data.map(d => d[sensor]),
      borderColor: CHART_COLORS[sensor],
      backgroundColor: CHART_COLORS[sensor],
      tension: 0.1
    }))
  };

  return (
    <div className="room-container">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Current Sensor Values">
            <Row gutter={[16, 16]}>
              {room.sensors.map(sensor => (
                <Col xs={24} sm={12} md={8} key={sensor}>
                  {renderSensorValue(
                    sensor, 
                    data[data.length - 1]?.[sensor] || 0
                  )}
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={18}>
              <Card 
                title={room.name}
                extra={<Button type="primary"><Link to={`/details/${room.id}`}>View Details</Link></Button>}
              >
                <div className="chart-container" style={{ height: '400px' }}>
                  <Line options={chartOptions} data={chartData} />
                </div>
              </Card>
            </Col>

            <Col span={6}>
              <Card title="Device Controls">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {room.devices.map(device => (
                    <div key={device}>
                      {renderDeviceControl(device)}
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Bedroom1;