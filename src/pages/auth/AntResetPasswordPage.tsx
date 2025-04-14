import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Form, Result, ErrorBlock } from 'antd-mobile';
import { useMessage } from '../../contexts/MessageContext';
import {
  CheckCircleOutline,
  ExclamationCircleOutline,
} from 'antd-mobile-icons';
import AntAuthLayout from '../../components/auth/AntAuthLayout';
import AntFormInput from '../../components/auth/AntFormInput';
import AntButton from '../../components/auth/AntButton';

const AntResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { showDialog } = useMessage();
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
      showDialog({
        content: 'Missing reset token',
        confirmText: 'OK',
      });
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
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      showDialog({
        content: 'Password reset successful',
        confirmText: 'OK',
      });
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(
        'Failed to reset password. The token may be invalid or expired.',
      );
      showDialog({
        content: 'Failed to reset password',
        confirmText: 'OK',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <AntAuthLayout
      title="Reset password"
      subtitle="Create a new password for your account"
      showBackButton
      backTo="/login"
    >
      {success ? (
        <Result
          icon={<CheckCircleOutline color="#07c160" />}
          status="success"
          title="Password reset successful"
          description="Your password has been reset successfully. You can now sign in with your new password."
        >
          <div className="mt-6">
            <AntButton fullWidth onClick={handleBackToLogin}>
              Sign in with new password
            </AntButton>
          </div>
        </Result>
      ) : (
        <div>
          {!token && (
            <ErrorBlock
              status="warning"
              title="Missing reset token"
              description="Please use the link from your email."
            />
          )}

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            footer={
              <AntButton
                type="submit"
                disabled={isSubmitting || !token}
                loading={isSubmitting}
                fullWidth
              >
                {isSubmitting ? 'Resetting password...' : 'Reset password'}
              </AntButton>
            }
          >
            <AntFormInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              label="New password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              icon="lock"
              placeholder="Enter new password"
            />

            <AntFormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              icon="lock"
              placeholder="Confirm new password"
            />

            {error && (
              <ErrorBlock status="error" title="Error" description={error} />
            )}
          </Form>
        </div>
      )}
    </AntAuthLayout>
  );
};

export default AntResetPasswordPage;
