import { useState, useCallback, useRef } from 'react';
import { createStreamProcessor } from '@/utils/streamParser';
import type { ChatMessage } from '../types/chat';

interface UseStreamingMessageOptions {
  onComplete?: (fullContent: string, messageId?: string) => void;
  onError?: (error: Error) => void;
  onContentUpdate?: (content: string) => void;
}

/**
 * 流式消息处理Hook
 * 管理流式响应的状态和内容累积
 */
export const useStreamingMessage = (
  options: UseStreamingMessageOptions = {},
) => {
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const streamProcessorRef = useRef<ReturnType<
    typeof createStreamProcessor
  > | null>(null);

  /**
   * 开始流式处理
   */
  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setStreamingContent('');

    // 创建新的流式处理器
    streamProcessorRef.current = createStreamProcessor(
      // 处理增量内容
      (content: string) => {
        setStreamingContent((prev) => {
          const newContent = prev + content;
          console.debug('📝 更新流式内容:', { prev, content, newContent });
          // 立即通知内容更新
          options.onContentUpdate?.(newContent);
          return newContent;
        });
      },
      // 处理完成
      (fullContent: string, messageId?: string) => {
        console.debug('✅ 流式处理完成:', { fullContent, messageId });
        setIsStreaming(false);
        setStreamingContent(fullContent); // 确保最终状态一致
        options.onComplete?.(fullContent, messageId);
      },
    );
  }, [options.onComplete]);

  /**
   * 处理流式数据块
   */
  const processChunk = useCallback(
    (chunk: string) => {
      if (streamProcessorRef.current) {
        try {
          streamProcessorRef.current.processChunk(chunk);
        } catch (error) {
          console.error('处理流式数据块失败:', error);
          setIsStreaming(false);
          options.onError?.(error as Error);
        }
      }
    },
    [options.onError],
  );

  /**
   * 停止流式处理
   */
  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    if (streamProcessorRef.current) {
      streamProcessorRef.current.reset();
    }
  }, []);

  /**
   * 获取当前状态
   */
  const getState = useCallback(() => {
    const processorState = streamProcessorRef.current?.getState();

    // 如果流式处理完成，优先使用处理器的完整内容
    // 否则使用内部状态的累积内容
    const fullContent = processorState?.isComplete
      ? processorState.fullContent
      : streamingContent;

    const currentState = {
      fullContent, // 根据完成状态选择内容源
      messageId: processorState?.messageId || null,
      model: processorState?.model || null,
      isComplete: processorState?.isComplete || !isStreaming,
    };

    console.debug('🔍 获取状态:', {
      ...currentState,
      streamingContent,
      processorContent: processorState?.fullContent,
      isComplete: processorState?.isComplete,
      source: processorState?.isComplete ? 'processor' : 'streaming',
    });
    return currentState;
  }, [streamingContent, isStreaming]);

  return {
    streamingContent,
    isStreaming,
    startStreaming,
    processChunk,
    stopStreaming,
    getState,
  };
};

/**
 * 消息列表流式更新Hook
 * 管理消息列表中的流式AI响应
 */
