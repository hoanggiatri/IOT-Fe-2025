import React from 'react';
import { Layout, Menu } from 'antd';
import {
  FaTachometerAlt,
  FaUser,
  FaTemperatureHigh,
  FaTint,
  FaLightbulb,
  FaWind,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const MenuBar = () => {
  return (
    <Sider theme="dark" width={200} collapsible>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
      >
        <Menu.Item key="1" icon={<FaTachometerAlt />}>
          <Link to="/">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<FaUser />}>
          <Link to="/profile">Profile</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<FaTemperatureHigh />}>
          <Link to="/temperature">Temperature</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<FaTint />}>
          <Link to="/humidity">Humidity</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<FaLightbulb />}>
          <Link to="/light">Light</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<FaWind />}>
          <Link to="/air-quality">Air Quality</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default MenuBar;