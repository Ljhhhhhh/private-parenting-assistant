import React, { ButtonHTMLAttributes } from 'react';
import { Button as ChatButton } from '@chatui/core';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white';
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white';
      case 'outline':
        return 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white';
    }
  };

  return (
    <ChatButton
      className={`rounded-lg py-3 px-4 font-medium text-center transition-colors ${
        fullWidth ? 'w-full' : ''
      } ${getVariantClasses()} ${className}`}
      color={variant === 'primary' ? 'primary' : undefined}
      loading={loading}
      icon={icon}
      {...props}
    >
      {children}
    </ChatButton>
  );
};

export default Button;
