import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Space, Button, Switch, Progress, Select, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { 
  ROOMS, 
  CHART_COLORS, 
  SENSOR_UNITS, 
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
  ExperimentOutlined,
  AlertOutlined
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

const Kitchen = () => {
  const room = ROOMS.KITCHEN;
  const [data, setData] = useState([]);
  const [deviceStates, setDeviceStates] = useState({
    light: { on: false, level: DEVICE_SETTINGS.light.defaultLevel },
    fan: { on: false, level: DEVICE_SETTINGS.fan.defaultLevel },
    'exhaust-fan': { on: false, level: DEVICE_SETTINGS['exhaust-fan'].defaultLevel }
  });

  useEffect(() => {
    const fetchData = () => {
      const newData = {
        timestamp: new Date(),
        temperature: (Math.random() * 10 + 20).toFixed(1),
        humidity: (Math.random() * 20 + 40).toFixed(1),
        gas: Math.floor(Math.random() * 100),
        smoke: Math.floor(Math.random() * 100)
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
      case 'gas':
        return <ExperimentOutlined />;
      case 'smoke':
        return <AlertOutlined />;
      default:
        return null;
    }
  };

  const getSensorStatus = (sensor, value) => {
    const thresholds = SENSOR_THRESHOLDS.KITCHEN[sensor];
    if (!thresholds) return 'normal';

    if (sensor === 'gas' || sensor === 'smoke') {
      if (value > thresholds.danger) return 'exception';
      if (value > thresholds.warning) return 'warning';
      return 'success';
    }

    if (value < thresholds.min || value > thresholds.max) return 'warning';
    if (value > thresholds.critical) return 'exception';
    return 'success';
  };

  const getSensorAdvice = (sensor, value) => {
    const advice = SENSOR_ADVICE[sensor];
    if (!advice) return '';

    if (sensor === 'gas' || sensor === 'smoke') {
      if (value > SENSOR_THRESHOLDS.KITCHEN[sensor].danger) return advice.danger;
      if (value > SENSOR_THRESHOLDS.KITCHEN[sensor].warning) return advice.warning;
      return advice.safe;
    }

    const thresholds = SENSOR_THRESHOLDS.KITCHEN[sensor];
    if (!thresholds) return '';

    if (value < thresholds.min) return advice.tooLow;
    if (value > thresholds.max) return advice.tooHigh;
    return advice.optimal;
  };

  const renderSensorValue = (sensor, value) => {
    const status = getSensorStatus(sensor, value);
    const advice = getSensorAdvice(sensor, value);
    const thresholds = SENSOR_THRESHOLDS.KITCHEN[sensor];

    const getProgressPercent = () => {
      if (sensor === 'gas' || sensor === 'smoke') {
        return value;
      }
      return (value / thresholds?.max) * 100 || 0;
    };

    const getProgressColor = () => {
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
          {state.on && (settings.type === 'dimmer' || settings.type === 'speed') && (
            <Select
              value={state.level}
              onChange={(value) => handleDeviceLevelChange(device, value)}
              style={{ width: '100%' }}
            >
              {settings.levels.map(level => (
                <Select.Option key={level} value={level}>
                  {settings.type === 'dimmer' ? `${level}%` : `Speed ${level}`}
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

  const latestData = data[data.length - 1] || {};
  const showGasAlert = latestData.gas > SENSOR_THRESHOLDS.KITCHEN.gas?.warning;
  const showSmokeAlert = latestData.smoke > SENSOR_THRESHOLDS.KITCHEN.smoke?.warning;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Kitchen Sensor Data',
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
        {(showGasAlert || showSmokeAlert) && (
          <Col span={24}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {showGasAlert && (
                <Alert
                  message="Gas Level Warning"
                  description={getSensorAdvice('gas', latestData.gas)}
                  type="warning"
                  showIcon
                />
              )}
              {showSmokeAlert && (
                <Alert
                  message="Smoke Level Warning"
                  description={getSensorAdvice('smoke', latestData.smoke)}
                  type="warning"
                  showIcon
                />
              )}
            </Space>
          </Col>
        )}

        <Col span={24}>
          <Card title="Current Sensor Values">
            <Row gutter={[16, 16]}>
              {room.sensors.map(sensor => (
                <Col xs={24} sm={12} md={6} key={sensor}>
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

export default Kitchen;