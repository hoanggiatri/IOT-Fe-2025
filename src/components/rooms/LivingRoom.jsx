import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin, Alert, Button, Switch, Space, message, notification } from 'antd';
import { Line } from 'react-chartjs-2';
import { BarChartOutlined, BulbOutlined, FireOutlined, CloudOutlined, ExperimentOutlined } from '@ant-design/icons';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightStatus, setLightStatus] = useState(false);
  const [gasStatus, setGasStatus] = useState(false);
  const [updating, setUpdating] = useState(false);

  const database = getDatabase();

  const parseTimestamp = (timestampStr) => {
    const [datePart, timePart] = timestampStr.split('_');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split('-');
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
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
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error loading data: ' + err.message);
    } finally {
      setIsLoading(false);
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
  }, [database]); // Add database as dependency

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    fetchDeviceStatus();
    const interval = setInterval(fetchDeviceStatus, 5000);
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
        fill: false
      },
      {
        label: 'Humidity (%)',
        data: data.map(entry => entry.humidity),
        borderColor: CHART_COLORS.humidity,
        backgroundColor: CHART_COLORS.humidity,
        fill: false
      },
      {
        label: 'Light (lux)',
        data: data.map(entry => entry.lightLux),
        borderColor: CHART_COLORS.light,
        backgroundColor: CHART_COLORS.light,
        fill: false
      },
      {
        label: 'Gas (ppm)',
        data: data.map(entry => entry.gas),
        borderColor: CHART_COLORS.gas,
        backgroundColor: CHART_COLORS.gas,
        fill: false
      }
    ]
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
        text: 'Sensor Data History'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const renderSensorCard = (icon, label, value, unit, type) => (
    <Card className="sensor-card">
      <div className="sensor-icon">
        {icon}
      </div>
      <Statistic
        title={label}
        value={value}
        suffix={unit}
        precision={1}
        valueStyle={{
          color: 
            type === 'gas' && value > SENSOR_THRESHOLDS.LIVING_ROOM.gas.max * 0.7 ? '#cf1322' :
            type === 'light' && !lightStatus && value < SENSOR_THRESHOLDS.LIVING_ROOM.light.min ? '#faad14' :
            undefined
        }}
      />
      <Progress
        percent={Math.min((value / SENSOR_THRESHOLDS.LIVING_ROOM[type]?.max || 100) * 100, 100)}
        status={
          type === 'gas' && value > SENSOR_THRESHOLDS.LIVING_ROOM.gas.max ? 'exception' :
          type === 'gas' && value > SENSOR_THRESHOLDS.LIVING_ROOM.gas.max * 0.7 ? 'warning' :
          type === 'light' && value < SENSOR_THRESHOLDS.LIVING_ROOM.light.min ? 'warning' :
          type === 'light' && value > SENSOR_THRESHOLDS.LIVING_ROOM.light.max ? 'exception' :
          'success'
        }
      />
    </Card>
  );

  const renderDeviceControl = (icon, label, status, onChange) => (
    <Card className="device-card">
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        {React.cloneElement(icon, { 
          style: { 
            fontSize: '24px',
            color: status ? '#1890ff' : 'rgba(0,0,0,0.45)'
          }
        })}
        <Switch
          checked={status}
          loading={updating}
          onChange={onChange}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
        <span>{label}</span>
      </Space>
    </Card>
  );

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
          duration: 0,
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
            btn: (
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
            btn: (
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

  useEffect(() => {
    // Chỉ xử lý cảnh báo ánh sáng
    const lightValue = latestData.lightLux;
    
    if (lightValue && lightValue < SENSOR_THRESHOLDS.LIVING_ROOM.light.min && !lightStatus) {
      notification.warning({
        key: 'light-warning-low',
        message: 'Cảnh báo: Thiếu ánh sáng',
        description: WARNING_MESSAGES.LIGHT.LOW,
        duration: 0,
        placement: 'topRight',
        btn: (
          <Button 
            type="primary" 
            size="small" 
            onClick={() => {
              updateDeviceStatus('light', true);
              notification.destroy('light-warning-low'); // Changed from close to destroy
            }}
          >
            Bật đèn ngay
          </Button>
        )
      });
    } else if (lightValue && lightValue > SENSOR_THRESHOLDS.LIVING_ROOM.light.max && lightStatus) {
      notification.info({
        key: 'light-warning-high',
        message: 'Gợi ý: Dư ánh sáng',
        description: WARNING_MESSAGES.LIGHT.HIGH,
        duration: 0,
        placement: 'topRight',
        btn: (
          <Button 
            type="primary" 
            size="small" 
            onClick={() => {
              updateDeviceStatus('light', false);
              notification.destroy('light-warning-high'); // Changed from close to destroy
            }}
          >
            Tắt đèn
          </Button>
        )
      });
    } else {
      // Đóng các cảnh báo nếu điều kiện không còn thỏa mãn
      notification.destroy(); // This will remove all notifications
    }
  }, [latestData.lightLux, lightStatus, updateDeviceStatus]);

  useEffect(() => {
    // Xử lý cảnh báo khí gas riêng
    const gasValue = latestData.gas;
    if (gasValue > SENSOR_THRESHOLDS.LIVING_ROOM.gas.max) {
      notification.error({
        key: 'gas-danger',
        message: 'NGUY HIỂM: Nồng độ khí cao',
        description: WARNING_MESSAGES.GAS.DANGER,
        duration: 0,
        placement: 'topRight'
      });
    }
  }, [latestData.gas]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header Row with sensors */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          {renderSensorCard(
            <FireOutlined style={{ color: '#ff4d4f' }} />,
            'Temperature',
            latestData.temperature,
            '°C',
            'temperature'
          )}
        </Col>
        <Col span={6}>
          {renderSensorCard(
            <CloudOutlined style={{ color: '#1890ff' }} />,
            'Humidity',
            latestData.humidity,
            '%',
            'humidity'
          )}
        </Col>
        <Col span={6}>
          {renderSensorCard(
            <BulbOutlined style={{ color: '#faad14' }} />,
            'Light',
            latestData.lightLux,
            'lux',
            'light'
          )}
        </Col>
        <Col span={6}>
          {renderSensorCard(
            <ExperimentOutlined style={{ color: '#722ed1' }} />,
            'Gas',
            latestData.gas,
            'ppm',
            'gas'
          )}
        </Col>
      </Row>

      {/* Chart and Controls Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={18}>
          <Card>
            <div style={{ height: 400 }}>
              <Line options={chartOptions} data={chartData} />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {renderDeviceControl(
              <BulbOutlined />,
              'Light Control',
              lightStatus,
              (checked) => updateDeviceStatus('light', checked)
            )}
            {renderDeviceControl(
              <FireOutlined />,
              'Gas Control',
              gasStatus,
              (checked) => updateDeviceStatus('gas', checked)
            )}
            <Button 
              type="primary" 
              icon={<BarChartOutlined />}
              onClick={() => navigate('/living-room/detail')}
              block
            >
              View Detail
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default LivingRoom;