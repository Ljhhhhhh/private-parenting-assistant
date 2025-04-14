import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Checkbox } from '@chatui/core';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import Button from '../../components/auth/Button';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      console.error('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      console.log('Login successful!');
      // Redirect to dashboard after successful login
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Invalid email or password');
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to Parenting Assistant">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon="user"
          placeholder="Enter your email"
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon="lock"
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between">
          <Checkbox className="text-sm text-gray-700 dark:text-gray-300">
            Remember me
          </Checkbox>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          loading={isLoading}
          fullWidth
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-3 text-sm text-gray-500">Or</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
        </p>
        <Link to="/register">
          <Button variant="outline" fullWidth>
            Create a new account
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
