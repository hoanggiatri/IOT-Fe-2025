import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'antd/dist/reset.css';

// Import your components
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TemperatureDetails from './components/details/TemperatureDetails';
import HumidityDetails from './components/details/HumidityDetails';
import LightDetails from './components/details/LightDetails';
import AirQualityDetails from './components/details/AirQualityDetails';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/authContext';
import Header from './components/Header';

const { Content } = Layout;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Layout>
          <Content>
            <div>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/temperature" element={<ProtectedRoute><TemperatureDetails /></ProtectedRoute>} />
                <Route path="/humidity" element={<ProtectedRoute><HumidityDetails /></ProtectedRoute>} />
                <Route path="/light" element={<ProtectedRoute><LightDetails /></ProtectedRoute>} />
                <Route path="/air-quality" element={<ProtectedRoute><AirQualityDetails /></ProtectedRoute>} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;