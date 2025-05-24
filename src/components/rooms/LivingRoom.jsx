import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Progress, Alert, Button, Switch, Space, message, notification, Typography, Divider, Badge, Tooltip, Popover } from 'antd';
import { Line } from 'react-chartjs-2';
import { 
  BulbOutlined, 
  FireOutlined, 
  CloudOutlined, 
  ExperimentOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  HomeOutlined,
  LineChartOutlined,
  DashboardOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  SecurityScanOutlined,
  SoundOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  CHART_COLORS, 
  SENSOR_THRESHOLDS,
  WARNING_MESSAGES
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
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import dayjs from 'dayjs';
import { getDatabase, ref, get, set } from 'firebase/database';

// Import CSS
import '../../styles/components/rooms/Room.css';

const { Title: AntTitle } = Typography;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const LivingRoom = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const latestData = data[data.length - 1] || {};
  const [error, setError] = useState(null);
  const [lightStatus, setLightStatus] = useState(false);
  const [gasStatus, setGasStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const database = getDatabase();

  const parseTimestamp = (timestampStr) => {
    const [datePart, timePart] = timestampStr.split('_');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split('-');
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const fetchData = useCallback(async () => {
    setError(null);
    
    try {
      const historiesRef = collection(db, "histories");
      const q = query(
        historiesRef,
        orderBy("Timestamp", "desc"),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const historiesData = [];
      
      querySnapshot.forEach((doc) => {
        const rawData = doc.data();
        const timestamp = parseTimestamp(rawData.Timestamp);
        
        historiesData.push({
          timestamp: timestamp,
          temperature: Number(rawData.Temperature),
          humidity: Number(rawData.Humidity),
          lightLux: Number(rawData.LightValue),
          gas: Number(rawData.GasValue)
        });
      });

      setData(historiesData.reverse());
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error loading data: ' + err.message);
      setLoading(false);
    }
  }, []);

  const fetchDeviceStatus = useCallback(async () => {
    try {
      const lightRef = ref(database, 'ledStatus/light');
      const gasRef = ref(database, 'ledStatus/gas');
      
      const [lightSnapshot, gasSnapshot] = await Promise.all([
        get(lightRef),
        get(gasRef)
      ]);

      setLightStatus(lightSnapshot.val());
      setGasStatus(gasSnapshot.val());
    } catch (error) {
      console.error('Error fetching device status:', error);
      message.error('Failed to fetch device status');
    }
  }, [database]);

  const updateDeviceStatus = useCallback(async (device, value) => {
    setUpdating(true);
    try {
      await set(ref(database, `ledStatus/${device}`), value);
      
      if (device === 'light') {
        setLightStatus(value);
      } else {
        setGasStatus(value);
      }
      message.success(`${device.toUpperCase()} ${value ? 'turned on' : 'turned off'}`);
    } catch (error) {
      console.error('Error updating device status:', error);
      message.error('Failed to update device status');
    } finally {
      setUpdating(false);
    }
  }, [database]); 

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    fetchDeviceStatus();
    const interval = setInterval(fetchDeviceStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchDeviceStatus]);

  const chartData = {
    labels: data.map(entry => 
      dayjs(entry.timestamp).format('HH:mm:ss')
    ),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: data.map(entry => entry.temperature),
        borderColor: CHART_COLORS.temperature,
        backgroundColor: CHART_COLORS.temperature,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Humidity (%)',
        data: data.map(entry => entry.humidity),
        borderColor: CHART_COLORS.humidity,
        backgroundColor: CHART_COLORS.humidity,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Light (lux)',
        data: data.map(entry => entry.lightLux),
        borderColor: CHART_COLORS.light,
        backgroundColor: CHART_COLORS.light,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Gas (ppm)',
        data: data.map(entry => entry.gas),
        borderColor: CHART_COLORS.gas,
        backgroundColor: CHART_COLORS.gas,
        fill: false,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Sensor Data History',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        boxPadding: 3,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        border: {
          dash: [4, 4]
        },
        ticks: {
          padding: 10
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      }
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
        borderWidth: 2
      },
      line: {
        borderWidth: 2,
        tension: 0.4
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear'
      }
    },
    layout: {
      padding: {
        top: 10,
        right: 16,
        bottom: 10,
        left: 16
      }
    }
  };

  const getSensorStatus = (type, value) => {
    const thresholds = SENSOR_THRESHOLDS.LIVING_ROOM[type];
    if (!thresholds) return { icon: <InfoCircleOutlined />, color: '#1890ff' };

    if (type === 'gas') {
      if (value > thresholds.max) 
        return { icon: <WarningOutlined />, color: '#cf1322' };
      if (value > thresholds.max * 0.7) 
        return { icon: <WarningOutlined />, color: '#faad14' };
      return { icon: <CheckCircleOutlined />, color: '#52c41a' };
    }
    
    if (type === 'light') {
      if (value < thresholds.min) 
        return { icon: <ArrowDownOutlined />, color: '#faad14' };
      if (value > thresholds.max) 
        return { icon: <ArrowUpOutlined />, color: '#faad14' };
      return { icon: <CheckCircleOutlined />, color: '#52c41a' };
    }
    
    if (value < thresholds.min) return { icon: <ArrowDownOutlined />, color: '#faad14' };
    if (value > thresholds.max) return { icon: <ArrowUpOutlined />, color: '#faad14' };
    return { icon: <CheckCircleOutlined />, color: '#52c41a' };
  };

  const renderSensorCard = (icon, label, value, unit, type) => {
    const status = getSensorStatus(type, value);
    return (
      <Card className="sensor-card" hoverable>
        <div className="sensor-header">
          <div className="sensor-icon" style={{ color: status.color }}>
            {icon}
          </div>
          <span className="sensor-status" style={{ color: status.color }}>
            {status.icon}
          </span>
        </div>
        <Statistic
          title={label}
          value={value}
          suffix={unit}
          precision={1}
          valueStyle={{
            color: status.color,
            fontSize: '28px'
          }}
        />
        <Progress
          percent={Math.min((value / SENSOR_THRESHOLDS.LIVING_ROOM[type]?.max || 100) * 100, 100)}
          strokeColor={status.color}
          status={
            type === 'gas' && value > SENSOR_THRESHOLDS.LIVING_ROOM.gas.max ? 'exception' :
            type === 'gas' && value > SENSOR_THRESHOLDS.LIVING_ROOM.gas.max * 0.7 ? 'warning' :
            type === 'light' && value < SENSOR_THRESHOLDS.LIVING_ROOM.light.min ? 'warning' :
            type === 'light' && value > SENSOR_THRESHOLDS.LIVING_ROOM.light.max ? 'exception' :
            'success'
          }
          strokeWidth={8}
          showInfo={false}
        />
      </Card>
    );
  };

  useEffect(() => {
    // Debounce notifications to prevent spam
    const notificationDelay = setTimeout(() => {
      // Gas Warnings
      const gasValue = latestData.gas;
      if (gasValue > SENSOR_THRESHOLDS.LIVING_ROOM.gas.max) {
        notification.error({
          key: 'gas-danger',
          message: 'Dangerous Gas Level',
          description: WARNING_MESSAGES.GAS.DANGER,
          duration: 3,
          placement: 'topRight',
        });
      } else if (gasValue > SENSOR_THRESHOLDS.LIVING_ROOM.gas.max * 0.7) {
        notification.warning({
          key: 'gas-warning',
          message: 'Gas Warning',
          description: WARNING_MESSAGES.GAS.WARNING,
          duration: 3,
          placement: 'topRight',
        });
      }

      // Light Warnings
      const lightValue = latestData.lightLux;
      if (lightValue < SENSOR_THRESHOLDS.LIVING_ROOM.light.min) {
        if (!lightStatus) {
          notification.warning({
            key: 'light-low',
            message: 'Low Light Warning',
            description: WARNING_MESSAGES.LIGHT.LOW,
            duration: 3,
            placement: 'topRight',
            actions: (
              <Button type="primary" size="small" onClick={() => updateDeviceStatus('light', true)}>
                Turn On Lights
              </Button>
            )
          });
        }
      } else if (lightValue > SENSOR_THRESHOLDS.LIVING_ROOM.light.max) {
        if (lightStatus) {
          notification.info({
            key: 'light-high',
            message: 'High Light Level',
            description: WARNING_MESSAGES.LIGHT.HIGH,
            duration: 3,
            placement: 'topRight',
            actions: (
              <Button type="primary" size="small" onClick={() => updateDeviceStatus('light', false)}>
                Turn Off Lights
              </Button>
            )
          });
        }
      }
    }, 1000); // 1 second delay

    // Cleanup timeout
    return () => clearTimeout(notificationDelay);
  }, [latestData.gas, latestData.lightLux, lightStatus, updateDeviceStatus]);


  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (loading) {
    return <div className="loading-container">Loading sensor data...</div>;
  }

  return (
    <div className="room-page">
      <div className="room-container">
        <div className="dashboard-header">
          <div className="dashboard-title-section">
            <AntTitle level={3} className="dashboard-title">
              <HomeOutlined /> Living Room Dashboard
            </AntTitle>
            <div className="last-updated">
              <HistoryOutlined /> Last updated: {dayjs(latestData.timestamp).format('HH:mm:ss DD/MM/YYYY')}
            </div>
          </div>
          <div className="dashboard-actions">
            <Tooltip title="View Detailed Analysis">
              <Button 
                type="primary" 
                icon={<LineChartOutlined />}
                onClick={() => navigate('/living-room/detail')}
                className="view-detail-button"
              >
                View Details
              </Button>
            </Tooltip>
            <Tooltip title="Settings">
              <Button 
                icon={<SettingOutlined />} 
                className="settings-button"
              />
            </Tooltip>
          </div>
        </div>
        <Divider />
        
        {/* Quick stats cards */}
        <div className="quick-summary">
          <Popover 
            content="Energy consumption is lower than yesterday" 
            title="Energy Status"
            trigger="hover"
          >
            <div className="summary-item">
              <ThunderboltOutlined className="summary-icon energy" />
              <div className="summary-details">
                <div className="summary-title">Energy</div>
                <div className="summary-value">-8.5%</div>
              </div>
            </div>
          </Popover>
          
          <Popover 
            content="All systems are functioning normally" 
            title="System Status"
            trigger="hover"
          >
            <div className="summary-item">
              <CheckCircleOutlined className="summary-icon systems" />
              <div className="summary-details">
                <div className="summary-title">Systems</div>
                <div className="summary-value">Normal</div>
              </div>
            </div>
          </Popover>

          <Popover 
            content="All doors and windows are secured" 
            title="Security Status"
            trigger="hover"
          >
            <div className="summary-item">
              <SecurityScanOutlined className="summary-icon security" />
              <div className="summary-details">
                <div className="summary-title">Security</div>
                <div className="summary-value">Secured</div>
              </div>
            </div>
          </Popover>
        </div>
        
        {/* Header Row with sensors */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            {renderSensorCard(
              <FireOutlined style={{ fontSize: '24px' }} />,
              'Temperature',
              latestData.temperature,
              '°C',
              'temperature'
            )}
          </Col>
          <Col xs={24} sm={12} md={6}>
            {renderSensorCard(
              <CloudOutlined style={{ fontSize: '24px' }} />,
              'Humidity',
              latestData.humidity,
              '%',
              'humidity'
            )}
          </Col>
          <Col xs={24} sm={12} md={6}>
            {renderSensorCard(
              <BulbOutlined style={{ fontSize: '24px' }} />,
              'Light',
              latestData.lightLux,
              'lux',
              'light'
            )}
          </Col>
          <Col xs={24} sm={12} md={6}>
            {renderSensorCard(
              <ExperimentOutlined style={{ fontSize: '24px' }} />,
              'Gas',
              latestData.gas,
              'ppm',
              'gas'
            )}
          </Col>
        </Row>

        {/* Chart and Controls Row */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={18}>
            <Card className="chart-card" 
              hoverable 
              title={
                <div className="chart-title">
                  <DashboardOutlined /> Sensor Data Trends
                </div>
              }
              extra={
                <div className="chart-actions">
                  <Button type="text" icon={<SoundOutlined />} size="small" className="action-button" />
                  <Button type="text" icon={<MenuOutlined />} size="small" className="action-button" />
                </div>
              }
            >
              <div className="chart-container">
                <Line options={chartOptions} data={chartData} />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card 
              className="controls-card"
              title={
                <div className="controls-title">
                  <SettingOutlined /> Device Controls
                </div>
              }
            >
              <div className="device-controls">
                <div className="device-control-item">
                  <div className="device-icon-container">
                    <BulbOutlined className="device-icon" />
                  </div>
                  <div className="device-label">Light Control</div>
                  <Switch
                    checked={lightStatus}
                    loading={updating}
                    onChange={(checked) => updateDeviceStatus('light', checked)}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                    className="device-switch"
                  />
                </div>
                
                <div className="device-control-item">
                  <div className="device-icon-container">
                    <FireOutlined className="device-icon" />
                  </div>
                  <div className="device-label">Gas Control</div>
                  <Switch
                    checked={gasStatus}
                    loading={updating}
                    onChange={(checked) => updateDeviceStatus('gas', checked)}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                    className="device-switch"
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        
        <div className="dashboard-footer">
          <div className="footer-status">
            <Badge status={error ? "error" : "success"} />
            {error ? "Connection Error" : "System Online"}
          </div>
          <div className="footer-copyright">
            IoT Dashboard © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivingRoom;