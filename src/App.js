import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'antd/dist/reset.css';

import LivingRoom from './components/rooms/LivingRoom';
import LivingRoomDetail from './components/rooms/LivingRoomDetail';
import Bedroom1 from './components/rooms/Bedroom1';
import Bedroom2 from './components/rooms/Bedroom2';
import Kitchen from './components/rooms/Kitchen';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/authContext';
import Header from './components/Header';
import DeviceManagement from './components/DeviceManagement';

const { Content } = Layout;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Layout>
          <Content>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/living-room" element={<ProtectedRoute><LivingRoom /></ProtectedRoute>} />
              <Route path="/living-room/detail" element={<ProtectedRoute><LivingRoomDetail /></ProtectedRoute>} />
              <Route path="/bedroom-1" element={<ProtectedRoute><Bedroom1 /></ProtectedRoute>} />
              <Route path="/bedroom-2" element={<ProtectedRoute><Bedroom2 /></ProtectedRoute>} />
              <Route path="/kitchen" element={<ProtectedRoute><Kitchen /></ProtectedRoute>} />
              <Route path="/devices" element={<ProtectedRoute><DeviceManagement /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><LivingRoom /></ProtectedRoute>} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;