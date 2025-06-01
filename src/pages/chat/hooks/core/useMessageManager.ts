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

import { useState, useCallback } from 'react';

// ========== 类型定义 ==========

export interface ChatMessage {
  id: string;
  chatHistoryId?: string;
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

  // 🔧 修复：将 currentStreamingId 改为状态，而不是 useRef
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(
    null,
  );

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

    console.debug('🤖 添加AI消息占位符 - 开始:', { messageId });

    setMessages((prev) => {
      const newMessages = [...prev, aiMessage];
      console.debug('🤖 AI消息占位符已添加到列表:', {
        messageId,
        totalMessages: newMessages.length,
        messageIndex: newMessages.length - 1,
      });
      options.onMessageAdded?.(aiMessage);
      return newMessages;
    });

    // 🔧 修复：设置当前流式消息ID为状态
    setCurrentStreamingId(messageId);
    console.debug('🤖 设置当前流式消息ID:', {
      messageId,
      currentStreamingId: messageId,
    });

    return messageId;
  }, [options.onMessageAdded]);

  /**
   * 更新消息
   */
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      console.debug('📝 更新消息 - 开始:', {
        messageId,
        updates,
        currentStreamingId: currentStreamingId,
      });

      setMessages((prev) => {
        // 查找要更新的消息
        const targetMessage = prev.find((msg) => msg.id === messageId);

        if (!targetMessage) {
          console.warn('⚠️ 未找到要更新的消息:', {
            messageId,
            availableIds: prev.map((m) => m.id),
          });
          return prev;
        }

        console.debug('📝 找到目标消息:', {
          messageId,
          beforeUpdate: {
            content: targetMessage.content,
            contentLength: targetMessage.content.length,
            isStreaming: targetMessage.isStreaming,
          },
          updates,
        });

        const newMessages = prev.map((msg) => {
          if (msg.id === messageId) {
            const updatedMessage = { ...msg, ...updates };

            console.debug('📝 消息更新完成:', {
              messageId,
              afterUpdate: {
                content: updatedMessage.content,
                contentLength: updatedMessage.content.length,
                isStreaming: updatedMessage.isStreaming,
              },
            });

            options.onMessageUpdated?.(updatedMessage);
            return updatedMessage;
          }
          return msg;
        });

        console.debug('📝 消息列表更新完成:', {
          totalMessages: newMessages.length,
          updatedMessageIndex: newMessages.findIndex((m) => m.id === messageId),
        });

        return newMessages;
      });
    },
    [options.onMessageUpdated, currentStreamingId],
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

      // 🔧 修复：清除当前流式消息ID状态
      if (currentStreamingId === messageId) {
        setCurrentStreamingId(null);
      }
    },
    [options.onMessageUpdated, currentStreamingId],
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

      // 🔧 修复：如果删除的是当前流式消息，清除状态
      if (currentStreamingId === messageId) {
        setCurrentStreamingId(null);
      }
    },
    [options.onMessageRemoved, currentStreamingId],
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
    setCurrentStreamingId(null); // 🔧 修复：重置状态
  }, []);

  /**
   * 清空消息列表
   */
  const clearMessages = useCallback(() => {
    console.debug('🧹 清空消息列表');

    setMessages([]);
    setCurrentStreamingId(null); // 🔧 修复：重置状态
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

  // 返回状态和操作方法
  return {
    // 状态
    messages,
    currentStreamingId, // 🔧 修复：现在这是真正的状态
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