export const useMessageListStreaming = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const currentStreamingIdRef = useRef<string | null>(null);

  /**
   * 添加用户消息
   */
  const addUserMessage = useCallback((content: string): string => {
    const messageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: messageId,
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    return messageId;
  }, []);

  /**
   * 添加AI消息占位符
   */
  const addAiMessagePlaceholder = useCallback((): string => {
    const messageId = `ai-temp-${Date.now()}`;
    const aiMessage: ChatMessage = {
      id: messageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    currentStreamingIdRef.current = messageId;
    console.debug('🆔 设置当前流式消息ID:', messageId);
    return messageId;
  }, []);

  /**
   * 更新流式AI消息内容
   */
  const updateStreamingMessage = useCallback((content: string) => {
    const idToUpdate = currentStreamingIdRef.current;
    if (!idToUpdate) {
      console.warn('⚠️ 无当前流式消息ID，跳过更新:', { content });
      return;
    }

    console.debug('💬 更新AI消息:', {
      currentStreamingId: idToUpdate,
      content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      fullLength: content.length,
    });

    setMessages((prev) =>
      prev.map((msg) => (msg.id === idToUpdate ? { ...msg, content } : msg)),
    );
  }, []);

  /**
   * 完成AI消息
   */
  const completeAiMessage = useCallback(
    (finalContent: string, messageId?: string) => {
      const idToUpdate = currentStreamingIdRef.current;
      if (!idToUpdate) {
        console.warn('⚠️ 无当前流式消息ID，跳过完成:', {
          finalContent,
          messageId,
        });
        return;
      }

      console.debug('🏁 完成AI消息:', { idToUpdate, finalContent, messageId });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === idToUpdate
            ? {
                ...msg,
                id: messageId ? `ai-${messageId}` : `ai-final-${Date.now()}`,
                content: finalContent || '抱歉，我现在无法回答这个问题。',
              }
            : msg,
        ),
      );
      currentStreamingIdRef.current = null;
    },
    [],
  );

  /**
   * 添加错误消息
   */
  const addErrorMessage = useCallback(
    (errorMessage: string = '抱歉，发送消息失败，请稍后再试。') => {
      const idToClear = currentStreamingIdRef.current;

      // 移除可能存在的临时AI消息
      setMessages((prev) => {
        const messagesWithoutTemp = idToClear
          ? prev.filter((msg) => msg.id !== idToClear)
          : prev;

        return [
          ...messagesWithoutTemp,
          {
            id: `error-${Date.now()}`,
            content: errorMessage,
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });
      currentStreamingIdRef.current = null;
    },
    [],
  );

  /**
   * 更新消息反馈
   */
  const updateMessageFeedback = useCallback(
    (messageId: string, feedback: 'helpful' | 'not-helpful' | undefined) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)),
      );
    },
    [],
  );

  /**
   * 设置消息列表
   */
  const setMessageList = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    currentStreamingIdRef.current = null;
  }, []);

  /**
   * 清空消息列表
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    currentStreamingIdRef.current = null;
  }, []);

  return {
    messages,
    currentStreamingId: currentStreamingIdRef.current, // 直接返回ref值，仅供调试
    addUserMessage,
    addAiMessagePlaceholder,
    updateStreamingMessage,
    completeAiMessage,
    addErrorMessage,
    updateMessageFeedback,
    setMessageList,
    clearMessages,
  };
};

/**
 * 完整的流式聊天Hook
 * 结合流式处理和消息管理
 */
export const useStreamingChat = () => {
  const messageList = useMessageListStreaming();

  const streaming = useStreamingMessage({
    onContentUpdate: (content) => {
      console.debug('📱 实时更新UI:', {
        content: content.substring(0, 50) + '...',
        length: content.length,
      });
      messageList.updateStreamingMessage(content);
    },
    onComplete: (fullContent, messageId) => {
      console.debug('🏁 流式聊天完成:', { fullContent, messageId });
      messageList.completeAiMessage(fullContent, messageId);
    },
    onError: (error) => {
      messageList.addErrorMessage();
      console.error('流式处理错误:', error);
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
      // 添加用户消息
      messageList.addUserMessage(content);

      // 添加AI消息占位符
      messageList.addAiMessagePlaceholder();

      // 开始流式处理
      streaming.startStreaming();

      try {
        // 发送消息并处理流式响应
        await sendFunction(content, (chunk) => {
          console.debug('🔄 处理数据块:', chunk);
          streaming.processChunk(chunk);
          // UI更新现在通过onContentUpdate回调自动处理
        });
      } catch (error) {
        console.error('发送消息失败:', error);
        streaming.stopStreaming();
        messageList.addErrorMessage();
        throw error;
      }
    },
    [messageList, streaming],
  );

  return {
    ...messageList,
    ...streaming,
    sendMessage,
  };
};
