import React, { ReactNode } from 'react';
import { Icon } from '@chatui/core';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  backTo = '/',
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          {showBackButton && (
            <Link
              to={backTo}
              className="flex items-center text-gray-600 dark:text-gray-300"
            >
              <Icon type="arrow-left" className="mr-1" />
              <span>Back</span>
            </Link>
          )}
          {!showBackButton && <div className="w-8" />}
          <div className="text-center flex-1">
            <h1 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
          <div className="w-8" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo or App Icon */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
              <Icon type="message" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
