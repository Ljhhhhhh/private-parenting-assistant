import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  register as registerApi,
  getUserProfile,
  sendRegisterVerificationCode,
  sendResetPasswordVerificationCode,
  resetPassword as resetPasswordApi,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
} from '@/api/auth';
import {
  RegisterDto,
  SendVerificationCodeDto,
  ResetPasswordDto,
} from '@/types/models';
import request from '@/utils/request';

interface UserState {
  // 用户数据
  user: {
    id: string;
    email: string;
  } | null;

  // 认证令牌
  token: string | null;
  refreshToken: string | null;

  // 状态标识
  isLoading: boolean;
  isAuthenticated: boolean;

  // 私有方法：仅处理用户数据
  setUser: (user: { id: string; email: string }) => void;
  setTokens: (token: string, refreshToken?: string) => void;
  clearUser: () => void;

  // 公共API方法
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; user?: any }>;
  register: (
    email: string,
    password: string,
    verificationCode: string,
  ) => Promise<{ success: boolean; user?: any }>;
  logout: () => Promise<void>;
  sendRegisterCode: (email: string) => Promise<void>;
  sendResetPasswordCode: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    newPassword: string,
    verificationCode: string,
  ) => Promise<void>;
  checkAuth: () => Promise<{ success: boolean; user?: any }>;
  refreshAccessToken: (refreshToken: string) => Promise<string | null>;

  // 初始化方法
  initializeAuth: () => Promise<{ success: boolean; user?: any }>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // 设置用户信息
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // 设置令牌
      setTokens: (token, refreshToken) => {
        set({
          token,
          refreshToken: refreshToken || get().refreshToken,
        });

        // 设置请求头
        if (token) {
          request.setAuthToken(token);
        }
      },

      // 清除用户数据
      clearUser: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        request.clearAuthToken();
      },

      // 刷新访问令牌
      refreshAccessToken: async (refreshToken) => {
        try {
          const response = await refreshTokenApi(refreshToken);
          const newToken = response.accessToken;

          get().setTokens(newToken, response.refreshToken);
          return newToken;
        } catch (error) {
          console.error('刷新token失败:', error);
          get().clearUser();
          return null;
        }
      },

      // 初始化认证状态
      initializeAuth: async () => {
        const token = get().token;

        if (!token) {
          return { success: false };
        }

        set({ isLoading: true });

        try {
          // 设置请求头
          request.setAuthToken(token);

          // 验证token有效性并获取用户信息
          const userData = await getUserProfile();

          get().setUser({
            id: userData.id,
            email: userData.email,
          });

          return {
            success: true,
            user: userData,
          };
        } catch (error) {
          console.error('初始化认证失败:', error);
          get().clearUser();
          return { success: false };
        } finally {
          set({ isLoading: false });
        }
      },

      // 检查认证状态
      checkAuth: async () => {
        const token = get().token;

        if (!token) {
          return { success: false };
        }

        set({ isLoading: true });

        try {
          const userData = await getUserProfile();
          get().setUser({
            id: userData.id,
            email: userData.email,
          });

          return {
            success: true,
            user: userData,
          };
        } catch (error) {
          console.error('检查认证状态失败:', error);
          get().clearUser();
          return { success: false };
        } finally {
          set({ isLoading: false });
        }
      },

      // 用户登录
      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const tokenResponse = await loginApi({ email, password });

          // 设置令牌
          get().setTokens(
            tokenResponse.accessToken,
            tokenResponse.refreshToken,
          );

          // 获取用户信息
          const userData = await getUserProfile();
          get().setUser({
            id: userData.id,
            email: userData.email,
          });

          return {
            success: true,
            user: userData,
          };
        } catch (error) {
          get().clearUser();
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 用户注册
      register: async (email, password, verificationCode) => {
        set({ isLoading: true });

        try {
          const registerData: RegisterDto = {
            email,
            password,
            verificationCode,
          };

          await registerApi(registerData);

          // 注册成功后自动登录
          const loginResult = await get().login(email, password);
          return loginResult;
        } catch (error) {
          get().clearUser();
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 用户登出
      logout: async () => {
        try {
          await logoutApi();
        } catch (error) {
          console.error('退出登录API失败:', error);
        } finally {
          // 无论API是否成功，都清除本地状态
          get().clearUser();
        }
      },

      // 发送注册验证码
      sendRegisterCode: async (email) => {
        const data: SendVerificationCodeDto = { email };
        return await sendRegisterVerificationCode(data);
      },

      // 发送重置密码验证码
      sendResetPasswordCode: async (email) => {
        const data: SendVerificationCodeDto = { email };
        return await sendResetPasswordVerificationCode(data);
      },

      // 重置密码
      resetPassword: async (email, newPassword, verificationCode) => {
        const data: ResetPasswordDto = {
          email,
          newPassword,
          verificationCode,
        };
        return await resetPasswordApi(data);
      },
    }),
    {
      name: 'user-auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
