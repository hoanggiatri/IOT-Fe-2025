import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Switch, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import { ROOMS } from '../utils/constants';
import '../styles/components/Dashboard.css';

const Dashboard = () => {
  const [roomsData, setRoomsData] = useState({});

  useEffect(() => {
    // Giả lập dữ liệu realtime
    const fetchRoomsData = () => {
      const data = {};
      Object.keys(ROOMS).forEach(roomKey => {
        const room = ROOMS[roomKey];
        data[room.id] = {
          temperature: (Math.random() * 10 + 20).toFixed(1),
          humidity: (Math.random() * 20 + 40).toFixed(1),
          light: Math.floor(Math.random() * 500 + 100),
          airQuality: Math.floor(Math.random() * 100 + 50),
          devices: room.devices.reduce((acc, device) => {
            acc[device] = Math.random() > 0.5;
            return acc;
          }, {})
        };
      });
      setRoomsData(data);
    };

    fetchRoomsData();
    const interval = setInterval(fetchRoomsData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDeviceToggle = (roomId, device) => {
    setRoomsData(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        devices: {
          ...prev[roomId].devices,
          [device]: !prev[roomId].devices[device]
        }
      }
    }));
  };

  return (
    <div className="dashboard">
      <Row gutter={[16, 16]}>
        {Object.keys(ROOMS).map(roomKey => {
          const room = ROOMS[roomKey];
          const data = roomsData[room.id];

          return (
            <Col xs={24} sm={12} lg={6} key={room.id}>
              <Card 
                title={room.name}
                extra={<Link to={`/details/${room.id}`}>Details</Link>}
                className="room-card"
              >
                {data && (
                  <>
                    <div className="sensors-data">
                      {room.sensors.includes('temperature') && (
                        <Statistic title="Temperature" value={`${data.temperature}°C`} />
                      )}
                      {room.sensors.includes('humidity') && (
                        <Statistic title="Humidity" value={`${data.humidity}%`} />
                      )}
                      {room.sensors.includes('light') && (
                        <Statistic title="Light" value={`${data.light} lux`} />
                      )}
                      {room.sensors.includes('airQuality') && (
                        <Statistic title="Air Quality" value={`${data.airQuality} AQI`} />
                      )}
                    </div>
                    <div className="devices-control">
                      {room.devices.map(device => (
                        <div key={device} className="device-item">
                          <span>{device.replace('-', ' ').toUpperCase()}</span>
                          <Switch
                            checked={data.devices[device]}
                            onChange={() => handleDeviceToggle(room.id, device)}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </Col>
          )})
        }
      </Row>
    </div>
  );
};

export default Dashboard;