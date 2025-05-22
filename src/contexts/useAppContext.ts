import { useContext } from 'react';
import { AppContext } from './AppContext';

// 应用上下文类型定义
export interface AppContextType {
  theme: 'light' | 'dark';
  deviceInfo: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasChildren: boolean;
  toggleTheme: () => void;
  setLoading: (status: boolean) => void;
  refreshUserData: () => Promise<void>;
}

// 自定义Hook，便于使用上下文
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
