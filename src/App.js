import React from 'react';
import { Layout, Menu } from 'antd';
import {
  FaTachometerAlt,
  FaUser,
  FaTemperatureHigh,
  FaTint,
  FaLightbulb,
  FaWind,
  FaSignInAlt
} from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import 'antd/dist/reset.css';

// Import your components
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TemperatureDetails from './components/details/TemperatureDetails';
import HumidityDetails from './components/details/HumidityDetails';
import LightDetails from './components/details/LightDetails';
import AirQualityDetails from './components/details/AirQualityDetails';
import Login from './components/Login';

const { Content, Sider } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
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
            <Menu.Item key="7" icon={<FaSignInAlt />}>
              <Link to="/login">Login</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ margin: '24px 16px 0' }}>
            <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/temperature" element={<TemperatureDetails />} />
                <Route path="/humidity" element={<HumidityDetails />} />
                <Route path="/light" element={<LightDetails />} />
                <Route path="/air-quality" element={<AirQualityDetails />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;