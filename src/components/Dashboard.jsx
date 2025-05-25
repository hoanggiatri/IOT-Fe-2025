import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Alert, Button, Switch, message, Typography, Badge, notification } from 'antd';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
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
  SettingOutlined,
  ThunderboltOutlined,
  SecurityScanOutlined,
  RocketOutlined,
  EyeOutlined,
  
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  SENSOR_THRESHOLDS,
} from '../utils/constants';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import dayjs from 'dayjs';
import { getDatabase, ref, get, set } from 'firebase/database';

// Import CSS
import '../styles/components/Dashboard.css';

const { Title: AntTitle } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const latestData = data[data.length - 1] || {};
  const [error, setError] = useState(null);
  const [lightStatus, setLightStatus] = useState(false);
  const [gasStatus, setGasStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('line');
  
  // Data series visibility state
  const [visibleSeries, setVisibleSeries] = useState({
    temperature: true,
    humidity: true,
    light: true,
    gas: true
  });

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
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const historiesData = [];
      
      querySnapshot.forEach((doc) => {
        const rawData = doc.data();
        const timestamp = parseTimestamp(rawData.Timestamp);
        
        historiesData.push({
          timestamp: timestamp,
          time: dayjs(timestamp).format('HH:mm'),
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
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    fetchDeviceStatus();
    const interval = setInterval(fetchDeviceStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchDeviceStatus]);

  // Hàm kiểm tra và hiển thị notification popup
  useEffect(() => {
    // Light
    const lightThresholds = SENSOR_THRESHOLDS.LIVING_ROOM.light;
    if (typeof latestData.lightLux === 'number') {
      if (latestData.lightLux < lightThresholds.min && !lightStatus) {
        notification.open({
          key: 'light-on',
          message: 'Ánh sáng thấp hơn ngưỡng tối thiểu',
          description: 'Bạn có muốn bật đèn không?',
          btn: (
            <Button type="primary" size="small" loading={updating} onClick={() => { updateDeviceStatus('light', true); notification.destroy('light-on'); }}>
              Bật đèn
            </Button>
          ),
          duration: 0,
          placement: 'topRight',
          style: { borderRadius: 16 }
        });
      } else if (latestData.lightLux > lightThresholds.max && lightStatus) {
        notification.open({
          key: 'light-off',
          message: 'Ánh sáng cao hơn ngưỡng tối đa',
          description: 'Bạn có muốn tắt đèn không?',
          btn: (
            <Button type="default" size="small" loading={updating} onClick={() => { updateDeviceStatus('light', false); notification.destroy('light-off'); }}>
              Tắt đèn
            </Button>
          ),
          duration: 0,
          placement: 'topRight',
          style: { borderRadius: 16 }
        });
      } else {
        notification.destroy('light-on');
        notification.destroy('light-off');
      }
    }
    // Gas
    const gasThresholds = SENSOR_THRESHOLDS.LIVING_ROOM.gas;
    if (typeof latestData.gas === 'number') {
      if (latestData.gas > gasThresholds.max && !gasStatus) {
        notification.open({
          key: 'gas-on',
          message: 'Phát hiện khí gas vượt ngưỡng an toàn!',
          description: 'Bạn có muốn bật cảnh báo/gas monitor không?',
          btn: (
            <Button type="primary" danger size="small" loading={updating} onClick={() => { updateDeviceStatus('gas', true); notification.destroy('gas-on'); }}>
              Bật Gas Monitor
            </Button>
          ),
          duration: 0,
          placement: 'topRight',
          style: { borderRadius: 16 }
        });
      } else if (latestData.gas < gasThresholds.max * 0.7 && gasStatus) {
        notification.open({
          key: 'gas-off',
          message: 'Nồng độ khí gas đã an toàn',
          description: 'Bạn có muốn tắt Gas Monitor không?',
          btn: (
            <Button type="default" size="small" loading={updating} onClick={() => { updateDeviceStatus('gas', false); notification.destroy('gas-off'); }}>
              Tắt Gas Monitor
            </Button>
          ),
          duration: 0,
          placement: 'topRight',
          style: { borderRadius: 16 }
        });
      } else {
        notification.destroy('gas-on');
        notification.destroy('gas-off');
      }
    }
  }, [latestData, lightStatus, gasStatus, updating]);

  const getSensorStatus = (type, value) => {
    const thresholds = SENSOR_THRESHOLDS.LIVING_ROOM[type];
    if (!thresholds) return { icon: <InfoCircleOutlined />, color: '#1890ff', status: 'normal' };

    if (type === 'gas') {
      if (value > thresholds.max) 
        return { icon: <WarningOutlined />, color: '#cf1322', status: 'danger' };
      if (value > thresholds.max * 0.7) 
        return { icon: <WarningOutlined />, color: '#faad14', status: 'warning' };
      return { icon: <CheckCircleOutlined />, color: '#52c41a', status: 'good' };
    }
    
    if (type === 'light') {
      if (value < thresholds.min) 
        return { icon: <ArrowDownOutlined />, color: '#faad14', status: 'low' };
      if (value > thresholds.max) 
        return { icon: <ArrowUpOutlined />, color: '#faad14', status: 'high' };
      return { icon: <CheckCircleOutlined />, color: '#52c41a', status: 'optimal' };
    }
    
    if (value < thresholds.min) return { icon: <ArrowDownOutlined />, color: '#faad14', status: 'low' };
    if (value > thresholds.max) return { icon: <ArrowUpOutlined />, color: '#faad14', status: 'high' };
    return { icon: <CheckCircleOutlined />, color: '#52c41a', status: 'optimal' };
  };

  const renderSensorCard = (icon, label, value, unit, type, gradient) => {
    const status = getSensorStatus(type, value);
    const thresholds = SENSOR_THRESHOLDS.LIVING_ROOM[type];
    let percentage = 0;
    let minValue = 0;
    let maxValue = 100;
    if (thresholds && thresholds.max !== thresholds.min) {
      minValue = thresholds.min;
      maxValue = thresholds.max;
      percentage = ((value - minValue) / (maxValue - minValue)) * 100;
      percentage = Math.max(0, Math.min(percentage, 100));
    } else {
      percentage = 100;
    }

    // Tính trend thực tế
    let trend = null;
    let trendPercent = 0;
    if (data.length > 1) {
      const prev = data[data.length - 2][type === 'light' ? 'lightLux' : type];
      if (prev !== undefined && prev !== 0) {
        trendPercent = ((value - prev) / Math.abs(prev)) * 100;
        if (trendPercent > 0.1) trend = 'up';
        else if (trendPercent < -0.1) trend = 'down';
        else trend = 'neutral';
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -5, scale: 1.02 }}
      >
        <Card className={`sensor-card ${status.status}`} hoverable>
          <div className="sensor-card-header">
            <div className="sensor-icon-wrapper" style={{ background: gradient }}>
              {icon}
            </div>
            <div className="sensor-status-badge" style={{ color: status.color }}>
              {status.icon}
            </div>
          </div>
          
          <div className="sensor-value-section">
            <Statistic
              title={label}
              value={value}
              suffix={unit}
              precision={1}
              valueStyle={{
                color: status.color,
                fontSize: '32px',
                fontWeight: '700'
              }}
            />
          </div>
          
          <div className="sensor-trend">
            {trend && trend !== 'neutral' && (
              <span className={`trend-indicator ${trend}`}>
                {trend === 'up' ? '↗' : '↘'} {Math.abs(trendPercent).toFixed(1)}%
              </span>
            )}
            {trend === 'neutral' && (
              <span className="trend-indicator" style={{ color: '#888', background: 'rgba(0,0,0,0.04)' }}>
                → 0.0%
              </span>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const toggleSeries = (seriesName) => {
    setVisibleSeries(prev => ({
      ...prev,
      [seriesName]: !prev[seriesName]
    }));
  };

  const renderChartSection = () => {
    const chartData = data.map(entry => ({
      time: entry.time,
      temperature: entry.temperature,
      humidity: entry.humidity,
      light: entry.lightLux,
      gas: entry.gas
    }));

    const pieData = [
      { name: 'Temperature', value: latestData.temperature || 0, color: '#ff6b6b' },
      { name: 'Humidity', value: latestData.humidity || 0, color: '#4ecdc4' },
      { name: 'Light', value: (latestData.lightLux || 0) / 10, color: '#ffe66d' },
      { name: 'Gas', value: latestData.gas || 0, color: '#ff8b94' }
    ];

    const seriesConfig = [
      { key: 'temperature', name: 'Temperature (°C)', color: '#ff6b6b', icon: <FireOutlined /> },
      { key: 'humidity', name: 'Humidity (%)', color: '#4ecdc4', icon: <CloudOutlined /> },
      { key: 'light', name: 'Light (lux)', color: '#ffe66d', icon: <BulbOutlined /> },
      { key: 'gas', name: 'Gas (ppm)', color: '#ff8b94', icon: <ExperimentOutlined /> }
    ];

    return (
      <div className="chart-section">
        <div className="chart-controls">
          
          {(activeChart === 'line') && (
            <div className="series-toggle-controls">
              <div className="toggle-title">
                <EyeOutlined /> Show/Hide Data Series:
              </div>
              <div className="toggle-buttons">
                {seriesConfig.map(series => (
                  <Button
                    key={series.key}
                    type={visibleSeries[series.key] ? 'primary' : 'default'}
                    size="small"
                    icon={series.icon}
                    onClick={() => toggleSeries(series.key)}
                    style={{
                      backgroundColor: visibleSeries[series.key] ? series.color : undefined,
                      borderColor: series.color,
                      color: visibleSeries[series.key] ? 'white' : series.color
                    }}
                    className="series-toggle-btn"
                  >
                    {series.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="chart-container"
          >
            <ResponsiveContainer width="100%" height={400}>
              {activeChart === 'line' && (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  {visibleSeries.temperature && (
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#ff6b6b" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#ff6b6b' }}
                      name="Temperature (°C)"
                    />
                  )}
                  {visibleSeries.humidity && (
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#4ecdc4" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#4ecdc4' }}
                      name="Humidity (%)"
                    />
                  )}
                  {visibleSeries.light && (
                    <Line 
                      type="monotone" 
                      dataKey="light" 
                      stroke="#ffe66d" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#ffe66d' }}
                      name="Light (lux)"
                    />
                  )}
                  {visibleSeries.gas && (
                    <Line 
                      type="monotone" 
                      dataKey="gas" 
                      stroke="#ff8b94" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#ff8b94' }}
                      name="Gas (ppm)"
                    />
                  )}
                </LineChart>
              )}
              
              {activeChart === 'area' && (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  {visibleSeries.temperature && (
                    <Area 
                      type="monotone" 
                      dataKey="temperature" 
                      stackId="1" 
                      stroke="#ff6b6b" 
                      fill="#ff6b6b" 
                      fillOpacity={0.6}
                      name="Temperature (°C)"
                    />
                  )}
                  {visibleSeries.humidity && (
                    <Area 
                      type="monotone" 
                      dataKey="humidity" 
                      stackId="1" 
                      stroke="#4ecdc4" 
                      fill="#4ecdc4" 
                      fillOpacity={0.6}
                      name="Humidity (%)"
                    />
                  )}
                  {visibleSeries.light && (
                    <Area 
                      type="monotone" 
                      dataKey="light" 
                      stackId="1" 
                      stroke="#ffe66d" 
                      fill="#ffe66d" 
                      fillOpacity={0.6}
                      name="Light (lux)"
                    />
                  )}
                  {visibleSeries.gas && (
                    <Area 
                      type="monotone" 
                      dataKey="gas" 
                      stackId="1" 
                      stroke="#ff8b94" 
                      fill="#ff8b94" 
                      fillOpacity={0.6}
                      name="Gas (ppm)"
                    />
                  )}
                </AreaChart>
              )}
              
              {activeChart === 'bar' && (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  {visibleSeries.temperature && (
                    <Bar dataKey="temperature" fill="#ff6b6b" radius={[4, 4, 0, 0]} name="Temperature (°C)" />
                  )}
                  {visibleSeries.humidity && (
                    <Bar dataKey="humidity" fill="#4ecdc4" radius={[4, 4, 0, 0]} name="Humidity (%)" />
                  )}
                  {visibleSeries.light && (
                    <Bar dataKey="light" fill="#ffe66d" radius={[4, 4, 0, 0]} name="Light (lux)" />
                  )}
                  {visibleSeries.gas && (
                    <Bar dataKey="gas" fill="#ff8b94" radius={[4, 4, 0, 0]} name="Gas (ppm)" />
                  )}
                </BarChart>
              )}
              
              {activeChart === 'pie' && (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (loading) {
    return (
      <div className="loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        >
          <RocketOutlined />
        </motion.div>
        <p>Loading IoT Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="header"
      >
        <div className="header-content">
          <div className="title-section">
            <AntTitle level={2} className="dashboard-title">
              <HomeOutlined /> Smart Home Dashboard
            </AntTitle>
            <div className="subtitle">
              <HistoryOutlined /> Last updated: {dayjs(latestData.timestamp).format('HH:mm:ss DD/MM/YYYY')}
            </div>
          </div>
          <div className="header-actions">
            <Button 
              type="primary" 
              icon={<LineChartOutlined />}
              onClick={() => navigate('/detail')}
              className="action-btn"
            >
              Detailed View
            </Button>
            <Button 
              icon={<SettingOutlined />} 
              className="action-btn secondary"
            >
              Settings
            </Button>
          </div>
        </div>
      </motion.div>

      {/*  Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="stats-overview"
      >
        <div className="stats-card">
          <ThunderboltOutlined className="stats-icon energy" />
          <div className="stats-content">
            <div className="stats-title">Energy Efficiency</div>
            <div className="stats-value">92%</div>
            <div className="stats-trend positive">+5.2%</div>
          </div>
        </div>
        <div className="stats-card">
          <CheckCircleOutlined className="stats-icon systems" />
          <div className="stats-content">
            <div className="stats-title">System Health</div>
            <div className="stats-value">Excellent</div>
            <div className="stats-trend positive">All Good</div>
          </div>
        </div>
        <div className="stats-card">
          <SecurityScanOutlined className="stats-icon security" />
          <div className="stats-content">
            <div className="stats-title">Security Status</div>
            <div className="stats-value">Secured</div>
            <div className="stats-trend neutral">Protected</div>
          </div>
        </div>
      </motion.div>

      {/* Sensor Cards */}
      <Row gutter={[24, 24]} className="sensor-grid">
        <Col xs={24} sm={12} lg={6}>
          {renderSensorCard(
            <FireOutlined />,
            'Temperature',
            latestData.temperature,
            '°C',
            'temperature',
            'linear-gradient(135deg, #ff6b6b, #ff8e8e)'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderSensorCard(
            <CloudOutlined />,
            'Humidity',
            latestData.humidity,
            '%',
            'humidity',
            'linear-gradient(135deg, #4ecdc4, #6ee5dd)'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderSensorCard(
            <BulbOutlined />,
            'Light',
            latestData.lightLux,
            'lux',
            'light',
            'linear-gradient(135deg, #ffe66d, #fff89e)'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderSensorCard(
            <ExperimentOutlined />,
            'Gas',
            latestData.gas,
            'ppm',
            'gas',
            'linear-gradient(135deg, #ff8b94, #ffaaa5)'
          )}
        </Col>
      </Row>

      {/* Charts and Controls */}
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="chart-card" title="Sensor Data Analytics">
              {renderChartSection()}
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="controls-card" title="Device Controls">
              <div className="device-controls">
                <div className="device-control">
                  <div className="device-info">
                    <BulbOutlined className="device-icon" />
                    <div>
                      <div className="device-name">Smart Lights</div>
                      <div className="device-status">
                        {lightStatus ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={lightStatus}
                    loading={updating}
                    onChange={(checked) => updateDeviceStatus('light', checked)}
                    className="switch"
                  />
                </div>
                
                <div className="device-control">
                  <div className="device-info">
                    <FireOutlined className="device-icon" />
                    <div>
                      <div className="device-name">Gas Monitor</div>
                      <div className="device-status">
                        {gasStatus ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={gasStatus}
                    loading={updating}
                    onChange={(checked) => updateDeviceStatus('gas', checked)}
                    className="switch"
                  />
                </div>
              </div>
              
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="footer"
      >
        <div className="footer-content">
          <div className="system-status">
            <Badge status={error ? "error" : "success"} />
            {error ? "Connection Error" : "All Systems Online"}
          </div>
          <div className="footer-info">
            Smart IoT Dashboard © {new Date().getFullYear()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 