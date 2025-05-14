import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { register as registerApi, getUserProfile } from '@/api/auth';
import { UserPublic } from '@/types/api';
import request from '@/utils/request';
import { RegisterDto } from '@/types/models';

interface AuthContextType {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      try {
        // request.ts 会自动从 localStorage 加载 token
        const userData = await getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('认证失败:', error);
        // 认证失败时，request.ts 的拦截器会自动清除 token 并重定向
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 使用 request.ts 中封装的 login 方法，会自动保存 token
      await request.login(email, password);

      // 获取用户数据
      const userData = await getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const registerData: RegisterDto = { email, password };

      // 注册用户
      await registerApi(registerData);

      // 注册成功后自动登录
      await login(email, password);
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // 使用 request.ts 中封装的 logout 方法，会自动清除 token
    request.logout();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      // 发送找回密码请求
      await request.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('密码找回失败:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      // 重置密码
      await request.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      console.error('密码重置失败:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
