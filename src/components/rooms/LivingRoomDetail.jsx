import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Space, Button, message, Tag, Empty, DatePicker, InputNumber, Slider, Row, Col, Form } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, LoadingOutlined, FilterOutlined } from '@ant-design/icons';
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
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    temperature: { min: null, max: null },
    humidity: { min: null, max: null },
    lightLux: { min: null, max: null },
    gas: { min: null, max: null },
  });

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

      setData(historiesData);
      if (historiesData.length > 0) {
        message.success(`Loaded ${historiesData.length} records`);
      }
    } catch (error) {
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

  const handleSearch = async (date, sensorFilters = filters) => {
    setSearchLoading(true);
    // Add artificial delay to see loading effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      let filtered = [...data];
      
      // Date filtering
      if (date) {
        const searchStr = date.format('DD/MM/YYYY');
        filtered = filtered.filter(item => 
          dayjs(item.timestamp).format('DD/MM/YYYY') === searchStr
        );
      }
      
      // Temperature filtering
      if (sensorFilters.temperature.min !== null) {
        filtered = filtered.filter(item => item.temperature >= sensorFilters.temperature.min);
      }
      if (sensorFilters.temperature.max !== null) {
        filtered = filtered.filter(item => item.temperature <= sensorFilters.temperature.max);
      }
      
      // Humidity filtering
      if (sensorFilters.humidity.min !== null) {
        filtered = filtered.filter(item => item.humidity >= sensorFilters.humidity.min);
      }
      if (sensorFilters.humidity.max !== null) {
        filtered = filtered.filter(item => item.humidity <= sensorFilters.humidity.max);
      }
      
      // Light filtering
      if (sensorFilters.lightLux.min !== null) {
        filtered = filtered.filter(item => item.lightLux >= sensorFilters.lightLux.min);
      }
      if (sensorFilters.lightLux.max !== null) {
        filtered = filtered.filter(item => item.lightLux <= sensorFilters.lightLux.max);
      }
      
      // Gas filtering
      if (sensorFilters.gas.min !== null) {
        filtered = filtered.filter(item => item.gas >= sensorFilters.gas.min);
      }
      if (sensorFilters.gas.max !== null) {
        filtered = filtered.filter(item => item.gas <= sensorFilters.gas.max);
      }
  
      setFilteredData(filtered);
      if (filtered.length === 0) {
        message.info(`No data found for the selected filters`);
      } else {
        message.success(`Found ${filtered.length} records matching your criteria`);
      }
    } catch (error) {
      message.error('Error while filtering data');
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handleFilterChange = (type, minOrMax, value) => {
    const newFilters = { ...filters };
    newFilters[type][minOrMax] = value;
    setFilters(newFilters);
  };
  
  const applyFilters = () => {
    handleSearch(searchDate, filters);
  };
  
  const resetFilters = () => {
    form.resetFields();
    setFilters({
      temperature: { min: null, max: null },
      humidity: { min: null, max: null },
      lightLux: { min: null, max: null },
      gas: { min: null, max: null },
    });
    handleSearch(searchDate, {
      temperature: { min: null, max: null },
      humidity: { min: null, max: null },
      lightLux: { min: null, max: null },
      gas: { min: null, max: null },
    });
  };

  // Kiểm tra nếu không có dữ liệu
  if (data.length === 0 && !loading) {
    return (
      <div style={{ padding: '84px 24px 24px', background: '#f0f2f5', minHeight: '100vh' }}>
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
    <div style={{ padding: '84px 24px 24px', background: '#f0f2f5', minHeight: '100vh' }}>
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
                handleSearch(date, filters);
              }}
              allowClear={true}
              style={{ width: 200 }}
              format="DD/MM/YYYY"
              disabled={loading || searchLoading}
              suffixIcon={searchLoading ? <LoadingOutlined /> : undefined}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setSearchDate(null);
                resetFilters();
                fetchData();
              }}
              loading={loading}
              disabled={searchLoading}
            />
          </Space>
        }
        style={{ borderRadius: '8px', marginBottom: '16px' }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginBottom: '20px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Temperature (°C)">
                <Row gutter={8}>
                  <Col span={11}>
                    <Form.Item name={['temperature', 'min']} noStyle>
                      <InputNumber
                        placeholder="Min"
                        onChange={(value) => handleFilterChange('temperature', 'min', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>-</Col>
                  <Col span={11}>
                    <Form.Item name={['temperature', 'max']} noStyle>
                      <InputNumber
                        placeholder="Max"
                        onChange={(value) => handleFilterChange('temperature', 'max', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Humidity (%)">
                <Row gutter={8}>
                  <Col span={11}>
                    <Form.Item name={['humidity', 'min']} noStyle>
                      <InputNumber
                        placeholder="Min"
                        onChange={(value) => handleFilterChange('humidity', 'min', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>-</Col>
                  <Col span={11}>
                    <Form.Item name={['humidity', 'max']} noStyle>
                      <InputNumber
                        placeholder="Max"
                        onChange={(value) => handleFilterChange('humidity', 'max', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Light (lux)">
                <Row gutter={8}>
                  <Col span={11}>
                    <Form.Item name={['lightLux', 'min']} noStyle>
                      <InputNumber
                        placeholder="Min"
                        onChange={(value) => handleFilterChange('lightLux', 'min', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>-</Col>
                  <Col span={11}>
                    <Form.Item name={['lightLux', 'max']} noStyle>
                      <InputNumber
                        placeholder="Max"
                        onChange={(value) => handleFilterChange('lightLux', 'max', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Gas (ppm)">
                <Row gutter={8}>
                  <Col span={11}>
                    <Form.Item name={['gas', 'min']} noStyle>
                      <InputNumber
                        placeholder="Min"
                        onChange={(value) => handleFilterChange('gas', 'min', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>-</Col>
                  <Col span={11}>
                    <Form.Item name={['gas', 'max']} noStyle>
                      <InputNumber
                        placeholder="Max"
                        onChange={(value) => handleFilterChange('gas', 'max', value)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button onClick={resetFilters}>Reset Filters</Button>
              <Button 
                type="primary" 
                onClick={applyFilters} 
                icon={<FilterOutlined />} 
                loading={searchLoading}
              >
                Apply Filters
              </Button>
            </Space>
          </Row>
        </Form>
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
            showTotal: (total) => `Total ${total} records found`,
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