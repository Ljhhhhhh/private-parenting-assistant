/**
 * 聊天相关API
 */
import request from '@/utils/request';
import {
  ChatRequestDto,
  ChatResponseDto,
  ChatFeedbackDto,
  ChatStreamResponseDto,
} from '@/types/models';

/**
 * 发送聊天消息并获取非流式AI回复
 * @param data 聊天请求数据
 * @returns AI回复
 */
export const chatSync = (data: ChatRequestDto) => {
  return request.post<ChatResponseDto>('/chat/sync', data);
};

/**
 * 发送聊天消息并以SSE方式获取AI回复
 * @param data 聊天请求数据
 * @param onStream 处理流式响应的回调函数
 * @returns 完整的聊天响应
 */
export const chat = (
  data: ChatRequestDto,
  onStream?: (chunk: string) => void,
) => {
  if (onStream) {
    return request.stream<ChatStreamResponseDto>('/chat', data, onStream);
  } else {
    return request.post<ChatStreamResponseDto>('/chat', data);
  }
};

/**
 * 获取用户的聊天历史
 * @param childId 儿童ID
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns 聊天历史列表
 */
export const getChatHistory = (
  childId: number,
  limit: number = 10,
  offset: number = 0,
) => {
  return request.get<any>('/chat/history', { childId, limit, offset });
};

/**
 * 获取特定孩子的聊天历史
 * @param childId 儿童ID
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns 聊天历史列表
 */
export const getChildChats = (
  childId: number,
  limit: number = 10,
  offset: number = 0,
) => {
  return request.get<any>(`/chat/children/${childId}`, { limit, offset });
};

/**
 * 获取基于用户和孩子信息的问题建议
 * @param childId 儿童ID
 * @returns 问题建议列表
 */
export const getChatSuggestions = (childId: number) => {
  return request.get<string[]>('/chat/suggestions', { childId });
};

/**
 * 为聊天提供反馈（有用/无用）
 * @param data 反馈数据
 * @returns 反馈结果
 */
export const provideChatFeedback = (data: ChatFeedbackDto) => {
  return request.post<any>('/chat/feedback', data);
};
