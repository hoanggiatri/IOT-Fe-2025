import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../firebase/auth';
import { Layout, Menu, Button } from 'antd';
import { LoginOutlined, LogoutOutlined, UserAddOutlined } from '@ant-design/icons';
import '../styles/layout/Header.css';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  return (
    <AntHeader className="header">
      {userLoggedIn ? (
        <>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} style={{ flex: 1 }}>
            <Menu.Item key="1">
              <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/profile">Profile</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/temperature">Temperature</Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to="/humidity">Humidity</Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to="/light">Light</Link>
            </Menu.Item>
            <Menu.Item key="6">
              <Link to="/air-quality">Air Quality</Link>
            </Menu.Item>
          </Menu>
          <div className="auth-buttons">
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              onClick={() => { doSignOut().then(() => { navigate('/login') }) }}
            >
              Logout
            </Button>
          </div>
        </>
      ) : (
        <div className="auth-buttons">
          <Button type="primary" icon={<LoginOutlined />} style={{ marginRight: '10px' }}>
            <Link to="/login">Login</Link>
          </Button>
          <Button type="primary" icon={<UserAddOutlined />}>
            <Link to="/register">Register</Link>
          </Button>
        </div>
      )}
    </AntHeader>
  );
};

export default Header;