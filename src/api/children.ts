/**
 * 儿童相关API
 */
import request from '@/utils/request';
import {
  CreateChildDto,
  UpdateChildDto,
  ChildResponseDto,
} from '@/types/models';

/**
 * 添加新的儿童信息
 * @param data 儿童信息
 * @returns 创建的儿童信息
 */
export const createChild = (data: CreateChildDto) => {
  return request.post<ChildResponseDto>('/children', data);
};

/**
 * 获取当前用户的所有儿童列表
 * @returns 儿童列表
 */
export const getAllChildren = () => {
  return request.get<ChildResponseDto[]>('/children');
};

/**
 * 获取指定ID的儿童信息
 * @param id 儿童ID
 * @returns 儿童信息
 */
export const getChildById = (id: number) => {
  return request.get<ChildResponseDto>(`/children/${id}`);
};

/**
 * 更新指定ID的儿童信息
 * @param id 儿童ID
 * @param data 更新的儿童信息
 * @returns 更新后的儿童信息
 */
export const updateChild = (id: number, data: UpdateChildDto) => {
  return request.patch<ChildResponseDto>(`/children/${id}`, data);
};

/**
 * 删除指定ID的儿童信息
 * @param id 儿童ID
 * @returns 删除的儿童信息
 */
export const deleteChild = (id: number) => {
  return request.delete<ChildResponseDto>(`/children/${id}`);
};
