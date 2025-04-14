import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Form, Checkbox, Divider } from 'antd-mobile';
import { useMessage } from '../../contexts/MessageContext';
import AntAuthLayout from '../../components/auth/AntAuthLayout';
import AntFormInput from '../../components/auth/AntFormInput';
import AntButton from '../../components/auth/AntButton';

const AntLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showDialog } = useMessage();
  const [email, setEmail] = useState('13216698987@163.com');
  const [password, setPassword] = useState('Guanmo!01');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      showDialog({
        content: 'Please enter both email and password',
        confirmText: 'OK',
      });
      return;
    }

    try {
      await login(email, password);
      showDialog({
        content: 'Login successful!',
        confirmText: 'OK',
        onConfirm: () => navigate('/'),
      });
    } catch (error) {
      console.error('Login error:', error);
      showDialog({
        content: 'Invalid email or password. Please try again.',
        confirmText: 'OK',
      });
    }
  };

  return (
    <AntAuthLayout
      title="Sign in"
      subtitle="Welcome back to Parenting Assistant"
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        footer={
          <AntButton
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </AntButton>
        }
      >
        <AntFormInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email address"
          value={email}
          onChange={setEmail}
          icon="mail"
          placeholder="Enter your email"
        />

        <AntFormInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          label="Password"
          value={password}
          onChange={setPassword}
          icon="lock"
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between mb-4">
          <Checkbox checked={rememberMe} onChange={setRememberMe}>
            <span className="text-sm text-gray-700">Remember me</span>
          </Checkbox>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-blue-600"
          >
            Forgot password?
          </Link>
        </div>
      </Form>

      <Divider>Or</Divider>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-500">Don't have an account?</p>
        <Link to="/register">
          <AntButton variant="outline" fullWidth>
            Create a new account
          </AntButton>
        </Link>
      </div>
    </AntAuthLayout>
  );
};

export default AntLoginPage;
