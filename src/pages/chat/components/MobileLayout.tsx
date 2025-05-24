import React, { useEffect, useState, useCallback } from 'react';
import { useSidebarSwipeGestures } from '../hooks/useTouchGestures';

interface MobileLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  onSidebarOpen?: () => void;
  onSidebarClose?: () => void;
  isSidebarOpen?: boolean;
  className?: string;
}

/**
 * 移动端布局优化组件
 * 处理安全区域、触摸手势、键盘避让等移动端特性
 */
export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  sidebarContent,
  onSidebarOpen,
  onSidebarClose,
  isSidebarOpen = false,
  className = '',
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  // 侧边栏手势
  const sidebarGestures = useSidebarSwipeGestures(
    onSidebarOpen,
    onSidebarClose,
  );

  // 获取安全区域信息
  useEffect(() => {
    const updateSafeAreaInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
      });
    };

    updateSafeAreaInsets();
    window.addEventListener('resize', updateSafeAreaInsets);
    return () => window.removeEventListener('resize', updateSafeAreaInsets);
  }, []);

  // 监听键盘弹出
  useEffect(() => {
    let initialViewportHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;

      // 如果高度减少超过150px，认为是键盘弹出
      if (heightDifference > 150) {
        setKeyboardHeight(heightDifference);
      } else {
        setKeyboardHeight(0);
      }
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const heightDifference =
          window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(heightDifference > 150 ? heightDifference : 0);
      }
    };

    // 优先使用 Visual Viewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        'resize',
        handleVisualViewportChange,
      );
    } else {
      window.addEventListener('resize', handleResize);
    }

    // 监听orientationchange事件
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        initialViewportHeight = window.innerHeight;
        setKeyboardHeight(0);
      }, 100);
    });

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          'resize',
          handleVisualViewportChange,
        );
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // 阻止iOS橡皮筋效果
  useEffect(() => {
    const preventPullToRefresh = (e: TouchEvent) => {
      const target = e.target as Element;
      const scrollableParent = target.closest('[data-scrollable]');

      if (!scrollableParent) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventPullToRefresh, {
      passive: false,
    });
    return () =>
      document.removeEventListener('touchmove', preventPullToRefresh);
  }, []);

  // 处理状态栏点击滚动到顶部
  const handleStatusBarTap = useCallback(() => {
    const scrollableElement = document.querySelector('[data-scrollable]');
    if (scrollableElement) {
      scrollableElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div
      className={`mobile-layout ${className}`}
      style={{
        paddingTop: safeAreaInsets.top,
        paddingBottom: Math.max(safeAreaInsets.bottom, keyboardHeight),
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right,
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
      {...sidebarGestures}
    >
      {/* 状态栏点击区域 */}
      <div
        className="fixed top-0 left-0 right-0 h-6 z-50"
        style={{ paddingTop: safeAreaInsets.top }}
        onDoubleClick={handleStatusBarTap}
      />

      {/* 主内容区域 */}
      <div
        className="flex-1 relative"
        style={{
          height: `calc(100vh - ${
            safeAreaInsets.top + Math.max(safeAreaInsets.bottom, keyboardHeight)
          }px)`,
        }}
      >
        {children}
      </div>

      {/* 侧边栏遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onSidebarClose}
          style={{
            top: safeAreaInsets.top,
            bottom: Math.max(safeAreaInsets.bottom, keyboardHeight),
          }}
        />
      )}

      {/* 侧边栏内容 */}
      {sidebarContent && (
        <div
          className={`fixed left-0 bg-white z-50 transform transition-transform duration-300 ease-out shadow-xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            top: safeAreaInsets.top,
            bottom: Math.max(safeAreaInsets.bottom, keyboardHeight),
            width: 'min(320px, 85vw)',
          }}
        >
          {sidebarContent}
        </div>
      )}

      {/* 键盘避让指示器 */}
      {keyboardHeight > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent pointer-events-none"
          style={{
            height: 20,
            bottom: keyboardHeight,
          }}
        />
      )}

      {/* 移动端优化样式 */}
      <style>{`
        .mobile-layout {
          /* 禁用用户选择，避免长按选择文本 */
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          
          /* 禁用iOS上的点击高亮 */
          -webkit-tap-highlight-color: transparent;
          
          /* 禁用iOS上的滚动回弹 */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
        }

        /* 可选择的文本区域 */
        .mobile-layout .selectable {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }

        /* 触摸优化的按钮 */
        .mobile-layout .touch-button {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
          cursor: pointer;
        }

        /* 滚动区域 */
        .mobile-layout [data-scrollable] {
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* 隐藏滚动条但保持功能 */
        .mobile-layout .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .mobile-layout .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* 安全区域变量 */
        :root {
          --sat: env(safe-area-inset-top, 0px);
          --sab: env(safe-area-inset-bottom, 0px);
          --sal: env(safe-area-inset-left, 0px);
          --sar: env(safe-area-inset-right, 0px);
        }

        /* 防止iOS Safari地址栏导致的布局跳动 */
        @supports (-webkit-touch-callout: none) {
          .mobile-layout {
            height: -webkit-fill-available;
          }
        }

        /* 横屏优化 */
        @media screen and (orientation: landscape) and (max-height: 500px) {
          .mobile-layout .compact-mode {
            padding: 8px;
          }
          
          .mobile-layout .compact-mode .nav-bar {
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
};
