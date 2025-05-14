/**
 * 数据预处理相关API
 */
import request from '@/utils/request';

/**
 * 处理儿童信息
 * @param childId 儿童ID
 * @returns 处理结果
 */
export const processChildProfile = (childId: number) => {
  return request.post<{ success: boolean }>(`/preprocessing/child/${childId}`);
};

/**
 * 处理记录
 * @param recordId 记录ID
 * @returns 处理结果
 */
export const processRecord = (recordId: number) => {
  return request.post<{ success: boolean }>(`/preprocessing/record/${recordId}`);
};

/**
 * 批量处理记录
 * @param childId 儿童ID
 * @param limit 处理记录数量限制 (可选)
 * @param fromDate 开始日期 (ISO格式) (可选)
 * @returns 处理结果
 */
export const processRecordsBatch = (
  childId: number, 
  limit?: number, 
  fromDate?: string
) => {
  const params: Record<string, string | number | boolean | undefined> = { 
    limit, 
    fromDate 
  };
  
  return request.post<{ processed: number }>(`/preprocessing/records/batch/${childId}`, null, { params });
};

/**
 * 处理聊天历史
 * @param chatHistoryId 聊天历史ID
 * @returns 处理结果
 */
export const processChatHistory = (chatHistoryId: number) => {
  return request.post<{ success: boolean }>(`/preprocessing/chat/${chatHistoryId}`);
};

/**
 * 重建儿童向量数据
 * @param childId 儿童ID
 * @returns 重建结果
 */
export const rebuildChildVectors = (childId: number) => {
  return request.post<{
    success: boolean;
    profileProcessed: boolean;
    recordsProcessed: number;
    chatHistoriesProcessed: number;
  }>(`/preprocessing/rebuild/${childId}`);
};
