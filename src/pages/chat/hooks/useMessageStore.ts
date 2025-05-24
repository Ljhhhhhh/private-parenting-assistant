import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MessageStore } from '../types/chat';
import {
  getConversationMessages,
  sendConversationMessage,
  sendConversationMessageStream,
  getChatHistory,
} from '@/api/chat';
import type { ChatHistoryDto, ConversationMessageDto } from '@/types/models';

export const useMessageStore = create<MessageStore>()(
  devtools(
    (set, get) => ({
      // ========== 状态 ==========
      messagesByConversation: {},
      streamingMessage: null,
      isStreaming: false,
      pendingMessages: {},

      // ========== 操作方法 ==========

      /**
       * 加载指定会话的消息历史
       */
      loadMessages: async (conversationId: number) => {
        try {
          const response = await getConversationMessages(conversationId, {
            limit: 50,
            offset: 0,
          });

          // 处理API响应格式
          let messagesData: ChatHistoryDto[] = [];
          if (Array.isArray(response)) {
            messagesData = response;
          } else if (
            response &&
            'data' in response &&
            Array.isArray((response as any).data)
          ) {
            messagesData = (response as any).data;
          } else if (
            response &&
            'messages' in response &&
            Array.isArray((response as any).messages)
          ) {
            messagesData = (response as any).messages;
          }

          // 按时间排序
          messagesData.sort(
            (a, b) =>
              new Date(a.requestTimestamp || a.createdAt).getTime() -
              new Date(b.requestTimestamp || b.createdAt).getTime(),
          );

          set((state) => ({
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: messagesData,
            },
          }));
        } catch (error) {
          console.error('加载消息失败:', error);
          // 如果加载失败，尝试使用历史API作为后备
          try {
            const fallbackResponse = await getChatHistory({
              childId: 0, // 临时值，实际应该传入正确的childId
              limit: 50,
              offset: 0,
            });

            let fallbackMessages: ChatHistoryDto[] = [];
            if (Array.isArray(fallbackResponse)) {
              fallbackMessages = fallbackResponse;
            }

            set((state) => ({
              messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: fallbackMessages,
              },
            }));
          } catch (fallbackError) {
            console.error('加载历史消息也失败:', fallbackError);
          }
        }
      },

      /**
       * 添加待发送消息
       */
      addPendingMessage: (tempId: string, content: string) => {
        set((state) => ({
          pendingMessages: {
            ...state.pendingMessages,
            [tempId]: content,
          },
        }));
      },

      /**
       * 更新流式消息内容
       */
      updateStreamingMessage: (content: string) => {
        set({ streamingMessage: content, isStreaming: true });
      },

      /**
       * 完成消息发送，更新到最终状态
       */
      finishMessage: (tempId: string, finalMessage: ChatHistoryDto) => {
        const { pendingMessages, messagesByConversation } = get();
        // 移除已处理的临时消息
        const remainingPending = { ...pendingMessages };
        delete remainingPending[tempId];

        // 确定会话ID
        const conversationId = finalMessage.conversationId;
        if (!conversationId) {
          console.warn('消息没有会话ID，无法更新本地状态');
          return;
        }

        // 更新消息列表
        const currentMessages = messagesByConversation[conversationId] || [];
        const updatedMessages = [...currentMessages, finalMessage];

        set({
          pendingMessages: remainingPending,
          streamingMessage: null,
          isStreaming: false,
          messagesByConversation: {
            ...messagesByConversation,
            [conversationId]: updatedMessages,
          },
        });
      },

      /**
       * 清除流式响应状态
       */
      clearStreaming: () => {
        set({
          streamingMessage: null,
          isStreaming: false,
        });
      },
    }),
    {
      name: 'message-store',
      version: 1,
    },
  ),
);

// ========== 选择器 Hooks ==========

/**
 * 获取指定会话的消息列表
 */
export const useConversationMessages = (conversationId?: number) => {
  return useMessageStore((state) => {
    if (!conversationId) return [];
    return state.messagesByConversation[conversationId] || [];
  });
};

/**
 * 获取流式消息状态
 */
export const useStreamingState = () => {
  return useMessageStore((state) => ({
    streamingMessage: state.streamingMessage,
    isStreaming: state.isStreaming,
  }));
};

/**
 * 获取待发送消息列表
 */
export const usePendingMessages = () => {
  return useMessageStore((state) => state.pendingMessages);
};

/**
 * 检查指定会话是否有消息
 */
export const useHasMessages = (conversationId?: number) => {
  return useMessageStore((state) => {
    if (!conversationId) return false;
    const messages = state.messagesByConversation[conversationId];
    return messages && messages.length > 0;
  });
};

// ========== 工具函数 ==========

/**
 * 发送会话消息的工具函数
 */
export const sendMessageToConversation = async (
  conversationId: number,
  message: string,
  onStream?: (chunk: string) => void,
): Promise<ChatHistoryDto | null> => {
  try {
    if (onStream) {
      // 使用流式API
      const response = await sendConversationMessageStream(
        conversationId,
        message,
        onStream,
      );

      // 处理流式响应的最终结果
      if (response && 'chatId' in response) {
        return response as unknown as ChatHistoryDto;
      }
      return null;
    } else {
      // 使用普通API
      const messageData: ConversationMessageDto = { message };
      const response = await sendConversationMessage(
        conversationId,
        messageData,
      );
      return response;
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    throw error;
  }
};

/**
 * 估算消息高度（用于虚拟滚动）
 */
export const estimateMessageHeight = (message: ChatHistoryDto): number => {
  const baseHeight = 60; // 基础高度
  const contentLength = (message.userMessage || message.aiResponse || '')
    .length;
  const lineHeight = 24; // 每行高度
  const charsPerLine = 40; // 每行字符数（估算）

  const estimatedLines = Math.ceil(contentLength / charsPerLine);
  const contentHeight = estimatedLines * lineHeight;

  return baseHeight + contentHeight;
};

/**
 * 将API消息转换为UI消息格式
 */
export const convertApiMessageToUI = (apiMessage: ChatHistoryDto) => {
  return {
    id: `chat-${apiMessage.id}`,
    content: apiMessage.userMessage || apiMessage.aiResponse || '',
    isUser: Boolean(apiMessage.userMessage),
    timestamp: new Date(
      apiMessage.requestTimestamp ||
        apiMessage.responseTimestamp ||
        apiMessage.createdAt,
    ),
    chatHistoryId: apiMessage.id,
    conversationId: apiMessage.conversationId,
    feedback:
      apiMessage.isHelpful !== undefined
        ? apiMessage.isHelpful
          ? ('helpful' as const)
          : ('not-helpful' as const)
        : undefined,
  };
};

/**
 * 格式化消息时间
 */
export const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}小时前`;

  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
