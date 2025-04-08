import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin, Alert, Button, Switch, Space, message } from 'antd';
import { Line } from 'react-chartjs-2';
import { BarChartOutlined, BulbOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  CHART_COLORS, 
  SENSOR_THRESHOLDS
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

  const updateDeviceStatus = async (device, value) => {
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
  };

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

  const renderSensorValue = (label, value, unit, type) => (
    <Col span={6}>
      <Card>
        <Statistic
          title={label}
          value={value}
          suffix={unit}
          precision={1}
        />
        <Progress
          percent={Math.min((value / SENSOR_THRESHOLDS.LIVING_ROOM[type]?.max || 100) * 100, 100)}
          status={
            value > SENSOR_THRESHOLDS.LIVING_ROOM[type]?.max ? 'exception' :
            value < SENSOR_THRESHOLDS.LIVING_ROOM[type]?.min ? 'active' : 'success'
          }
        />
      </Card>
    </Col>
  );

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const latestData = data[data.length - 1] || {};

  return (
    <div style={{ padding: 24 }}>
      {/* Header Row with sensors and View Detail button */}
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col flex="auto">
          <Row gutter={[16, 16]}>
            {renderSensorValue('Temperature', latestData.temperature, '°C', 'temperature')}
            {renderSensorValue('Humidity', latestData.humidity, '%', 'humidity')}
            {renderSensorValue('Light', latestData.lightLux, 'lux', 'light')}
            {renderSensorValue('Gas', latestData.gas, 'ppm', 'gas')}
          </Row>
        </Col>
        <Col>
          <Button 
            type="primary"
            icon={<BarChartOutlined />}
            onClick={() => navigate('/living-room/detail')}
          >
            View Detail
          </Button>
        </Col>
      </Row>

      {/* Chart and Controls Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col flex="auto">
          <Card>
            <div style={{ height: 400 }}>
              <Line options={chartOptions} data={chartData} />
            </div>
          </Card>
        </Col>
        <Col style={{ width: 200 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <BulbOutlined style={{ 
                  fontSize: '24px', 
                  color: lightStatus ? '#faad14' : 'rgba(0,0,0,0.45)'
                }} />
                <Switch
                  style={{ width: 70 }}
                  checked={lightStatus}
                  loading={updating}
                  onChange={(checked) => updateDeviceStatus('light', checked)}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
                <span>Light Control</span>
              </Space>
            </Card>
            <Card size="small">
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <FireOutlined style={{ 
                  fontSize: '24px', 
                  color: gasStatus ? '#ff4d4f' : 'rgba(0,0,0,0.45)'
                }} />
                <Switch
                  style={{ width: 70 }}
                  checked={gasStatus}
                  loading={updating}
                  onChange={(checked) => updateDeviceStatus('gas', checked)}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
                <span>Gas Control</span>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default LivingRoom;