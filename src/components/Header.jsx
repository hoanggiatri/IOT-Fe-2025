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

  const menuItems = [
    {
      key: '1',
      label: <Link to="/living-room">Living Room</Link>,
    },
    {
      key: '2',
      label: <Link to="/bedroom-1">Bedroom 1</Link>,
    },
    {
      key: '3',
      label: <Link to="/bedroom-2">Bedroom 2</Link>,
    },
    {
      key: '4',
      label: <Link to="/kitchen">Kitchen</Link>,
    },
    {
      key: '5',
      label: <Link to="/devices">Device Management</Link>,
    },
    {
      key: '6',
      label: <Link to="/profile">Profile</Link>,
    }
  ];

  return (
    <AntHeader className="header">
      {userLoggedIn ? (
        <>
          <Menu 
            theme="dark" 
            mode="horizontal" 
            defaultSelectedKeys={['1']} 
            style={{ flex: 1 }}
            items={menuItems}
          />
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