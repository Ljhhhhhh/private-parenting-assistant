import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  loading?: boolean;
  block?: boolean;
  gradient?: boolean; // 新增渐变选项
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  block = false,
  gradient = false,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  let base =
    'inline-flex items-center justify-center font-medium rounded-btn transition-all duration-300 focus:outline-none';
  let color = '';

  // 根据设计规范调整尺寸
  // 主按钮48px，次要按钮44px，文本按钮40px
  const size =
    variant === 'primary'
      ? 'h-12 px-6 text-base' // 48px
      : variant === 'secondary'
      ? 'h-11 px-6 text-base' // 44px
      : 'h-10 px-2 text-base'; // 40px

  if (variant === 'primary') {
    color = gradient
      ? 'bg-gradient-to-r from-primary to-primary-light text-text-white hover:from-primary-dark hover:to-primary disabled:opacity-60'
      : 'bg-primary text-text-white hover:bg-primary-dark active:bg-primary-dark disabled:bg-primary disabled:opacity-60';
  } else if (variant === 'secondary') {
    color =
      'bg-gray-50 border border-primary text-primary hover:bg-primary-light/10 active:bg-primary-light/20 disabled:text-primary disabled:opacity-60';
  } else if (variant === 'text') {
    color =
      'bg-transparent text-primary hover:bg-primary-light/10 active:bg-primary-light/20 disabled:text-primary disabled:opacity-60';
  }

  if (block) {
    base += ' w-full';
  }

  return (
    <button
      className={`${base} ${color} ${size} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="w-5 h-5 mr-2 border-2 border-gray-50 rounded-full animate-spin border-t-transparent"></span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
