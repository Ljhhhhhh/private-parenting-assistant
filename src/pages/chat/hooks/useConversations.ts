/**
 * 💬 会话数据管理 Hook
 *
 * @description
 * 管理会话列表的获取、搜索、过滤等功能
 * 集成真实 API 接口，替换 mock 数据
 *
 * @author Chat Team
 * @since 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { getConversations } from '@/api/chat';
import type {
  ConversationResponseDto,
  ConversationQueryParams,
} from '@/types/models';

// ========== 类型定义 ==========

export interface UseConversationsOptions {
  childId?: number;
  includeArchived?: boolean;
  autoLoad?: boolean;
}

export interface ConversationsState {
  conversations: ConversationResponseDto[];
  loading: boolean;
  error: Error | null;
  searchQuery: string;
  showArchived: boolean;
}

export interface ConversationsActions {
  loadConversations: (params?: ConversationQueryParams) => Promise<void>;
  refreshConversations: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleArchived: () => void;
  filterConversations: () => ConversationResponseDto[];
}

export interface UseConversationsReturn
  extends ConversationsState,
    ConversationsActions {}

// ========== Hook实现 ==========

export const useConversations = (
  options: UseConversationsOptions = {},
): UseConversationsReturn => {
  const { childId, includeArchived = false, autoLoad = true } = options;

  // 状态管理
  const [conversations, setConversations] = useState<ConversationResponseDto[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(includeArchived);

  /**
   * 加载会话列表
   */
  const loadConversations = useCallback(
    async (params?: ConversationQueryParams) => {
      setLoading(true);
      setError(null);

      try {
        console.debug('🔄 加载会话列表:', { childId, params });

        const queryParams: ConversationQueryParams = {
          childId,
          includeArchived: showArchived,
          limit: 50, // 默认加载50条
          offset: 0,
          ...params,
        };

        const response = await getConversations(queryParams);

        console.debug('✅ 会话列表加载成功:', { count: response.length });
        setConversations(response);
      } catch (err) {
        console.error('❌ 加载会话列表失败:', err);

        const error =
          err instanceof Error ? err : new Error('加载会话列表失败');
        setError(error);

        // 发生错误时设置空数组
        setConversations([]);
      } finally {
        setLoading(false);
      }
    },
    [childId, showArchived],
  );

  /**
   * 刷新会话列表
   */
  const refreshConversations = useCallback(async () => {
    console.debug('🔄 刷新会话列表');
    await loadConversations();
  }, [loadConversations]);

  /**
   * 设置搜索关键词
   */
  const setSearchQueryHandler = useCallback((query: string) => {
    console.debug('🔍 设置搜索关键词:', query);
    setSearchQuery(query);
  }, []);

  /**
   * 切换归档显示状态
   */
  const toggleArchived = useCallback(() => {
    console.debug('📦 切换归档显示状态');
    setShowArchived((prev) => !prev);
  }, []);

  /**
   * 过滤会话列表
   */
  const filterConversations = useCallback((): ConversationResponseDto[] => {
    let filtered = conversations;

    // 归档过滤
    if (showArchived) {
      filtered = filtered.filter((conv) => conv.isArchived);
    } else {
      filtered = filtered.filter((conv) => !conv.isArchived);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((conv) => {
        // 搜索标题
        if (conv.title?.toLowerCase().includes(query)) {
          return true;
        }

        // 搜索最新消息内容
        if (conv.latestMessage?.userMessage?.toLowerCase().includes(query)) {
          return true;
        }

        if (conv.latestMessage?.aiResponse?.toLowerCase().includes(query)) {
          return true;
        }

        return false;
      });
    }

    console.debug('🔍 过滤结果:', {
      原始数量: conversations.length,
      过滤后数量: filtered.length,
      搜索关键词: searchQuery,
      显示归档: showArchived,
    });

    return filtered;
  }, [conversations, searchQuery, showArchived]);

  /**
   * 监听归档状态变化，重新加载数据
   */
  useEffect(() => {
    if (autoLoad) {
      loadConversations();
    }
  }, [showArchived, loadConversations, autoLoad]);

  /**
   * 初始化加载
   */
  useEffect(() => {
    if (autoLoad) {
      loadConversations();
    }
  }, [childId, autoLoad]); // 注意这里不依赖 loadConversations，避免无限循环

  return {
    // 状态
    conversations,
    loading,
    error,
    searchQuery,
    showArchived,

    // 操作方法
    loadConversations,
    refreshConversations,
    setSearchQuery: setSearchQueryHandler,
    toggleArchived,
    filterConversations,
  };
};
