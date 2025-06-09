import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '@/stores/app';
import { setPageThemeColor, initPWATheme, isPWA } from '@/utils/pwa';

/**
 * PWA主题管理Hook
 * 自动根据当前页面和主题模式更新状态栏颜色
 */
export function usePWATheme() {
  const location = useLocation();
  const { theme } = useAppStore();

  useEffect(() => {
    // 初始化PWA主题设置
    initPWATheme();
  }, []);

  useEffect(() => {
    // 当路由或主题变化时更新主题颜色
    const isDark = theme === 'dark';
    setPageThemeColor(location.pathname, isDark);
  }, [location.pathname, theme]);

  return {
    isPWAMode: isPWA(),
    currentPath: location.pathname,
    currentTheme: theme,
  };
}
