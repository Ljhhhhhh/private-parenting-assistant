import React, { ButtonHTMLAttributes } from 'react';
import { Button } from 'antd-mobile';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  type?: 'submit' | 'button' | 'reset';
}

const AntButton: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  type = 'button',
  ...props
}) => {
  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'default';
      case 'outline':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getFill = () => {
    if (variant === 'outline') {
      return 'outline';
    }
    return 'solid';
  };

  return (
    <Button
      color={getButtonColor()}
      fill={getFill()}
      loading={loading}
      block={fullWidth}
      disabled={props.disabled}
      onClick={props.onClick}
      className={className}
      type={type}
    >
      {children}
    </Button>
  );
};

export default AntButton;
