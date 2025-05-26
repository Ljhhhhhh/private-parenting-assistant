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

import { useCallback, useState, useRef, useEffect } from 'react';
import { useStreamProcessor } from './useStreamProcessor';
import { useMessageManager, type ChatMessage } from './useMessageManager';
import { useConversationStore } from '../useConversationStore';
import { generateConversationTitle } from '../useConversationStore';
import { getConversationMessages } from '@/api/chat';

// ========== 类型定义 ==========

export interface ChatOrchestratorOptions {
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onStreamingStart?: () => void;
  onStreamingComplete?: (content: string) => void;
  onConversationCreated?: (conversationId: number) => void;
  childId?: number | null; // 添加 childId 参数
  conversationId?: number | null; // 添加当前会话ID
}

export interface ChatOrchestratorState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
  currentStreamingContent: string;
  currentConversationId: number | null; // 🆕 添加当前会话ID
}

export interface ChatOrchestratorActions {
  sendMessage: (
    content: string,
    sendFunction: (
      content: string,
      onStream: (chunk: string) => void,
      conversationId?: number | null,
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

  // 🔧 会话管理
  const conversationStore = useConversationStore();
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // 直接使用 options.conversationId，不需要额外的状态
  const currentConversationId = options.conversationId || null;

  // 🔧 修复：先初始化消息管理器
  const messageManager = useMessageManager({
    onMessageAdded: (message) => {
      if (message.isUser) {
        options.onMessageSent?.(message);
      }
    },
  });

  // 🔧 修复：使用 useRef 存储最新的 messageManager 引用，避免闭包陷阱
  const messageManagerRef = useRef(messageManager);
  messageManagerRef.current = messageManager;

  // 🆕 监听 conversationId 变化，加载历史消息
  useEffect(() => {
    const loadConversationHistory = async (conversationId: number) => {
      console.debug('🔄 开始加载会话历史:', { conversationId });
      setIsLoadingHistory(true);

      try {
        // 调用API获取会话消息历史
        const response = await getConversationMessages(conversationId, {
          limit: 50,
          offset: 0,
        });

        // 处理API响应格式
        let messagesData: any[] = [];
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

        console.debug('📚 获取到历史消息:', { count: messagesData.length });

        if (messagesData.length > 0) {
          // 转换为UI消息格式 - 每个ChatHistoryDto转换为两个ChatMessage
          const historyMessages: ChatMessage[] = [];

          messagesData.forEach((item: any) => {
            // 添加用户消息
            if (item.userMessage) {
              historyMessages.push({
                id: `user-${item.id}`,
                content: item.userMessage,
                isUser: true,
                timestamp: new Date(item.requestTimestamp || item.createdAt),
                isStreaming: false,
              });
            }

            // 添加AI回复
            if (item.aiResponse) {
              historyMessages.push({
                id: `ai-${item.id}`,
                content: item.aiResponse,
                isUser: false,
                timestamp: new Date(item.responseTimestamp || item.createdAt),
                feedback:
                  item.isHelpful !== undefined
                    ? item.isHelpful
                      ? 'helpful'
                      : 'not-helpful'
                    : undefined,
                isStreaming: false,
              });
            }
          });

          // 按时间排序
          historyMessages.sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
          );

          // 清空当前消息并设置历史消息
          const currentManager = messageManagerRef.current;
          currentManager.clearMessages();

          // 使用 setMessages 直接设置历史消息
          currentManager.setMessages(historyMessages);

          console.debug('✅ 历史消息加载完成:', {
            totalMessages: historyMessages.length,
            userMessages: historyMessages.filter((m) => m.isUser).length,
            aiMessages: historyMessages.filter((m) => !m.isUser).length,
          });
        } else {
          // 如果没有历史消息，清空当前消息
          const currentManager = messageManagerRef.current;
          currentManager.clearMessages();
          console.debug('📭 该会话暂无历史消息');
        }
      } catch (error) {
        console.error('❌ 加载会话历史失败:', error);
        // 加载失败时也要清空当前消息，避免显示其他会话的消息
        const currentManager = messageManagerRef.current;
        currentManager.clearMessages();
      } finally {
        setIsLoadingHistory(false);
      }
    };

    console.debug('🔄 开始加载会话历史:', {
      conversationId: options.conversationId,
      currentConversationId,
    });

    // 当 conversationId 变化时
    if (
      options.conversationId !== null &&
      options.conversationId !== undefined
    ) {
      console.debug('🔄 会话ID变化，准备加载历史:', {
        conversationId: options.conversationId,
      });
      loadConversationHistory(options.conversationId);
    } else {
      // 如果 conversationId 为 null（新会话），清空消息
      console.debug('🆕 切换到新会话，清空消息');
      const currentManager = messageManagerRef.current;
      currentManager.clearMessages();
    }
  }, [options.conversationId]); // 依赖 conversationId 变化

  // 🔧 修复：使用 useRef 确保回调函数能访问到最新的 messageManager
  const streamProcessor = useStreamProcessor({
    onChunk: (content) => {
      const currentManager = messageManagerRef.current;
      console.debug('🎭 编排器接收到流式内容:', {
        contentLength: content.length,
        contentPreview:
          content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        currentStreamingId: currentManager.currentStreamingId,
      });

      // 🔧 修复：通过 ref 访问最新的 currentStreamingId
      const latestStreamingId = currentManager.currentStreamingId;

      if (latestStreamingId) {
        console.debug('🎭 准备更新消息:', {
          messageId: latestStreamingId,
          newContent: content,
          newContentLength: content.length,
        });

        currentManager.updateMessage(latestStreamingId, {
          content,
          isStreaming: true,
        });

        console.debug('🎭 消息更新调用完成');
      } else {
        console.warn('🎭 ⚠️ 没有当前流式消息ID，无法更新消息');
      }
    },
    onComplete: (fullContent, messageId) => {
      const currentManager = messageManagerRef.current;
      console.debug('🎭 流式处理完成，编排后续操作');

      // 🔧 修复：通过 ref 访问最新的 currentStreamingId
      const latestStreamingId = currentManager.currentStreamingId;
      if (latestStreamingId) {
        currentManager.completeAiMessage(
          latestStreamingId,
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
      const currentManager = messageManagerRef.current;
      console.error('🎭 流式处理错误:', err);

      setError(err);
      setIsLoading(false);

      // 🔧 修复：通过 ref 访问最新的 currentStreamingId
      const latestStreamingId = currentManager.currentStreamingId;
      if (latestStreamingId) {
        currentManager.removeMessage(latestStreamingId);
      }

      // 添加错误消息
      currentManager.addAiMessagePlaceholder();
      const newStreamingId = currentManager.currentStreamingId;
      if (newStreamingId) {
        currentManager.updateMessage(newStreamingId, {
          content: '抱歉，发送消息失败，请稍后再试。',
          isStreaming: false,
          error: err.message,
        });
      }

      options.onError?.(err);
    },
  });

  /**
   * 🆕 创建新会话
   */
  const createConversationIfNeeded = useCallback(
    async (firstMessage: string): Promise<number | null> => {
      // 如果已经有会话ID，直接返回
      if (currentConversationId) {
        console.debug('🗂️ 使用现有会话:', {
          conversationId: currentConversationId,
        });
        return currentConversationId;
      }

      // 如果没有childId，无法创建会话
      if (!options.childId) {
        console.warn('⚠️ 没有childId，无法创建会话');
        return null;
      }

      try {
        console.debug('🆕 创建新会话:', {
          childId: options.childId,
          firstMessage: firstMessage.substring(0, 50),
        });

        // 生成会话标题
        const title = generateConversationTitle(firstMessage);

        // 创建会话
        const newConversation = await conversationStore.createConversation(
          options.childId,
          title,
          firstMessage,
        );

        const newConversationId = newConversation.id;

        console.debug('✅ 会话创建成功:', {
          conversationId: newConversationId,
          title,
        });

        // 通知会话创建完成
        options.onConversationCreated?.(newConversationId);

        return newConversationId;
      } catch (error) {
        console.error('❌ 创建会话失败:', error);
        // 会话创建失败不应该阻止消息发送，返回null继续发送
        return null;
      }
    },
    [
      currentConversationId,
      options.childId,
      options.onConversationCreated,
      conversationStore,
    ],
  );

  /**
   * 发送消息的完整流程
   */
  const sendMessage = useCallback(
    async (
      content: string,
      sendFunction: (
        content: string,
        onStream: (chunk: string) => void,
        conversationId?: number | null,
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

        // 3. 🆕 检查是否需要创建会话（第一条消息时）
        let effectiveConversationId = currentConversationId;
        const isFirstMessage = messageManager.messages.length === 0;

        if (isFirstMessage) {
          console.debug('🆕 检测到第一条消息，尝试创建会话');
          const newConversationId = await createConversationIfNeeded(content);

          if (newConversationId) {
            effectiveConversationId = newConversationId;
            console.debug('🗂️ 会话创建完成，使用新会话ID:', {
              conversationId: newConversationId,
            });
          } else {
            console.debug('🗂️ 会话创建失败或跳过，使用当前会话ID:', {
              conversationId: effectiveConversationId,
            });
          }
        }

        console.debug('🎭 准备发送消息，使用会话ID:', {
          effectiveConversationId,
          isFirstMessage,
          currentConversationId,
        });

        // 4. 添加用户消息
        const userMessageId = messageManager.addUserMessage(content);
        console.debug('🎭 用户消息已添加:', { userMessageId });

        // 5. 添加AI消息占位符
        const aiMessageId = messageManager.addAiMessagePlaceholder();
        console.debug('🎭 AI消息占位符已添加:', { aiMessageId });

        // 6. 开始流式处理
        streamProcessor.startProcessing();
        options.onStreamingStart?.();

        // 7. 🔧 发送消息并处理流式响应 - 传递正确的会话ID
        console.debug(
          '🎭 开始发送消息和处理流式响应，会话ID:',
          effectiveConversationId,
        );

        await sendFunction(
          content,
          (chunk) => {
            console.debug('🎭 接收数据块并传递给流式处理器');
            streamProcessor.processChunk(chunk);
          },
          effectiveConversationId,
        );
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
    [
      streamProcessor,
      messageManager,
      options,
      createConversationIfNeeded,
      currentConversationId,
    ],
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
    isLoading: isLoading || isLoadingHistory, // 包含历史加载状态
    isStreaming,
    error,
    currentStreamingContent,
    currentConversationId,

    // 操作方法
    sendMessage,
    retryLastMessage,
    clearError,
    clearMessages,
    updateMessageFeedback,
  };
};
