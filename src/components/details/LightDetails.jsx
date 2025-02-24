import React, { useState, useEffect } from 'react';
import { Table, DatePicker } from 'antd';
import moment from 'moment';
import '../../styles/components/details/LightDetails.css';

const { RangePicker } = DatePicker;

const LightDetails = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Giả lập dữ liệu cảm biến
    const fetchData = () => {
      const generatedData = Array.from({ length: 30 }, (_, index) => ({
        key: index,
        date: moment().subtract(index, 'days').format('YYYY-MM-DD'),
        value: Math.random() * 500 + 100 // 100-600 lux
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
      title: 'Light (lux)',
      dataIndex: 'value',
      key: 'value',
    }
  ];

  return (
    <div className="light-details">
      <RangePicker onChange={handleDateChange} style={{ marginBottom: 20 }} />
      <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 8 }} />
    </div>
  );
};

export default LightDetails;