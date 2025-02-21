import React, { useState, useEffect } from 'react';
import { Table, DatePicker } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const AirQualityDetails = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Giả lập dữ liệu cảm biến
    const fetchData = () => {
      const generatedData = Array.from({ length: 30 }, (_, index) => ({
        key: index,
        date: moment().subtract(index, 'days').format('YYYY-MM-DD'),
        value: Math.random() * 100 + 50 // 50-150 AQI
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
    },
    {
      title: 'Air Quality (AQI)',
      dataIndex: 'value',
      key: 'value',
    }
  ];

  return (
    <div className="air-quality-details">
      <RangePicker onChange={handleDateChange} style={{ marginBottom: 20 }} />
      <Table columns={columns} dataSource={filteredData} />
    </div>
  );
};

export default AirQualityDetails;