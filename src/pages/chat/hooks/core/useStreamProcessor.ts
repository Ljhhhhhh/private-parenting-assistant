/**
 * 🔄 流式消息处理器 Hook
 *
 * @description
 * 专注于流式数据的接收、解析和累积处理
 * 不涉及UI状态管理，保持单一职责
 *
 * @author Chat Team
 * @since 1.0.0
 */

import { useState, useCallback, useRef } from 'react';
import { createStreamProcessor } from '@/utils/streamParser';

// ========== 类型定义 ==========

export interface StreamProcessorOptions {
  onChunk?: (content: string) => void;
  onComplete?: (fullContent: string, messageId?: string) => void;
  onError?: (error: Error) => void;
}

export interface StreamProcessorState {
  content: string;
  isProcessing: boolean;
  isComplete: boolean;
  messageId: string | null;
  model: string | null;
  error: Error | null;
}

export interface StreamProcessorActions {
  startProcessing: () => void;
  processChunk: (chunk: string) => void;
  stopProcessing: () => void;
  reset: () => void;
  getState: () => StreamProcessorState;
}

export interface StreamProcessorReturn
  extends StreamProcessorState,
    StreamProcessorActions {}

// ========== Hook实现 ==========

/**
 * 流式处理器Hook
 *
 * @param options 配置选项
 * @returns 流式处理器状态和操作方法
 */
export const useStreamProcessor = (
  options: StreamProcessorOptions = {},
): StreamProcessorReturn => {
  // 内部状态
  const [content, setContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // 流式处理器引用
  const processorRef = useRef<ReturnType<typeof createStreamProcessor> | null>(
    null,
  );

  /**
   * 开始流式处理
   */
  const startProcessing = useCallback(() => {
    console.debug('🔄 开始流式处理');

    // 重置状态
    setContent('');
    setIsProcessing(true);
    setIsComplete(false);
    setMessageId(null);
    setModel(null);
    setError(null);

    // 创建新的流式处理器
    processorRef.current = createStreamProcessor(
      // 处理完整内容（不是增量内容）
      (fullContent: string) => {
        console.debug('📝 流式内容更新:', {
          contentLength: fullContent.length,
        });

        // 直接设置完整内容
        setContent(fullContent);

        // 通知外部
        options.onChunk?.(fullContent);
      },

      // 处理完成
      (fullContent: string, msgId?: string) => {
        console.debug('✅ 流式处理完成:', {
          contentLength: fullContent.length,
          messageId: msgId,
        });

        setContent(fullContent);
        setIsProcessing(false);
        setIsComplete(true);

        if (msgId) {
          setMessageId(msgId);
        }

        // 通知外部
        options.onComplete?.(fullContent, msgId);
      },
    );
  }, [options.onChunk, options.onComplete]);

  /**
   * 处理数据块
   */
  const processChunk = useCallback(
    (chunk: string) => {
      if (!processorRef.current) {
        console.warn('⚠️ 流式处理器未初始化');
        return;
      }

      try {
        console.debug('📥 处理数据块:', {
          chunkLength: chunk.length,
          preview: chunk.substring(0, 50) + (chunk.length > 50 ? '...' : ''),
        });

        processorRef.current.processChunk(chunk);
      } catch (err) {
        console.error('❌ 处理数据块失败:', err);
        const error = err instanceof Error ? err : new Error('数据块处理失败');

        setError(error);
        setIsProcessing(false);

        // 通知外部
        options.onError?.(error);
      }
    },
    [options.onError],
  );

  /**
   * 停止流式处理
   */
  const stopProcessing = useCallback(() => {
    console.debug('⏹️ 停止流式处理');

    setIsProcessing(false);

    if (processorRef.current) {
      processorRef.current.reset();
      processorRef.current = null;
    }
  }, []);

  /**
   * 重置所有状态
   */
  const reset = useCallback(() => {
    console.debug('🔄 重置流式处理器');

    setContent('');
    setIsProcessing(false);
    setIsComplete(false);
    setMessageId(null);
    setModel(null);
    setError(null);

    if (processorRef.current) {
      processorRef.current.reset();
      processorRef.current = null;
    }
  }, []);

  /**
   * 获取当前状态快照
   */
  const getState = useCallback((): StreamProcessorState => {
    return {
      content,
      isProcessing,
      isComplete,
      messageId,
      model,
      error,
    };
  }, [content, isProcessing, isComplete, messageId, model, error]);

  // 返回状态和操作方法
  return {
    // 状态
    content,
    isProcessing,
    isComplete,
    messageId,
    model,
    error,

    // 操作方法
    startProcessing,
    processChunk,
    stopProcessing,
    reset,
    getState,
  };
};
