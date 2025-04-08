import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Switch, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import { ref, onValue, set } from "firebase/database";
import { database } from '../firebase/firebase';
import '../styles/components/Dashboard.css';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    // Reference đến node "data" trong database
    const dataRef = ref(database, 'data');
    
    // Lắng nghe thay đổi realtime
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeviceToggle = (device) => {
    const deviceRef = ref(database, `data/ledStatus/${device}`);
    set(deviceRef, !sensorData.ledStatus[device]);
  };

  if (!sensorData) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            title="Room Sensors"
            className="room-card"
          >
            <div className="sensors-data">
              <Statistic title="Temperature" value={`${sensorData.temperature}°C`} />
              <Statistic title="Humidity" value={`${sensorData.humidity}%`} />
              <Statistic title="Light" value={`${sensorData.lightLux} lux`} />
              <Statistic title="Air Quality" value={`${sensorData['air-quality']} AQI`} />
              <Statistic title="Gas" value={`${sensorData.gas} ppm`} />
            </div>
            <div className="devices-control">
              <div className="device-item">
                <span>LIGHT</span>
                <Switch
                  checked={sensorData.ledStatus.light}
                  onChange={() => handleDeviceToggle('light')}
                />
              </div>
              <div className="device-item">
                <span>GAS</span>
                <Switch
                  checked={sensorData.ledStatus.gas}
                  onChange={() => handleDeviceToggle('gas')}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;