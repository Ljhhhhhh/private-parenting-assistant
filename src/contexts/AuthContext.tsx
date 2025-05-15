import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  register as registerApi,
  getUserProfile,
  sendRegisterVerificationCode,
  sendResetPasswordVerificationCode,
  resetPassword as resetPasswordApi,
} from '@/api/auth';
import request from '@/utils/request';
import {
  RegisterDto,
  SendVerificationCodeDto,
  ResetPasswordDto,
} from '@/types/models';

// 临时使用，后续应该从 models.ts 中导入
interface UserPublic {
  email: string;
  id: string;
  [key: string]: any;
}

interface AuthContextType {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    verificationCode: string,
  ) => Promise<void>;
  logout: () => void;
  sendRegisterCode: (email: string) => Promise<void>;
  sendResetPasswordCode: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    newPassword: string,
    verificationCode: string,
  ) => Promise<void>;
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

  const register = async (
    email: string,
    password: string,
    verificationCode: string,
  ) => {
    setIsLoading(true);
    try {
      const registerData: RegisterDto = { email, password, verificationCode };

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

  const sendRegisterCode = async (email: string) => {
    try {
      const data: SendVerificationCodeDto = { email };
      await sendRegisterVerificationCode(data);
    } catch (error) {
      console.error('发送注册验证码失败:', error);
      throw error;
    }
  };

  const sendResetPasswordCode = async (email: string) => {
    try {
      const data: SendVerificationCodeDto = { email };
      await sendResetPasswordVerificationCode(data);
    } catch (error) {
      console.error('发送重置密码验证码失败:', error);
      throw error;
    }
  };

  const resetPassword = async (
    email: string,
    newPassword: string,
    verificationCode: string,
  ) => {
    try {
      const data: ResetPasswordDto = { email, newPassword, verificationCode };
      await resetPasswordApi(data);
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
    sendRegisterCode,
    sendResetPasswordCode,
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
