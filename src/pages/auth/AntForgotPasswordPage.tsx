import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Form, Result } from 'antd-mobile';
import { useMessage } from '../../contexts/MessageContext';
import { CheckCircleOutline, LockOutline } from 'antd-mobile-icons';
import AntAuthLayout from '../../components/auth/AntAuthLayout';
import AntFormInput from '../../components/auth/AntFormInput';
import AntButton from '../../components/auth/AntButton';

const AntForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const { showDialog } = useMessage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      showDialog({
        content: 'Please enter your email address',
        confirmText: 'OK',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      showDialog({
        content: 'Reset link sent successfully',
        confirmText: 'OK',
      });
    } catch (err) {
      console.error('Password recovery failed:', err);
      showDialog({
        content: 'Failed to send password reset email',
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
      subtitle="We'll send you a link to reset your password"
      showBackButton
      backTo="/login"
    >
      {success ? (
        <Result
          icon={<CheckCircleOutline color="#07c160" />}
          status="success"
          title="Email sent"
          description={
            <p className="text-sm text-gray-500">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
          }
        >
          <div className="mt-6">
            <AntButton fullWidth onClick={handleBackToLogin}>
              Return to login
            </AntButton>
          </div>
        </Result>
      ) : (
        <div>
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-50 text-blue-600">
              <LockOutline fontSize={28} />
            </div>
          </div>

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            footer={
              <AntButton
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                fullWidth
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
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
              placeholder="Enter your email address"
            />
          </Form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm font-medium text-blue-600">
              Back to login
            </Link>
          </div>
        </div>
      )}
    </AntAuthLayout>
  );
};

export default AntForgotPasswordPage;
