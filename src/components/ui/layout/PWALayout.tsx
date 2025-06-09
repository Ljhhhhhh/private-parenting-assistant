import React from 'react';
import { PWAStatusBar } from './PWAStatusBar';
import SafeArea from './SafeArea';
import { isPWA } from '@/utils/pwa';

interface PWALayoutProps {
  children: React.ReactNode;
  statusBarColor?: string;
  className?: string;
  enableSafeArea?: boolean;
}

/**
 * PWA布局组件
 * 提供完整的PWA布局支持，包括状态栏和安全区域
 */
export const PWALayout: React.FC<PWALayoutProps> = ({
  children,
  statusBarColor,
  className = '',
  enableSafeArea = true,
}) => {
  const isInPWA = isPWA();

  return (
    <div className={`pwa-layout ${className}`}>
      {/* PWA状态栏 */}
      {isInPWA && <PWAStatusBar backgroundColor={statusBarColor} />}

      {/* 主要内容区域 */}
      <div className="pwa-content flex-1">
        {enableSafeArea ? (
          <>
            <SafeArea position="top" />
            {children}
            <SafeArea position="bottom" />
          </>
        ) : (
          children
        )}
      </div>

      {/* PWA特殊样式 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .pwa-layout {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            min-height: -webkit-fill-available;
          }

          .pwa-content {
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          /* PWA模式下的特殊处理 */
          @media (display-mode: standalone) {
            .pwa-layout {
              height: 100vh;
              height: -webkit-fill-available;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default PWALayout;
