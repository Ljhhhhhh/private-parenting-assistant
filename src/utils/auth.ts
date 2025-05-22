/**
 * 认证相关工具函数
 */

// 令牌存储键名
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * 保存访问令牌到本地存储
 * @param token 访问令牌
 */
export const saveTokenToStorage = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * 从本地存储获取访问令牌
 * @returns 访问令牌或null
 */
export const getTokenFromStorage = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * 从本地存储获取刷新令牌
 * @returns 刷新令牌或null
 */
export const getRefreshTokenFromStorage = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * 清除本地存储中的所有令牌
 */
export const clearTokenFromStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export const isUserLoggedIn = (): boolean => {
  return !!getTokenFromStorage();
};
