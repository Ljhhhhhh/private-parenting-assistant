/**
 * 认证相关API
 */
import request from '@/utils/request';
import { RegisterDto, LoginDto, TokenDto, SendVerificationCodeDto, ResetPasswordDto } from '@/types/models';

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

/**
 * 发送注册验证码
 * @param data 包含邮箱地址的对象
 * @returns 发送结果
 */
export const sendRegisterVerificationCode = (data: SendVerificationCodeDto) => {
  return request.post<any>('/auth/send-verification-code/register', data);
};

/**
 * 发送重置密码验证码
 * @param data 包含邮箱地址的对象
 * @returns 发送结果
 */
export const sendResetPasswordVerificationCode = (data: SendVerificationCodeDto) => {
  return request.post<any>('/auth/send-verification-code/reset-password', data);
};

/**
 * 重置密码
 * @param data 重置密码所需信息
 * @returns 重置结果
 */
export const resetPassword = (data: ResetPasswordDto) => {
  return request.post<any>('/auth/reset-password', data);
};
