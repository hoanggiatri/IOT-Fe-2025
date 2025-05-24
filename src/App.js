import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import './App.css';
import 'antd/dist/reset.css';

import LivingRoom from './components/rooms/LivingRoom';
import LivingRoomDetail from './components/rooms/LivingRoomDetail';
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
        <Layout>
          <Header />
          <Content className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/living-room" element={<ProtectedRoute><LivingRoom /></ProtectedRoute>} />
              <Route path="/living-room/detail" element={<ProtectedRoute><LivingRoomDetail /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><LivingRoom /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/living-room" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;