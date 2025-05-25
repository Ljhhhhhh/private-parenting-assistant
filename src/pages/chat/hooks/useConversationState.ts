/**
 * 🗂️ 会话状态管理Hook
 *
 * @description
 * 基于状态管理的会话切换方案，替代路由参数方案
 * 提供会话选择、切换、历史记录等功能
 *
 * @author Chat Team
 * @since 2.0.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ========== 类型定义 ==========

export interface ConversationStateOptions {
  /** 初始会话ID */
  initialConversationId?: number | null;
  /** 是否启用历史记录 */
  enableHistory?: boolean;
  /** 最大历史记录数量 */
  maxHistorySize?: number;
  /** 状态变化回调 */
  onConversationChange?: (conversationId: number | null) => void;
}

export interface ConversationState {
  /** 当前活跃的会话ID */
  currentConversationId: number | null;
  /** 上一个会话ID */
  previousConversationId: number | null;
  /** 会话历史记录 */
  conversationHistory: number[];
  /** 是否正在切换会话 */
  isSwitching: boolean;
}

export interface ConversationActions {
  /** 选择会话 */
  selectConversation: (conversationId: number | null) => void;
  /** 创建新会话 */
  createNewConversation: () => void;
  /** 清除会话历史 */
  clearHistory: () => void;
  /** 从历史记录中移除会话 */
  removeFromHistory: (conversationId: number) => void;
}

export interface UseConversationStateReturn
  extends ConversationState,
    ConversationActions {}

// ========== Hook实现 ==========

export const useConversationState = (
  options: ConversationStateOptions = {},
): UseConversationStateReturn => {
  const {
    initialConversationId = null,
    enableHistory = true,
    maxHistorySize = 10,
    onConversationChange,
  } = options;

  // 状态管理
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(initialConversationId);
  const [previousConversationId, setPreviousConversationId] = useState<
    number | null
  >(null);
  const [conversationHistory, setConversationHistory] = useState<number[]>([]);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  // 引用，避免闭包问题
  const onConversationChangeRef = useRef(onConversationChange);
  onConversationChangeRef.current = onConversationChange;

  /**
   * 选择会话
   */
  // TODO: 应该发起请求并获取 conversationId 的聊天历史
  const selectConversation = useCallback(
    (conversationId: number | null) => {
      console.debug('🗂️ 选择会话:', {
        from: currentConversationId,
        to: conversationId,
      });

      setIsSwitching(true);

      console.debug('🗂️ 选择会话:', {
        conversationId,
      });

      // 更新历史记录
      if (enableHistory && currentConversationId !== null) {
        setPreviousConversationId(currentConversationId);

        setConversationHistory((prev) => {
          const newHistory = [currentConversationId, ...prev];
          // 移除重复项
          const uniqueHistory = Array.from(new Set(newHistory));
          // 限制历史记录大小
          return uniqueHistory.slice(0, maxHistorySize);
        });
      }

      // 更新当前会话
      setCurrentConversationId(conversationId);

      // 通知变化
      onConversationChangeRef.current?.(conversationId);

      // 模拟切换延迟（可选，用于UI过渡效果）
      setTimeout(() => {
        setIsSwitching(false);
      }, 100);
    },
    [currentConversationId, enableHistory, maxHistorySize],
  );

  /**
   * 创建新会话
   */
  const createNewConversation = useCallback(() => {
    console.debug('🆕 创建新会话');
    selectConversation(null);
  }, [selectConversation]);
  /**
   * 清除会话历史
   */
  const clearHistory = useCallback(() => {
    console.debug('🧹 清除会话历史');
    setConversationHistory([]);
    setPreviousConversationId(null);
  }, []);

  /**
   * 从历史记录中移除会话
   */
  const removeFromHistory = useCallback(
    (conversationId: number) => {
      console.debug('🗑️ 从历史记录中移除会话:', conversationId);

      setConversationHistory((prev) =>
        prev.filter((id) => id !== conversationId),
      );

      // 如果移除的是上一个会话，更新上一个会话
      setPreviousConversationId((prev) =>
        prev === conversationId ? null : prev,
      );

      // 如果移除的是当前会话，切换到新会话
      if (currentConversationId === conversationId) {
        createNewConversation();
      }
    },
    [currentConversationId, createNewConversation],
  );

  // 初始化时的日志
  useEffect(() => {
    console.debug('🗂️ 会话状态管理初始化:', {
      initialConversationId,
      enableHistory,
      maxHistorySize,
    });
  }, []);

  // 状态变化日志
  useEffect(() => {
    console.debug('🗂️ 会话状态变化:', {
      currentConversationId,
      previousConversationId,
      historySize: conversationHistory.length,
      isSwitching,
    });
  }, [
    currentConversationId,
    previousConversationId,
    conversationHistory.length,
    isSwitching,
  ]);

  return {
    // 状态
    currentConversationId,
    previousConversationId,
    conversationHistory,
    isSwitching,

    // 操作方法
    selectConversation,
    createNewConversation,
    clearHistory,
    removeFromHistory,
  };
};
