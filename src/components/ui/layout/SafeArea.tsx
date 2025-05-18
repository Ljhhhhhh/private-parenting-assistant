import React from 'react';

export interface SafeAreaProps {
  position?: 'top' | 'bottom' | 'both';
  children?: React.ReactNode;
  className?: string;
}

const SafeArea: React.FC<SafeAreaProps> = ({
  position = 'both',
  children,
  className = '',
}) => {
  // 判断是否需要顶部安全区域
  const needTop = position === 'top' || position === 'both';
  // 判断是否需要底部安全区域
  const needBottom = position === 'bottom' || position === 'both';

  return (
    <>
      {needTop && <div className={`safe-area-top ${className}`} />}
      {children}
      {needBottom && <div className={`safe-area-bottom ${className}`} />}
    </>
  );
};

export default SafeArea;
