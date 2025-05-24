import { useMemo, useCallback } from 'react';
import { ChatRuntimeConfig } from '../types/chat';
import {
  chat,
  sendConversationMessageStream,
  getConversationMessages,
} from '@/api/chat';
import type { ChatHistoryDto } from '@/types/models';

// 设计规范色彩常量
export const DESIGN_COLORS = {
  primary: '#FFB38A', // 温暖蜜桃
  primaryDark: '#FF9F73', // 深色变体
  primaryLight: '#FFC9A8', // 浅色变体
  background: '#FDFBF8', // 页面背景
  border: '#E0E0E0', // 边框色
  textPrimary: '#333333', // 主要文字
  textSecondary: '#666666', // 次要文字
  textTertiary: '#999999', // 辅助文字
  success: '#66BB6A', // 成功色
  error: '#EF5350', // 错误色
  warning: '#FFDA63', // 警告色
};

// 聊天运行时接口
export interface ChatRuntime {
  sendMessage: (
    prompt: string,
    onStream?: (chunk: string) => void,
  ) => Promise<string>;
  loadMessages: () => Promise<ChatHistoryDto[]>;
  isReady: boolean;
  conversationId: number | null;
  childId: number;
}

/**
 * 创建聊天运行时配置
 */
export const useChatRuntime = ({
  conversationId,
  childId,
}: ChatRuntimeConfig): ChatRuntime | null => {
  const runtime = useMemo(() => {
    if (!childId) return null;

    return {
      conversationId,
      childId,
      isReady: true,

      /**
       * 发送消息
       */
      sendMessage: async (
        prompt: string,
        onStream?: (chunk: string) => void,
      ): Promise<string> => {
        try {
          if (conversationId) {
            // 会话模式：使用会话API
            const response = await sendConversationMessageStream(
              conversationId,
              prompt,
              (chunk) => {
                // 直接传递原始数据块给上层处理器
                // 不在这里进行任何解析，避免重复处理
                if (onStream) {
                  onStream(chunk);
                }
              },
            );

            return response?.content || '抱歉，我暂时无法回答这个问题。';
          } else {
            // 单次模式：使用传统聊天API
            const response = await chat(
              { message: prompt, childId },
              (chunk) => {
                // 直接传递原始数据块给上层处理器
                // 不在这里进行任何解析，避免重复处理
                if (onStream) {
                  onStream(chunk);
                }
              },
            );

            return response?.content || '抱歉，我暂时无法回答这个问题。';
          }
        } catch (error) {
          console.error('发送消息失败:', error);
          throw new Error('发送消息失败，请稍后重试');
        }
      },

      /**
       * 加载消息历史
       */
      loadMessages: async (): Promise<ChatHistoryDto[]> => {
        if (!conversationId) return [];

        try {
          const response = await getConversationMessages(conversationId, {
            limit: 50,
            offset: 0,
          });

          // 处理响应格式
          let messagesData: ChatHistoryDto[] = [];
          if (Array.isArray(response)) {
            messagesData = response;
          } else if (
            response &&
            'data' in response &&
            Array.isArray((response as any).data)
          ) {
            messagesData = (response as any).data;
          }

          // 按时间排序
          messagesData.sort(
            (a, b) =>
              new Date(a.requestTimestamp || a.createdAt).getTime() -
              new Date(b.requestTimestamp || b.createdAt).getTime(),
          );

          return messagesData;
        } catch (error) {
          console.error('加载消息历史失败:', error);
          return [];
        }
      },
    };
  }, [conversationId, childId]);

  return runtime;
};

/**
 * 获取流式响应处理器
 */
export const useStreamHandler = () => {
  const handleChunk = useCallback((chunk: string) => {
    // 处理流式数据块
    console.debug('接收到流式数据块:', chunk);
  }, []);

  const handleComplete = useCallback((fullResponse: string) => {
    console.debug('流式响应完成:', fullResponse.length, '字符');
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('流式响应错误:', error);
  }, []);

  return {
    handleChunk,
    handleComplete,
    handleError,
  };
};

/**
 * 检查运行时是否准备就绪
 */
export const useRuntimeReady = (runtime: ChatRuntime | null): boolean => {
  return useMemo(() => {
    return runtime?.isReady ?? false;
  }, [runtime]);
};

/**
 * 运行时状态监控Hook
 */
export const useRuntimeStats = (runtime: ChatRuntime | null) => {
  return useMemo(() => {
    if (!runtime) {
      return {
        isReady: false,
        hasMessages: false,
        messageCount: 0,
        conversationId: null,
        childId: 0,
      };
    }

    return {
      isReady: runtime.isReady,
      hasMessages: false, // 需要通过loadMessages获取
      messageCount: 0, // 需要通过loadMessages获取
      conversationId: runtime.conversationId,
      childId: runtime.childId,
    };
  }, [runtime]);
};

/**
 * 消息发送Hook
 */
export const useSendMessage = (runtime: ChatRuntime | null) => {
  return useCallback(
    async (
      message: string,
      onStream?: (chunk: string) => void,
    ): Promise<string> => {
      if (!runtime) {
        throw new Error('聊天运行时未准备就绪');
      }

      return runtime.sendMessage(message, onStream);
    },
    [runtime],
  );
};

/**
 * 消息加载Hook
 */
export const useLoadMessages = (runtime: ChatRuntime | null) => {
  return useCallback(async (): Promise<ChatHistoryDto[]> => {
    if (!runtime) {
      return [];
    }

    return runtime.loadMessages();
  }, [runtime]);
};
