import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import './App.css';
import 'antd/dist/reset.css';

import Detail from './components/rooms/Detail';
import Dashboard from './components/Dashboard';
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
              <Route path="/detail" element={<ProtectedRoute><Detail /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;