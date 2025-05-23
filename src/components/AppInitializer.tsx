import React, { useEffect, ReactNode } from 'react';
import { useAppStore } from '@/stores';

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * 应用初始化组件
 * 负责应用启动时的状态初始化
 */
export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { initializeApp } = useAppStore();

  useEffect(() => {
    // 初始化应用状态
    initializeApp();
  }, [initializeApp]);

  return <>{children}</>;
};
