import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '@chatui/core';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import Button from '../../components/auth/Button';

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error('Password recovery failed:', err);
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll send you a link to reset your password"
      showBackButton
      backTo="/login"
    >
      {success ? (
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-green-100 text-green-500">
            <Icon type="check" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            Email sent
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            We've sent a password reset link to <strong>{email}</strong>. Please
            check your inbox and follow the instructions.
          </p>
          <Link to="/login">
            <Button fullWidth>Return to login</Button>
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary-100 text-primary-600">
              <Icon type="lock" />
            </div>
          </div>

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
              icon="mail"
              placeholder="Enter your email address"
              error={error || undefined}
            />

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                fullWidth
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
