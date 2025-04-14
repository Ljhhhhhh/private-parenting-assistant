import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '@chatui/core';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import Button from '../../components/auth/Button';

const ResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Extract token from URL using React Router's useLocation
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location.search]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!token) {
      setError('Invalid or missing reset token');
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
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(
        'Failed to reset password. The token may be invalid or expired.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Create a new password for your account"
      showBackButton
      backTo="/login"
    >
      {success ? (
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-green-100 text-green-500">
            <Icon type="check" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            Password reset successful
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Your password has been reset successfully. You can now sign in with
            your new password.
          </p>
          <Link to="/login">
            <Button fullWidth>Sign in with new password</Button>
          </Link>
        </div>
      ) : (
        <div>
          {!token && (
            <div className="p-4 mb-4 rounded-md bg-yellow-50 text-yellow-800 text-sm">
              <div className="flex">
                <div className="flex-shrink-0 mr-2">
                  <Icon type="warning" />
                </div>
                <div>
                  Missing reset token. Please use the link from your email.
                </div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon="lock"
              placeholder="Enter new password"
            />

            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon="lock"
              placeholder="Confirm new password"
            />

            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !token}
                loading={isSubmitting}
                fullWidth
              >
                {isSubmitting ? 'Resetting password...' : 'Reset password'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
