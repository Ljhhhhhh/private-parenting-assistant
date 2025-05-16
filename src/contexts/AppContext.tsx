import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useUserStore } from '../store/userStore'
import { useChatStore } from '../store/chatStore'
import { deviceDetect } from '../utils'

// 应用上下文类型定义
interface AppContextType {
  theme: 'light' | 'dark'
  deviceInfo: ReturnType<typeof deviceDetect>
  isLoading: boolean
  toggleTheme: () => void
  setLoading: (status: boolean) => void
}

// 创建上下文
const AppContext = createContext<AppContextType | undefined>(undefined)

// 上下文提供组件
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isLoading, setIsLoading] = useState(false)
  const deviceInfo = deviceDetect()
  
  // 初始加载主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])
  
  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('app-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }
  
  // 全局加载状态管理
  const setLoading = (status: boolean) => {
    setIsLoading(status)
  }
  
  const value = {
    theme,
    deviceInfo,
    isLoading,
    toggleTheme,
    setLoading
  }
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// 自定义Hook，便于使用上下文
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}
