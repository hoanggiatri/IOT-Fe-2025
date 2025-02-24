import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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
    <div className="login-container">
      {userLoggedIn && <Navigate to="/" replace />}
      <Card className="login-card">
        <h2 className="login-title">Login</h2>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
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
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={isSigningIn}>
              Log in
            </Button>
          </Form.Item>
          <Form.Item>
            Or <Link to="/register">register now!</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;