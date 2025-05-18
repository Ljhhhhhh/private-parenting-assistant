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
import { getAllChildren } from '@/api/children';
import { useChildrenStore } from './children';
import {
  RegisterDto,
  SendVerificationCodeDto,
  ResetPasswordDto,
} from '@/types/models';
import request from '@/utils/request';

interface UserState {
  user: {
    id: string;
    email: string;
  } | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: { id: string; email: string }, token: string) => void;
  clearUser: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    verificationCode: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  sendRegisterCode: (email: string) => Promise<void>;
  sendResetPasswordCode: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    newPassword: string,
    verificationCode: string,
  ) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAccessToken: (refreshToken: string) => Promise<string | null>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      setUser: (user, token) => {
        set({ user, token, isAuthenticated: !!user });
        // 如果有token，设置到请求头
        if (token) {
          request.setAuthToken(token);
        }
      },
      clearUser: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        // 清除认证token
        request.clearAuthToken();
      },

      refreshAccessToken: async (refreshToken) => {
        try {
          const response = await refreshTokenApi(refreshToken);
          const newToken = response.accessToken;

          // 更新store中的token
          set({
            token: newToken,
            refreshToken: response.refreshToken || get().refreshToken,
          });

          // 更新请求头
          request.setAuthToken(newToken);

          return newToken;
        } catch (error) {
          console.error('刷新token失败:', error);
          return null;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        const setChildren = useChildrenStore.getState().setChildren;
        const clearChildren = useChildrenStore.getState().clearChildren;
        try {
          const userData = await getUserProfile();
          // 获取当前存储的token
          const token = get().token;

          if (token) {
            get().setUser({ id: userData.id, email: userData.email }, token);
            const children = await getAllChildren();
            setChildren(children);
          } else {
            throw new Error('未找到有效的令牌');
          }
        } catch (error) {
          console.error('检查用户是否已登录失败:', error);
          get().clearUser();
          clearChildren();
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        const setChildren = useChildrenStore.getState().setChildren;
        const clearChildren = useChildrenStore.getState().clearChildren;
        const setCurrentChild = useChildrenStore.getState().setCurrentChild;
        try {
          const tokenResponse = await loginApi({ email, password });

          // 直接设置token到状态，persist中间件会自动持久化
          set({
            token: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken || null,
          });

          get().setUser({ id: '', email }, tokenResponse.accessToken);
          const userData = await getUserProfile();
          get().setUser(
            { id: userData.id, email: userData.email },
            tokenResponse.accessToken,
          );
          const children = await getAllChildren();
          setChildren(children);

          // 如果有儿童信息但没有选中当前儿童，自动选择第一个
          if (
            children &&
            children.length > 0 &&
            !useChildrenStore.getState().currentChild
          ) {
            setCurrentChild(children[0]);
          }
        } catch (error) {
          get().clearUser();
          clearChildren();
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, verificationCode) => {
        set({ isLoading: true });
        const clearChildren = useChildrenStore.getState().clearChildren;
        try {
          const registerData: RegisterDto = {
            email,
            password,
            verificationCode,
          };
          await registerApi(registerData);
          await get().login(email, password);
        } catch (error) {
          get().clearUser();
          clearChildren();
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const clearChildren = useChildrenStore.getState().clearChildren;
        try {
          await logoutApi();
        } catch (error) {
          console.error('退出登录失败:', error);
        } finally {
          // 无论退出登录API是否成功，都清除本地状态
          get().clearUser();
          clearChildren();
        }
      },

      sendRegisterCode: async (email) => {
        const data: SendVerificationCodeDto = { email };
        return await sendRegisterVerificationCode(data);
      },

      sendResetPasswordCode: async (email) => {
        const data: SendVerificationCodeDto = { email };
        return await sendResetPasswordVerificationCode(data);
      },

      resetPassword: async (email, newPassword, verificationCode) => {
        const data: ResetPasswordDto = { email, newPassword, verificationCode };
        return await resetPasswordApi(data);
      },
    }),
    {
      name: 'user-auth-storage', // 存储在localStorage中的键名
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }), // 只持久化token相关信息
    },
  ),
);
