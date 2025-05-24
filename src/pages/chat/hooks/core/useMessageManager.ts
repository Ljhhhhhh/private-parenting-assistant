/**
 * 💬 消息管理器 Hook
 *
 * @description
 * 专注于消息列表的管理，包括用户消息、AI消息的CRUD操作
 * 不涉及流式处理逻辑，保持单一职责
 *
 * @author Chat Team
 * @since 1.0.0
 */

import { useState, useCallback, useRef } from 'react';

// ========== 类型定义 ==========

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
  isStreaming?: boolean;
  error?: string;
}

export interface MessageManagerOptions {
  onMessageAdded?: (message: ChatMessage) => void;
  onMessageUpdated?: (message: ChatMessage) => void;
  onMessageRemoved?: (messageId: string) => void;
}

export interface MessageManagerState {
  messages: ChatMessage[];
  currentStreamingId: string | null;
  totalCount: number;
}

export interface MessageManagerActions {
  addUserMessage: (content: string) => string;
  addAiMessagePlaceholder: () => string;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  completeAiMessage: (
    messageId: string,
    content: string,
    finalMessageId?: string,
  ) => void;
  removeMessage: (messageId: string) => void;
  updateMessageFeedback: (
    messageId: string,
    feedback: 'helpful' | 'not-helpful' | undefined,
  ) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  findMessage: (messageId: string) => ChatMessage | undefined;
}

export interface MessageManagerReturn
  extends MessageManagerState,
    MessageManagerActions {}

// ========== Hook实现 ==========

/**
 * 消息管理器Hook
 *
 * @param options 配置选项
 * @returns 消息管理器状态和操作方法
 */
export const useMessageManager = (
  options: MessageManagerOptions = {},
): MessageManagerReturn => {
  // 消息列表状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 当前流式消息ID
  const currentStreamingIdRef = useRef<string | null>(null);

  /**
   * 添加用户消息
   */
  const addUserMessage = useCallback(
    (content: string): string => {
      const messageId = `user-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const userMessage: ChatMessage = {
        id: messageId,
        content: content.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      console.debug('👤 添加用户消息:', {
        messageId,
        contentLength: content.length,
      });

      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        options.onMessageAdded?.(userMessage);
        return newMessages;
      });

      return messageId;
    },
    [options.onMessageAdded],
  );

  /**
   * 添加AI消息占位符
   */
  const addAiMessagePlaceholder = useCallback((): string => {
    const messageId = `ai-placeholder-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const aiMessage: ChatMessage = {
      id: messageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
    };

    console.debug('🤖 添加AI消息占位符:', { messageId });

    setMessages((prev) => {
      const newMessages = [...prev, aiMessage];
      options.onMessageAdded?.(aiMessage);
      return newMessages;
    });

    // 设置当前流式消息ID
    currentStreamingIdRef.current = messageId;

    return messageId;
  }, [options.onMessageAdded]);

  /**
   * 更新消息
   */
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      console.debug('📝 更新消息:', { messageId, updates });

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const updatedMessage = { ...msg, ...updates };
            options.onMessageUpdated?.(updatedMessage);
            return updatedMessage;
          }
          return msg;
        }),
      );
    },
    [options.onMessageUpdated],
  );

  /**
   * 完成AI消息（流式结束）
   */
  const completeAiMessage = useCallback(
    (messageId: string, content: string, finalMessageId?: string) => {
      console.debug('🏁 完成AI消息:', {
        messageId,
        finalMessageId,
        contentLength: content.length,
      });

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const updatedMessage: ChatMessage = {
              ...msg,
              id: finalMessageId || `ai-final-${Date.now()}`,
              content: content || '抱歉，我现在无法回答这个问题。',
              isStreaming: false,
            };
            options.onMessageUpdated?.(updatedMessage);
            return updatedMessage;
          }
          return msg;
        }),
      );

      // 清除当前流式消息ID
      if (currentStreamingIdRef.current === messageId) {
        currentStreamingIdRef.current = null;
      }
    },
    [options.onMessageUpdated],
  );

  /**
   * 删除消息
   */
  const removeMessage = useCallback(
    (messageId: string) => {
      console.debug('🗑️ 删除消息:', { messageId });

      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => msg.id !== messageId);
        options.onMessageRemoved?.(messageId);
        return filteredMessages;
      });

      // 如果删除的是当前流式消息，清除引用
      if (currentStreamingIdRef.current === messageId) {
        currentStreamingIdRef.current = null;
      }
    },
    [options.onMessageRemoved],
  );

  /**
   * 更新消息反馈
   */
  const updateMessageFeedback = useCallback(
    (messageId: string, feedback: 'helpful' | 'not-helpful' | undefined) => {
      console.debug('👍 更新消息反馈:', { messageId, feedback });

      updateMessage(messageId, { feedback });
    },
    [updateMessage],
  );

  /**
   * 设置消息列表
   */
  const setMessageList = useCallback((newMessages: ChatMessage[]) => {
    console.debug('📋 设置消息列表:', { count: newMessages.length });

    setMessages(newMessages);
    currentStreamingIdRef.current = null;
  }, []);

  /**
   * 清空消息列表
   */
  const clearMessages = useCallback(() => {
    console.debug('🧹 清空消息列表');

    setMessages([]);
    currentStreamingIdRef.current = null;
  }, []);

  /**
   * 查找消息
   */
  const findMessage = useCallback(
    (messageId: string): ChatMessage | undefined => {
      return messages.find((msg) => msg.id === messageId);
    },
    [messages],
  );

  // 计算派生状态
  const totalCount = messages.length;
  const currentStreamingId = currentStreamingIdRef.current;

  // 返回状态和操作方法
  return {
    // 状态
    messages,
    currentStreamingId,
    totalCount,

    // 操作方法
    addUserMessage,
    addAiMessagePlaceholder,
    updateMessage,
    completeAiMessage,
    removeMessage,
    updateMessageFeedback,
    setMessages: setMessageList,
    clearMessages,
    findMessage,
  };
};
