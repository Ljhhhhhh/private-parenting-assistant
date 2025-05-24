/**
 * 🎭 聊天流程编排器 Hook
 *
 * @description
 * 组合流式处理器和消息管理器，协调完整的聊天流程
 * 处理消息发送、流式响应、错误处理等业务逻辑
 *
 * @author Chat Team
 * @since 1.0.0
 */

import { useCallback, useState } from 'react';
import { useStreamProcessor } from './useStreamProcessor';
import { useMessageManager, type ChatMessage } from './useMessageManager';

// ========== 类型定义 ==========

export interface ChatOrchestratorOptions {
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onStreamingStart?: () => void;
  onStreamingComplete?: (content: string) => void;
}

export interface ChatOrchestratorState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
  currentStreamingContent: string;
}

export interface ChatOrchestratorActions {
  sendMessage: (
    content: string,
    sendFunction: (
      content: string,
      onStream: (chunk: string) => void,
    ) => Promise<string>,
  ) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearError: () => void;
  clearMessages: () => void;
  updateMessageFeedback: (
    messageId: string,
    feedback: 'helpful' | 'not-helpful' | undefined,
  ) => void;
}

export interface ChatOrchestratorReturn
  extends ChatOrchestratorState,
    ChatOrchestratorActions {}

// ========== Hook实现 ==========

/**
 * 聊天流程编排器Hook
 *
 * @param options 配置选项
 * @returns 聊天编排器状态和操作方法
 */
export const useChatOrchestrator = (
  options: ChatOrchestratorOptions = {},
): ChatOrchestratorReturn => {
  // 内部状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [lastSendFunction, setLastSendFunction] = useState<
    | ((content: string, onStream: (chunk: string) => void) => Promise<string>)
    | null
  >(null);

  // 流式处理器
  const streamProcessor = useStreamProcessor({
    onChunk: (content) => {
      // 实时更新流式消息内容
      if (messageManager.currentStreamingId) {
        messageManager.updateMessage(messageManager.currentStreamingId, {
          content,
          isStreaming: true,
        });
      }
    },
    onComplete: (fullContent, messageId) => {
      console.debug('🎭 流式处理完成，编排后续操作');

      // 完成AI消息
      if (messageManager.currentStreamingId) {
        messageManager.completeAiMessage(
          messageManager.currentStreamingId,
          fullContent,
          messageId,
        );
      }

      setIsLoading(false);
      options.onStreamingComplete?.(fullContent);

      // 通知消息接收完成
      const completedMessage: ChatMessage = {
        id: messageId || `ai-final-${Date.now()}`,
        content: fullContent,
        isUser: false,
        timestamp: new Date(),
        isStreaming: false,
      };
      options.onMessageReceived?.(completedMessage);
    },
    onError: (err) => {
      console.error('🎭 流式处理错误:', err);

      setError(err);
      setIsLoading(false);

      // 移除失败的占位符消息
      if (messageManager.currentStreamingId) {
        messageManager.removeMessage(messageManager.currentStreamingId);
      }

      // 添加错误消息
      messageManager.addAiMessagePlaceholder();
      if (messageManager.currentStreamingId) {
        messageManager.updateMessage(messageManager.currentStreamingId, {
          content: '抱歉，发送消息失败，请稍后再试。',
          isStreaming: false,
          error: err.message,
        });
      }

      options.onError?.(err);
    },
  });

  // 消息管理器
  const messageManager = useMessageManager({
    onMessageAdded: (message) => {
      if (message.isUser) {
        options.onMessageSent?.(message);
      }
    },
    onMessageUpdated: () => {
      // 消息更新时的额外处理可以在这里添加
    },
  });

  /**
   * 发送消息的完整流程
   */
  const sendMessage = useCallback(
    async (
      content: string,
      sendFunction: (
        content: string,
        onStream: (chunk: string) => void,
      ) => Promise<string>,
    ) => {
      console.debug('🎭 开始聊天流程编排:', { contentLength: content.length });

      try {
        // 1. 清除之前的错误
        setError(null);
        setIsLoading(true);

        // 2. 保存消息和发送函数（用于重试）
        setLastUserMessage(content);
        setLastSendFunction(() => sendFunction);

        // 3. 添加用户消息
        const userMessageId = messageManager.addUserMessage(content);
        console.debug('🎭 用户消息已添加:', { userMessageId });

        // 4. 添加AI消息占位符
        const aiMessageId = messageManager.addAiMessagePlaceholder();
        console.debug('🎭 AI消息占位符已添加:', { aiMessageId });

        // 5. 开始流式处理
        streamProcessor.startProcessing();
        options.onStreamingStart?.();

        // 6. 发送消息并处理流式响应
        console.debug('🎭 开始发送消息和处理流式响应');

        await sendFunction(content, (chunk) => {
          console.debug('🎭 接收数据块并传递给流式处理器');
          streamProcessor.processChunk(chunk);
        });
      } catch (err) {
        console.error('🎭 发送消息失败:', err);

        const error = err instanceof Error ? err : new Error('发送消息失败');
        setError(error);
        setIsLoading(false);

        // 清理流式处理器
        streamProcessor.stopProcessing();

        // 移除失败的占位符并添加错误消息
        if (messageManager.currentStreamingId) {
          messageManager.updateMessage(messageManager.currentStreamingId, {
            content: '抱歉，发送消息失败，请稍后再试。',
            isStreaming: false,
            error: error.message,
          });
        }

        options.onError?.(error);
        throw error;
      }
    },
    [streamProcessor, messageManager, options],
  );

  /**
   * 重试最后一条消息
   */
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessage || !lastSendFunction) {
      console.warn('🎭 无法重试：缺少最后的消息或发送函数');
      return;
    }

    console.debug('🎭 重试最后一条消息:', { message: lastUserMessage });

    try {
      await sendMessage(lastUserMessage, lastSendFunction);
    } catch (err) {
      console.error('🎭 重试失败:', err);
      // sendMessage 已经处理了错误，这里不需要额外处理
    }
  }, [lastUserMessage, lastSendFunction, sendMessage]);

  /**
   * 清除错误状态
   */
  const clearError = useCallback(() => {
    console.debug('🎭 清除错误状态');
    setError(null);
  }, []);

  /**
   * 清空所有消息
   */
  const clearMessages = useCallback(() => {
    console.debug('🎭 清空所有消息');

    messageManager.clearMessages();
    streamProcessor.reset();
    setError(null);
    setIsLoading(false);
    setLastUserMessage('');
    setLastSendFunction(null);
  }, [messageManager, streamProcessor]);

  /**
   * 更新消息反馈
   */
  const updateMessageFeedback = useCallback(
    (messageId: string, feedback: 'helpful' | 'not-helpful' | undefined) => {
      console.debug('🎭 更新消息反馈:', { messageId, feedback });
      messageManager.updateMessageFeedback(messageId, feedback);
    },
    [messageManager],
  );

  // 计算派生状态
  const isStreaming = streamProcessor.isProcessing;
  const currentStreamingContent = streamProcessor.content;

  // 返回状态和操作方法
  return {
    // 状态
    messages: messageManager.messages,
    isLoading,
    isStreaming,
    error,
    currentStreamingContent,

    // 操作方法
    sendMessage,
    retryLastMessage,
    clearError,
    clearMessages,
    updateMessageFeedback,
  };
};
