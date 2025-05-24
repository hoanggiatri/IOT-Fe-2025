import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../firebase/auth';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge, Typography, Divider } from 'antd';
import { 
  LoginOutlined, 
  LogoutOutlined, 
  UserAddOutlined, 
  HomeOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  DashboardOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import '../styles/layout/Header.css';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userLoggedIn } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Giả lập thông báo
  const notifications = [
    { id: 1, message: 'Gas level warning in Living Room', read: false },
    { id: 2, message: 'Smart light turned on', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const userMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: <Link to="/profile">Profile</Link>,
          icon: <UserOutlined />
        },
        {
          key: '2',
          label: <Link to="/settings">Settings</Link>,
          icon: <SettingOutlined />
        },
        {
          type: 'divider',
        },
        {
          key: '3',
          label: 'Logout',
          icon: <LogoutOutlined />,
          danger: true,
          onClick: () => { doSignOut().then(() => { navigate('/login') }) }
        },
      ]}
    />
  );

  const notificationsMenu = (
    <Menu
      className="notification-menu"
      items={notifications.map((notification, index) => ({
        key: notification.id.toString(),
        label: (
          <div className={`notification-item ${!notification.read ? 'unread' : ''}`}>
            <Text>{notification.message}</Text>
            {!notification.read && <Badge status="processing" />}
          </div>
        ),
      }))}
      footer={
        <div className="notification-footer">
          <Button type="link" size="small">
            View All
          </Button>
          <Button type="link" size="small">
            Mark All as Read
          </Button>
        </div>
      }
    />
  );

  const menuItems = [
    {
      key: 'living-room',
      icon: <HomeOutlined />,
      label: <Link to="/living-room">Living Room</Link>,
    },
  ];

  return (
    <AntHeader className="header">
      <div className="logo-container">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="menu-toggle-button"
        />
        <Link to="/" className="logo-link">
          <div className="logo">
            <DashboardOutlined className="logo-icon" />
            <Title level={4} className="logo-text">IoT Dashboard</Title>
          </div>
        </Link>
      </div>

      {userLoggedIn ? (
        <>
          <Menu 
            theme="dark" 
            mode="horizontal" 
            selectedKeys={[location.pathname.split('/')[1] || 'living-room']}
            style={{ flex: 1 }}
            items={menuItems}
            className="main-menu"
          />
          <div className="auth-buttons">
            <Dropdown overlay={notificationsMenu} trigger={['click']} placement="bottomRight">
              <Badge count={unreadCount} size="small" className="notification-badge">
                <Button type="text" icon={<BellOutlined />} className="header-icon-button" />
              </Badge>
            </Dropdown>

            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <Button type="text" className="user-profile-button">
                <Space>
                  <Avatar icon={<UserOutlined />} size="small" className="user-avatar" />
                  <span className="username">User</span>
                </Space>
              </Button>
            </Dropdown>
          </div>
        </>
      ) : (
        <div className="auth-buttons">
          <Button type="primary" icon={<LoginOutlined />} className="auth-button">
            <Link to="/login">Login</Link>
          </Button>
          <Button type="default" icon={<UserAddOutlined />} className="auth-button">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      )}
    </AntHeader>
  );
};

export default Header;