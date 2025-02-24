import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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
    <div className="register-container">
      {userLoggedIn && <Navigate to="/" replace />}
      <Card className="register-card">
        <h2 className="register-title">Create a New Account</h2>
        <Form
          name="register"
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
          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: 'Please confirm your Password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="register-form-button" loading={isRegistering}>
              Sign Up
            </Button>
          </Form.Item>
          <Form.Item>
            Already have an account? <Link to="/login">Login now!</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;