import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { doSignInWithEmailAndPassword } from '../../firebase/auth';
import { useAuth } from '../../contexts/authContext';
import '../../styles/components/Login.css';

const Login = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onFinish = async (values) => {
    setIsSigningIn(true);
    try {
      await doSignInWithEmailAndPassword(values.email, values.password);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="auth-bg-gradient">
      {userLoggedIn && <Navigate to="/" replace />}
      <div className="auth-center-wrapper">
        <Card className="auth-card animate-fade-in">
          <div className="auth-logo">
            <HomeOutlined />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your smart home dashboard</p>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please input your Email!' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" className="auth-form-button" loading={isSigningIn} block>
                Log in
              </Button>
            </Form.Item>
            <div className="auth-link">
              Don't have an account? <Link to="/register">Register now</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;