import { createContext } from 'react';
import { AppContextType } from './useAppContext';

// 创建上下文
export const AppContext = createContext<AppContextType | undefined>(undefined);

// 上下文提供组件已移至AppContextProvider.tsx文件


