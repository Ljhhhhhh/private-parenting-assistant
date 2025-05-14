/**
 * 日常记录相关API
 */
import request from '@/utils/request';
import {
  CreateRecordDto,
  UpdateRecordDto,
  RecordResponseDto,
} from '@/types/models';

/**
 * 创建日常记录
 * @param data 记录信息
 * @returns 创建的记录信息
 */
export const createRecord = (data: CreateRecordDto) => {
  return request.post<RecordResponseDto>('/records', data);
};

/**
 * 获取特定儿童的所有记录
 * @param childId 儿童ID
 * @returns 记录列表
 */
export const getRecordsByChildId = (childId: number) => {
  return request.get<RecordResponseDto[]>(`/records/child/${childId}`);
};

/**
 * 获取特定记录详情
 * @param id 记录ID
 * @returns 记录详情
 */
export const getRecordById = (id: number) => {
  return request.get<RecordResponseDto>(`/records/${id}`);
};

/**
 * 更新特定记录
 * @param id 记录ID
 * @param data 更新的记录信息
 * @returns 更新后的记录信息
 */
export const updateRecord = (id: number, data: UpdateRecordDto) => {
  return request.patch<RecordResponseDto>(`/records/${id}`, data);
};

/**
 * 删除特定记录
 * @param id 记录ID
 * @returns 删除的记录信息
 */
export const deleteRecord = (id: number) => {
  return request.delete<RecordResponseDto>(`/records/${id}`);
};
