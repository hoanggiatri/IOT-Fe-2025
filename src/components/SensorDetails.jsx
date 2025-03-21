import React, { useState, useEffect } from 'react';
import { Table, DatePicker } from 'antd';
import moment from 'moment';
import '../styles/components/SensorDetails.css';

const { RangePicker } = DatePicker;

const SensorDetails = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Giả lập dữ liệu cảm biến
    const fetchData = () => {
      const generatedData = Array.from({ length: 30 }, (_, index) => ({
        key: index,
        date: moment().subtract(index, 'days').format('YYYY-MM-DD'),
        temperature: (Math.random() * 10 + 20).toFixed(1), // 20-30°C
        humidity: (Math.random() * 20 + 40).toFixed(1), // 40-60%
        light: Math.floor(Math.random() * 500 + 100), // 100-600 lux
        airQuality: Math.floor(Math.random() * 100 + 50), // 50-150 AQI
      }));
      setData(generatedData);
      setFilteredData(generatedData);
    };

    fetchData();
  }, []);

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
      width: '20%',
    },
    {
      title: 'Temperature (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      width: '20%',
    },
    {
      title: 'Humidity (%)',
      dataIndex: 'humidity',
      key: 'humidity',
      width: '20%',
    },
    {
      title: 'Light (lux)',
      dataIndex: 'light',
      key: 'light',
      width: '20%',
    },
    {
      title: 'Air Quality (AQI)',
      dataIndex: 'airQuality',
      key: 'airQuality',
      width: '20%',
    }
  ];

  return (
    <div className="sensor-details">
      <h2>Sensor Data History</h2>
      <RangePicker onChange={handleDateChange} style={{ marginBottom: 20 }} />
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        pagination={{ pageSize: 8 }}
        scroll={{ x: true }} 
      />
    </div>
  );
};

export default SensorDetails;