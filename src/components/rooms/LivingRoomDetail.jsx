import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Space, Button, message, Tag, Empty, DatePicker } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import dayjs from 'dayjs';
import { SENSOR_THRESHOLDS } from '../../utils/constants';

const LivingRoomDetail = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDate, setSearchDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const getStatusColor = (value, type) => {
    const thresholds = SENSOR_THRESHOLDS.LIVING_ROOM[type];
    if (value > thresholds?.max) return 'red';
    if (value < thresholds?.min) return 'blue';
    return 'green';
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a, b) => a.timestamp - b.timestamp
    },
    {
      title: 'Temperature (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 150,
      render: (value) => (
        <Tag color={getStatusColor(value, 'temperature')}>
          {value}°C
        </Tag>
      ),
      sorter: (a, b) => a.temperature - b.temperature
    },
    {
      title: 'Humidity (%)',
      dataIndex: 'humidity',
      key: 'humidity',
      width: 150,
      render: (value) => (
        <Tag color={getStatusColor(value, 'humidity')}>
          {value}%
        </Tag>
      ),
      sorter: (a, b) => a.humidity - b.humidity
    },
    {
      title: 'Light (lux)',
      dataIndex: 'lightLux',
      key: 'lightLux',
      width: 150,
      render: (value) => (
        <Tag color={getStatusColor(value, 'light')}>
          {value} lux
        </Tag>
      ),
      sorter: (a, b) => a.lightLux - b.lightLux
    },
    {
      title: 'Gas (ppm)',
      dataIndex: 'gas',
      key: 'gas',
      width: 150,
      render: (value) => (
        <Tag color={getStatusColor(value, 'gas')}>
          {value} ppm
        </Tag>
      ),
      sorter: (a, b) => a.gas - b.gas
    }
  ];

  const parseTimestamp = (timestampStr) => {
    // Convert format "2025-04-04_17-44-50" to Date object
    const [datePart, timePart] = timestampStr.split('_');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split('-');
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const historiesRef = collection(db, "histories");
      const q = query(
        historiesRef,
        orderBy("Timestamp", "desc"),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const historiesData = [];
      
      querySnapshot.forEach((doc) => {
        const rawData = doc.data();
        const timestamp = parseTimestamp(rawData.Timestamp);
        
        historiesData.push({
          key: doc.id,
          timestamp: timestamp,
          temperature: Number(rawData.Temperature),
          humidity: Number(rawData.Humidity),
          lightLux: Number(rawData.LightValue),
          gas: Number(rawData.GasValue)
        });
      });

      console.log('Parsed data:', historiesData); // For debugging
      setData(historiesData);
      if (historiesData.length > 0) {
        message.success(`Loaded ${historiesData.length} records`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleSearch = async (date) => {
    setSearchLoading(true);
    // Add artificial delay to see loading effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (!date) {
        setFilteredData(data);
        setSearchLoading(false);
        return;
      }
  
      const searchStr = date.format('DD/MM/YYYY');
      const filtered = data.filter(item => 
        dayjs(item.timestamp).format('DD/MM/YYYY') === searchStr
      );
  
      setFilteredData(filtered);
      if (filtered.length === 0) {
        message.info(`No data found for date: ${searchStr}`);
      } else {
        message.success(`Found ${filtered.length} records for date: ${searchStr}`);
      }
    } catch (error) {
      message.error('Error while filtering data');
    } finally {
      setSearchLoading(false);
    }
  };

  // Kiểm tra nếu không có dữ liệu
  if (data.length === 0 && !loading) {
    return (
      <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
        <Card>
          <Empty 
            description="No data found for selected date range" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        title={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/living-room')}
            >
              Back
            </Button>
            <span>Living Room Detailed Data</span>
          </Space>
        }
        extra={
          <Space>
            <DatePicker
              placeholder="Select date to filter"
              value={searchDate}
              onChange={(date) => {
                setSearchDate(date);
                handleSearch(date);
              }}
              allowClear={true}
              style={{ width: 200 }}
              format="DD/MM/YYYY"
              disabled={loading || searchLoading} // Disable when either loading
              suffixIcon={searchLoading ? <LoadingOutlined /> : undefined} // Show loading icon
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setSearchDate(null);
                setFilteredData(data);
                fetchData();
              }}
              loading={loading}
              disabled={searchLoading} // Disable when searching
            />
          </Space>
        }
        style={{ borderRadius: '8px' }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={{
            spinning: loading || searchLoading,
            tip: searchLoading ? 'Searching...' : 'Loading data...',
            size: 'large'
          }}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => searchDate ? 
              `Total ${total} records for ${searchDate.format('DD/MM/YYYY')}` :
              `Total ${total} records`,
            showQuickJumper: true
          }}
          size="middle"
          bordered
        />
      </Card>
    </div>
  );
};

export default LivingRoomDetail;