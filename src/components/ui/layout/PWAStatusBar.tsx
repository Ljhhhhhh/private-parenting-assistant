import React from 'react';
import { isPWA } from '@/utils/pwa';

interface PWAStatusBarProps {
  backgroundColor?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * PWA状态栏组件
 * 在PWA模式下提供状态栏区域的背景色和内容
 */
export const PWAStatusBar: React.FC<PWAStatusBarProps> = ({
  backgroundColor,
  className = '',
  children,
}) => {
  // 只在PWA模式下渲染
  if (!isPWA()) {
    return null;
  }

  return (
    <div
      className={`status-bar-area ${className}`}
      style={{
        backgroundColor: backgroundColor || 'inherit',
        height: 'env(safe-area-inset-top, 0px)',
        width: '100%',
        position: 'relative',
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  );
};

export default PWAStatusBar;
