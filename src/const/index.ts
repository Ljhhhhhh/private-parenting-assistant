/**
 * 全局常量定义
 */

// 存储相关常量
export const STORAGE_KEYS = {
  // 认证相关
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',

  // 用户设置相关
  USER_SETTINGS: 'user_settings',

  // 主题相关
  THEME_MODE: 'theme_mode',
};

// API 相关常量
export const API = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010',
  TIMEOUT: 10000,
};

// 路由相关常量
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/home',
  CHAT: '/chat',
  CHILDREN: '/children',
  CHILDREN_ADD: '/children/add',
};

// Token相关常量 - 直接导出以便在多处使用
export const ACCESS_TOKEN_KEY = 'user-auth-storage.token';
export const REFRESH_TOKEN_KEY = 'user-auth-storage.refreshToken';
