import React, { useState } from 'react';
import { Card, Row, Col, Switch, Select, Space, Table, Tag, Typography, Badge, Tooltip } from 'antd';
import { 
  ROOMS, 
  DEVICE_SETTINGS 
} from '../utils/constants';
import { 
  BulbOutlined,
  BulbFilled,
  ThunderboltOutlined,
  ControlOutlined,
  HomeOutlined
} from '@ant-design/icons';
import '../styles/components/DeviceManagement.css';

const { Title, Text } = Typography;

const DeviceManagement = () => {
  const [deviceStates, setDeviceStates] = useState(
    Object.values(ROOMS).reduce((acc, room) => {
      room.devices.forEach(device => {
        acc[`${room.id}-${device}`] = {
          on: false,
          level: DEVICE_SETTINGS[device].defaultLevel
        };
      });
      return acc;
    }, {})
  );

  const getDeviceIcon = (device, isOn = false) => {
    switch(device) {
      case 'light':
        return isOn ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined style={{ color: '#faad14' }} />;
      case 'fan':
        return <ControlOutlined style={{ color: isOn ? '#1890ff' : 'rgba(0,0,0,0.45)' }} />;
      case 'air-conditioner':
        return <ThunderboltOutlined style={{ color: isOn ? '#52c41a' : 'rgba(0,0,0,0.45)' }} />;
      case 'exhaust-fan':
        return <ControlOutlined style={{ color: isOn ? '#1890ff' : 'rgba(0,0,0,0.45)' }} />;
      default:
        return null;
    }
  };

  const handleDeviceToggle = (roomId, device, checked) => {
    const key = `${roomId}-${device}`;
    setDeviceStates(prev => ({
      ...prev,
      [key]: { ...prev[key], on: checked }
    }));
  };

  const handleDeviceLevelChange = (roomId, device, value) => {
    const key = `${roomId}-${device}`;
    setDeviceStates(prev => ({
      ...prev,
      [key]: { ...prev[key], level: value }
    }));
  };

  const columns = [
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
      width: '20%',
      render: (room) => (
        <Space>
          <HomeOutlined />
          <Text className="room-name">{room}</Text>
        </Space>
      )
    },
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
      width: '25%',
      render: (device, record) => {
        const state = deviceStates[`${record.roomId}-${device}`];
        return (
          <span className="device-name">
            {getDeviceIcon(device, state.on)}
            {device.replace('-', ' ').toUpperCase()}
          </span>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (_, record) => {
        const state = deviceStates[`${record.roomId}-${record.device}`];
        return (
          <Badge status={state.on ? "success" : "default"}>
            <Tag color={state.on ? 'success' : 'default'} className="device-status-tag">
              {state.on ? 'ON' : 'OFF'}
            </Tag>
          </Badge>
        );
      }
    },
    {
      title: 'Control',
      key: 'control',
      render: (_, record) => {
        const settings = DEVICE_SETTINGS[record.device];
        const state = deviceStates[`${record.roomId}-${record.device}`];
        
        return (
          <div className="device-control-cell">
            <Tooltip title={state.on ? "Turn Off" : "Turn On"}>
              <Switch
                checked={state.on}
                onChange={(checked) => handleDeviceToggle(record.roomId, record.device, checked)}
              />
            </Tooltip>
            {state.on && (settings.type === 'dimmer' || settings.type === 'speed') && (
              <Select
                value={state.level}
                onChange={(value) => handleDeviceLevelChange(record.roomId, record.device, value)}
                className="device-level-select"
                bordered={true}
                placeholder={`Select ${settings.type}`}
              >
                {settings.levels.map(level => (
                  <Select.Option key={level} value={level}>
                    {settings.type === 'dimmer' ? `${level}%` : `Speed ${level}`}
                  </Select.Option>
                ))}
              </Select>
            )}
          </div>
        );
      }
    }
  ];

  const data = Object.values(ROOMS).flatMap(room => 
    room.devices.map(device => ({
      key: `${room.id}-${device}`,
      room: room.name,
      roomId: room.id,
      device: device
    }))
  );

  const expandedRowRender = (record) => {
    const settings = DEVICE_SETTINGS[record.device];
    const state = deviceStates[`${record.roomId}-${record.device}`];
    
    return (
      <div className="device-info">
        <Space direction="vertical">
          <Text><strong>Type:</strong> {settings.type.toUpperCase()}</Text>
          <Text><strong>Current Level:</strong> {state.level} {settings.unit}</Text>
          <Text><strong>Available Levels:</strong> {settings.levels.join(', ')} {settings.unit}</Text>
        </Space>
      </div>
    );
  };

  return (
    <div className="device-management">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>
            <Space>
              <ControlOutlined />
              Device Management
            </Space>
          </Title>
        </Col>
        <Col span={24}>
          <Card bordered={false}>
            <Table 
              className="device-table"
              columns={columns} 
              dataSource={data}
              pagination={false}
              expandable={{
                expandedRowRender,
                expandRowByClick: true
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DeviceManagement;