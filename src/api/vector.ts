/**
 * 向量数据库相关API
 */
import request from '@/utils/request';
import { 
  CreateTextChunkDto, 
  CreateTextChunksDto, 
  SearchTextChunkDto, 
  TextChunkResponseDto,
  UpdateTextChunkDto
} from '@/types/models';

/**
 * 添加文本块
 * @param data 文本块数据
 * @returns 创建结果
 */
export const addTextChunk = (data: CreateTextChunkDto) => {
  return request.post<number>('/vector/text-chunk', data);
};

/**
 * 批量添加文本块
 * @param data 批量文本块数据
 * @returns 创建结果
 */
export const addTextChunks = (data: CreateTextChunksDto) => {
  return request.post<number>('/vector/text-chunks', data);
};

/**
 * 搜索相似文本块
 * @param data 搜索参数
 * @returns 相似文本块列表
 */
export const searchSimilarTextChunks = (data: SearchTextChunkDto) => {
  return request.post<TextChunkResponseDto[]>('/vector/search', data);
};

/**
 * 获取文本块
 * @param id 文本块ID
 * @returns 文本块信息
 */
export const getTextChunkById = (id: number) => {
  return request.get<TextChunkResponseDto>(`/vector/text-chunk/${id}`);
};

/**
 * 更新文本块
 * @param id 文本块ID
 * @param data 更新数据
 * @returns 更新结果
 */
export const updateTextChunk = (id: number, data: UpdateTextChunkDto) => {
  return request.put<boolean>(`/vector/text-chunk/${id}`, data);
};

/**
 * 删除文本块
 * @param id 文本块ID
 * @returns 删除结果
 */
export const deleteTextChunk = (id: number) => {
  return request.delete<boolean>(`/vector/text-chunk/${id}`);
};

/**
 * 获取来源文本块
 * @param type 来源类型
 * @param id 来源ID
 * @returns 文本块列表
 */
export const getTextChunksBySource = (type: string, id: number) => {
  return request.get<TextChunkResponseDto[]>(`/vector/source/${type}/${id}`);
};

/**
 * 删除来源文本块
 * @param type 来源类型
 * @param id 来源ID
 * @returns 删除结果
 */
export const deleteTextChunksBySource = (type: string, id: number) => {
  return request.delete<number>(`/vector/source/${type}/${id}`);
};

/**
 * 获取儿童文本块
 * @param childId 儿童ID
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns 文本块列表
 */
export const getTextChunksByChildId = (childId: number, limit: number = 10, offset: number = 0) => {
  return request.get<TextChunkResponseDto[]>(`/vector/child/${childId}`, { limit, offset });
};

/**
 * 删除儿童文本块
 * @param childId 儿童ID
 * @returns 删除结果
 */
export const deleteTextChunksByChildId = (childId: number) => {
  return request.delete<number>(`/vector/child/${childId}`);
};

/**
 * 获取文本块总数
 * @param childId 儿童ID
 * @returns 文本块总数
 */
export const getTextChunksCount = (childId: number) => {
  return request.get<number>('/vector/count', { childId });
};
