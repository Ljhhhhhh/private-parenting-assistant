/**
 * 催更相关API
 */
import request from '@/utils/request';
import {
  CreateUrgeUpdateDto,
  UrgeUpdateResponseDto,
  AllUrgeStatsResponseDto,
} from '@/types/models';

/**
 * 创建催更请求
 * @param data 催更信息
 * @returns 创建的催更信息
 */
export const createUrgeUpdate = (data: CreateUrgeUpdateDto) => {
  return request.post<UrgeUpdateResponseDto>('/urge-updates', data);
};

/**
 * 获取所有类型催更统计
 * @returns 所有催更类型的全局统计信息
 */
export const getAllUrgeStats = () => {
  return request.get<AllUrgeStatsResponseDto>('/urge-updates/all-stats');
};
