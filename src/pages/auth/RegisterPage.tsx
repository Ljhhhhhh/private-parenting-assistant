import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import Button from '../../components/auth/Button';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(email, password, fullName);
      // Redirect to dashboard after successful registration
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Parenting Assistant today"
      showBackButton
      backTo="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormInput
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          icon="user"
          placeholder="Enter your full name"
        />

        <FormInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon="mail"
          placeholder="Enter your email"
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon="lock"
          placeholder="Create a password"
        />

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          icon="lock"
          placeholder="Confirm your password"
        />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          By creating an account, you agree to our{' '}
          <a
            href="#"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
