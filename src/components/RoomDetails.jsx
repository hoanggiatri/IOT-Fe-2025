import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, DatePicker, Card } from 'antd';
import moment from 'moment';
import { ROOMS } from '../utils/constants';
import '../styles/components/RoomDetails.css';

const { RangePicker } = DatePicker;

const RoomDetails = () => {
  const { roomId } = useParams();
  const room = Object.values(ROOMS).find(r => r.id === roomId);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Giả lập dữ liệu lịch sử
    const fetchData = () => {
      const generatedData = Array.from({ length: 30 }, (_, index) => ({
        key: index,
        date: moment().subtract(index, 'days').format('YYYY-MM-DD HH:mm:ss'),
        temperature: room.sensors.includes('temperature') ? (Math.random() * 10 + 20).toFixed(1) : null,
        humidity: room.sensors.includes('humidity') ? (Math.random() * 20 + 40).toFixed(1) : null,
        light: room.sensors.includes('light') ? Math.floor(Math.random() * 500 + 100) : null,
        airQuality: room.sensors.includes('airQuality') ? Math.floor(Math.random() * 100 + 50) : null,
        gas: room.sensors.includes('gas') ? Math.floor(Math.random() * 100) : null,
        smoke: room.sensors.includes('smoke') ? Math.floor(Math.random() * 100) : null,
      }));
      setData(generatedData);
      setFilteredData(generatedData);
    };

    fetchData();
  }, [room]);

  const handleDateChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      const filtered = data.filter(item => {
        const itemDate = moment(item.date);
        return itemDate.isBetween(start, end, 'days', '[]');
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    ...(room.sensors.includes('temperature') ? [{
      title: 'Temperature (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
    }] : []),
    ...(room.sensors.includes('humidity') ? [{
      title: 'Humidity (%)',
      dataIndex: 'humidity',
      key: 'humidity',
    }] : []),
    ...(room.sensors.includes('light') ? [{
      title: 'Light (lux)',
      dataIndex: 'light',
      key: 'light',
    }] : []),
    ...(room.sensors.includes('airQuality') ? [{
      title: 'Air Quality (AQI)',
      dataIndex: 'airQuality',
      key: 'airQuality',
    }] : []),
    ...(room.sensors.includes('gas') ? [{
      title: 'Gas Level',
      dataIndex: 'gas',
      key: 'gas',
    }] : []),
    ...(room.sensors.includes('smoke') ? [{
      title: 'Smoke Level',
      dataIndex: 'smoke',
      key: 'smoke',
    }] : []),
  ];

  return (
    <div className="room-details">
      <Card title={`${room.name} - Sensor Data History`}>
        <RangePicker onChange={handleDateChange} style={{ marginBottom: 20 }} />
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          pagination={{ pageSize: 8 }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default RoomDetails;