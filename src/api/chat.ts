/**
 * 聊天相关API
 */
import request from '@/utils/request';
import {
  ChatRequestDto,
  ChatResponseDto,
  ChatFeedbackDto,
  ChatStreamResponseDto,
  ChatHistoryDto,
  CreateConversationDto,
  UpdateConversationDto,
  ConversationResponseDto,
  ConversationDetailDto,
  ConversationMessageDto,
  ConversationQueryParams,
  MessageQueryParams,
  ChatHistoryQueryParams,
} from '@/types/models';

// ============ 会话管理 API ============

/**
 * 创建新会话
 * @param data 创建会话数据
 * @returns 会话信息
 */
export const createConversation = (data: CreateConversationDto) => {
  return request.post<ConversationResponseDto>('/chat/conversations', data);
};

/**
 * 获取会话列表
 * @param params 查询参数
 * @returns 会话列表
 */
export const getConversations = (params?: ConversationQueryParams) => {
  return request.get<ConversationResponseDto[]>(
    '/chat/conversations',
    params as any,
  );
};

/**
 * 获取会话详情
 * @param id 会话ID
 * @returns 会话详情（包含消息列表）
 */
export const getConversationDetail = (id: number) => {
  return request.get<ConversationDetailDto>(`/chat/conversations/${id}`);
};

/**
 * 更新会话
 * @param id 会话ID
 * @param data 更新数据
 * @returns 更新后的会话信息
 */
export const updateConversation = (id: number, data: UpdateConversationDto) => {
  return request.put<ConversationResponseDto>(
    `/chat/conversations/${id}`,
    data,
  );
};

/**
 * 删除会话
 * @param id 会话ID
 * @returns 删除结果
 */
export const deleteConversation = (id: number) => {
  return request.delete<void>(`/chat/conversations/${id}`);
};

// ============ 会话中的消息交互 API ============

/**
 * 在会话中发送消息（普通方式）
 * @param conversationId 会话ID
 * @param data 消息数据
 * @returns 聊天历史记录
 */
export const sendConversationMessage = (
  conversationId: number,
  data: ConversationMessageDto,
) => {
  return request.post<ChatHistoryDto>(
    `/chat/conversations/${conversationId}/messages`,
    data,
  );
};

/**
 * 在会话中发送消息（流式方式）
 * @param conversationId 会话ID
 * @param message 用户消息
 * @param onStream 处理流式响应的回调函数
 * @returns 流式响应
 */
export const sendConversationMessageStream = (
  conversationId: number,
  message: string,
  onStream?: (chunk: string) => void,
) => {
  const params = { message };

  if (onStream) {
    return request.stream<ChatStreamResponseDto>(
      `/chat/conversations/${conversationId}/stream`,
      params,
      onStream,
    );
  } else {
    return request.get<ChatStreamResponseDto>(
      `/chat/conversations/${conversationId}/stream`,
      params,
    );
  }
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
  return request.get<ChatHistoryDto[]>(
    `/chat/conversations/${conversationId}/messages`,
    params as any,
  );
};

// ============ 传统聊天功能 API ============

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
 * 发送聊天消息并以GET方式获取SSE流式回复
 * @param message 用户消息
 * @param childId 儿童ID（可选）
 * @returns 流式响应
 */
export const chatStream = (message: string, childId?: number) => {
  const params: Record<string, string> = { message };
  if (childId) {
    params.childId = childId.toString();
  }
  return request.get<ChatStreamResponseDto>('/chat/stream', params);
};

// ============ 聊天历史查询 API ============

/**
 * 获取用户的聊天历史
 * @param childId 儿童ID
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns 聊天历史列表
 */
export const getChatHistory = (query: ChatHistoryQueryParams) => {
  return request.get<ChatHistoryDto[]>('/chat/history', {
    ...query,
  });
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
  return request.get<ChatHistoryDto[]>(`/chat/children/${childId}`, {
    limit,
    offset,
  });
};

// ============ 其他功能 API ============

/**
 * 获取基于用户和孩子信息的问题建议
 * @param childId 儿童ID
 * @returns 问题建议列表
 */
export const getChatSuggestions = (childId: number) => {
  return request.get<string[]>('/chat/suggestions', { childId });
};

/**
 * 通过聊天ID为聊天提供反馈（有用/无用）
 * @param chatId 聊天ID
 * @param isHelpful 是否有用
 * @returns 反馈结果
 */
export const provideChatFeedbackById = (chatId: number, isHelpful: boolean) => {
  // ApiResponse
  return request.put<void>(`/chat/${chatId}/feedback`, { isHelpful });
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
  // ===== 会话管理 =====
  /** 创建新会话 */
  createConversation,
  /** 获取会话列表 */
  getConversations,
  /** 获取会话详情 */
  getConversationDetail,
  /** 更新会话 */
  updateConversation,
  /** 删除会话 */
  deleteConversation,

  // ===== 会话消息交互 =====
  /** 在会话中发送消息（同步） */
  sendConversationMessage,
  /** 在会话中发送消息（流式） */
  sendConversationMessageStream,
  /** 获取会话消息历史 */
  getConversationMessages,

  // ===== 传统聊天功能 =====
  /** 发送消息并获取回复（同步） */
  sendMessage: chatSync,
  /** 发送消息并获取流式回复 */
  sendMessageStream: chat,
  /** 流式聊天（GET方式） */
  chatStream,

  // ===== 聊天历史查询 =====
  /** 获取历史消息 */
  getHistory: getChatHistory,
  /** 获取特定儿童的聊天历史 */
  getChildHistory: getChildChats,

  // ===== 其他功能 =====
  /** 获取问题建议 */
  getSuggestions: getChatSuggestions,
  /** 提供反馈 */
  provideFeedback: provideChatFeedback,
  /** 通过ID提供反馈 */
  provideFeedbackById: provideChatFeedbackById,
};

export default chatApi;
