import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth';
import { useAuth } from '../../contexts/authContext';
import '../../styles/components/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onFinish = async (values) => {
    setIsRegistering(true);
    try {
      await doCreateUserWithEmailAndPassword(values.email, values.password);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message);
      setIsRegistering(false);
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the smart home experience</p>
          <Form
            name="register"
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
            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: 'Please confirm your Password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Item>
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" className="auth-form-button" loading={isRegistering} block>
                Sign Up
              </Button>
            </Form.Item>
            <div className="auth-link">
              Already have an account? <Link to="/login">Login now</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Register;