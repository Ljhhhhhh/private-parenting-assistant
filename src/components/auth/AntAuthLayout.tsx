import React, { ReactNode } from 'react';
import { NavBar, Space, Avatar } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
}

const AntAuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  backTo = '/',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backTo);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Header */}
      <NavBar
        style={{ 
          backgroundColor: '#fff',
          '--height': '45px',
          borderBottom: '1px solid #eee'
        }}
        onBack={showBackButton ? handleBack : undefined}
        backArrow={showBackButton}
      >
        {title}
      </NavBar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo or App Icon */}
          <div className="text-center">
            <Avatar
              className="mb-4"
              style={{ 
                '--size': '64px',
                '--border-radius': '32px',
                backgroundColor: '#1677ff'
              }}
              src=""
            >
              <span style={{ fontSize: '28px' }}>PA</span>
            </Avatar>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntAuthLayout;
