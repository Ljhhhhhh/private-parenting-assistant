/**
 * 认证相关API
 */
import request from '@/utils/request';
import { RegisterDto, LoginDto, TokenDto } from '@/types/models';

/**
 * 用户注册
 * @param data 注册信息
 * @returns 注册结果
 */
export const register = (data: RegisterDto) => {
  return request.post<any>('/auth/register', data);
};

/**
 * 用户登录
 * @param data 登录信息
 * @returns Token对象
 */
export const login = (data: LoginDto) => {
  return request.post<TokenDto>('/auth/login', data);
};

/**
 * 刷新Token
 * @returns 新的Token对象
 */
export const refreshToken = () => {
  return request.post<TokenDto>('/auth/refresh');
};

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getUserProfile = () => {
  return request.get<any>('/auth/me');
};

/**
 * 登出
 */
export const logout = () => {
  request.logout();
};

// TODO: 实现密码重置
