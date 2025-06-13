/**
 * 聊天相关API
 */
import request from '@/utils/request';
import {
  ChatRequestDto,
  ChatFeedbackDto,
  ChatStreamResponseDto,
} from '@/types/models';

// ============ 会话管理 API ============

// ============ 传统聊天功能 API ============

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
  return request.post<void>('/chat/feedback', data);
};

// ============ 聊天API集合对象 ============

// 聊天API集合对象，提供统一的接口调用方式
export const chatApi = {
  /** 发送消息并获取流式回复 */
  sendMessageStream: chat,

  /** 获取问题建议 */
  getSuggestions: getChatSuggestions,
  /** 提供反馈 */
  provideFeedback: provideChatFeedback,
};

export default chatApi;
