import request from '@/utils/request';
import {
  CreateConversationDto,
  ConversationResponseDto,
  ConversationQueryParams,
  ChatHistoryDto,
  MessageQueryParams,
} from '@/types/models';

/**
 * 创建新会话
 * @param data 创建会话数据
 * @returns 会话信息
 */
export const createConversation = (data: CreateConversationDto) => {
  return request.post<ConversationResponseDto>('/conversation', data);
};

/**
 * 获取会话中的消息历史
 * @param conversationId 会话ID
 * @param params 查询参数
 * @returns 消息历史列表
 */
export const getConversationMessages = (
  conversationId: number,
  params?: MessageQueryParams,
) => {
  return request.get<ChatHistoryDto>(`/conversation/${conversationId}`, {
    ...params,
  });
};

/**
 * 获取会话列表
 * @param params 查询参数
 * @returns 会话列表
 */
export const getConversations = (params?: ConversationQueryParams) => {
  return request.get<ConversationResponseDto[]>('/conversation', params as any);
};

/**
 * 删除会话
 * @param id 会话ID
 * @returns 删除结果
 */
export const deleteConversation = (id: number) => {
  return request.delete<void>(`/conversation/${id}`);
};
