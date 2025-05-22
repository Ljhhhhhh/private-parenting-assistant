import { ReactNode, useState, useEffect } from 'react';
import { deviceDetect } from '../utils';
import { getUserProfile } from '@/api/auth';
import { getAllChildren, getChildById } from '@/api/children';
import { useChildrenStore } from '@/stores/children';
import { getTokenFromStorage } from '../utils/auth';
import { AppContext } from './AppContext';
import { AppContextType } from './useAppContext';

/**
 * 应用上下文提供者组件
 * 负责应用全局状态管理和初始化
 */
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  // 基础状态
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const deviceInfo = deviceDetect();
  
  // 获取儿童信息Store
  const { setChildren, setCurrentChild } = useChildrenStore();

  // 初始加载主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);
  
  // 初始化用户认证和儿童信息
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        // 检查是否有有效的认证令牌
        const token = getTokenFromStorage();
        if (!token) {
          setIsAuthenticated(false);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        
        // 获取用户信息
        await getUserProfile();
        setIsAuthenticated(true);
        
        // 获取用户的儿童列表
        const childrenData = await getAllChildren();
        setChildren(childrenData);
        
        // 检查是否有儿童信息
        if (childrenData.length === 0) {
          setHasChildren(false);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }
        
        setHasChildren(true);
        
        // 从localStorage获取上次选择的儿童ID
        const lastSelectedChildId = localStorage.getItem('selected-child-id');
        
        if (lastSelectedChildId) {
          // 尝试获取上次选择的儿童信息
          try {
            const childId = parseInt(lastSelectedChildId, 10);
            // 检查是否在当前儿童列表中
            const existsInList = childrenData.some(child => child.id === childId);
            
            if (existsInList) {
              const childData = await getChildById(childId);
              setCurrentChild(childData);
            } else {
              // 如果不在列表中，默认选择第一个儿童
              setCurrentChild(childrenData[0]);
              localStorage.setItem('selected-child-id', childrenData[0].id.toString());
            }
          } catch (error) {
            // 如果获取失败，默认选择第一个儿童
            console.error('获取儿童信息失败:', error);
            setCurrentChild(childrenData[0]);
            localStorage.setItem('selected-child-id', childrenData[0].id.toString());
          }
        } else {
          // 没有上次选择记录，默认选择第一个儿童
          setCurrentChild(childrenData[0]);
          localStorage.setItem('selected-child-id', childrenData[0].id.toString());
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('初始化应用失败:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, [setChildren, setCurrentChild]);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // 全局加载状态管理
  const setLoadingState = (status: boolean) => {
    setIsLoading(status);
  };
  
  // 刷新用户数据
  const refreshUserData = async () => {
    try {
      setIsLoading(true);
      // 获取用户的儿童列表
      const childrenData = await getAllChildren();
      setChildren(childrenData);
      
      // 检查是否有儿童信息
      if (childrenData.length === 0) {
        setHasChildren(false);
        setCurrentChild(null);
        return;
      }
      
      setHasChildren(true);
      
      // 从localStorage获取上次选择的儿童ID
      const lastSelectedChildId = localStorage.getItem('selected-child-id');
      
      if (lastSelectedChildId) {
        // 尝试获取上次选择的儿童信息
        try {
          const childId = parseInt(lastSelectedChildId, 10);
          // 检查是否在当前儿童列表中
          const existsInList = childrenData.some(child => child.id === childId);
          
          if (existsInList) {
            const childData = await getChildById(childId);
            setCurrentChild(childData);
          } else {
            // 如果不在列表中，默认选择第一个儿童
            setCurrentChild(childrenData[0]);
            localStorage.setItem('selected-child-id', childrenData[0].id.toString());
          }
        } catch (error) {
          // 如果获取失败，默认选择第一个儿童
          console.error('获取儿童信息失败:', error);
          setCurrentChild(childrenData[0]);
          localStorage.setItem('selected-child-id', childrenData[0].id.toString());
        }
      } else {
        // 没有上次选择记录，默认选择第一个儿童
        setCurrentChild(childrenData[0]);
        localStorage.setItem('selected-child-id', childrenData[0].id.toString());
      }
    } catch (error) {
      console.error('刷新用户数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 提供给Context的值
  const contextValue: AppContextType = {
    theme,
    deviceInfo,
    isLoading,
    isAuthenticated,
    isInitialized,
    hasChildren,
    toggleTheme,
    setLoading: setLoadingState,
    refreshUserData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
