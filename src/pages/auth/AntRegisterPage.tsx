import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Form } from 'antd-mobile';
import { useMessage } from '../../contexts/MessageContext';
import AntAuthLayout from '../../components/auth/AntAuthLayout';
import AntFormInput from '../../components/auth/AntFormInput';
import AntButton from '../../components/auth/AntButton';

const AntRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { showDialog } = useMessage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register(email, password, fullName);
      showDialog({
        content: 'Account created successfully!',
        confirmText: 'OK',
        onConfirm: () => navigate('/'),
      });
    } catch (error) {
      console.error('Registration error:', error);
      showDialog({
        content: 'Registration failed. Please try again.',
        confirmText: 'OK',
      });
    }
  };

  return (
    <AntAuthLayout
      title="Create account"
      subtitle="Join Parenting Assistant today"
      showBackButton
      backTo="/login"
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
            {isLoading ? 'Creating account...' : 'Create account'}
          </AntButton>
        }
      >
        <AntFormInput
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          label="Full name"
          value={fullName}
          onChange={setFullName}
          error={errors.fullName}
          icon="user"
          placeholder="Enter your full name"
        />

        <AntFormInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email address"
          value={email}
          onChange={setEmail}
          error={errors.email}
          icon="mail"
          placeholder="Enter your email"
        />

        <AntFormInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          label="Password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          icon="lock"
          placeholder="Create a password"
        />

        <AntFormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          icon="lock"
          placeholder="Confirm your password"
        />
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          By creating an account, you agree to our{' '}
          <Link to="#" className="text-blue-600">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="#" className="text-blue-600">
            Privacy Policy
          </Link>
        </p>
      </div>
    </AntAuthLayout>
  );
};

export default AntRegisterPage;
