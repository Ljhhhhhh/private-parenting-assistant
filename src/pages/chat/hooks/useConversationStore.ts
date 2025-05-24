import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getConversations,
  createConversation as apiCreateConversation,
  updateConversation as apiUpdateConversation,
  deleteConversation as apiDeleteConversation,
} from '@/api/chat';
import type {
  ConversationResponseDto,
  CreateConversationDto,
  UpdateConversationDto,
} from '@/types/models';

interface ConversationState {
  conversations: ConversationResponseDto[];
  currentConversationId: number | null;
  isLoading: boolean;
  error: string | null;
}

interface ConversationActions {
  // 基础操作
  loadConversations: (childId: number) => Promise<void>;
  createConversation: (
    childId: number,
    title?: string,
  ) => Promise<ConversationResponseDto>;
  selectConversation: (id: number | null) => void;
  updateConversation: (
    id: number,
    data: UpdateConversationDto,
  ) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  archiveConversation: (id: number) => Promise<void>;

  // 批量操作
  deleteMultipleConversations: (ids: number[]) => Promise<void>;
  archiveMultipleConversations: (ids: number[]) => Promise<void>;

  // 搜索和过滤
  searchConversations: (query: string) => ConversationResponseDto[];
  getArchivedConversations: () => ConversationResponseDto[];
  getActiveConversations: () => ConversationResponseDto[];

  // 状态管理
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type ConversationStore = ConversationState & ConversationActions;

/**
 * 会话管理Store
 * 提供会话的CRUD操作、搜索、批量操作等功能
 */
export const useConversationStore = create<ConversationStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      error: null,

      // 加载会话列表
      loadConversations: async (childId: number) => {
        try {
          set({ isLoading: true, error: null });

          const conversations = await getConversations({ childId });

          set({
            conversations: conversations || [],
            isLoading: false,
          });
        } catch (error) {
          console.error('加载会话列表失败:', error);
          set({
            error: error instanceof Error ? error.message : '加载会话列表失败',
            isLoading: false,
          });
        }
      },

      // 创建新会话
      createConversation: async (childId: number, title = '新的对话') => {
        try {
          set({ isLoading: true, error: null });

          const createData: CreateConversationDto = {
            childId,
            title,
          };

          const newConversation = await apiCreateConversation(createData);

          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            currentConversationId: newConversation.id,
            isLoading: false,
          }));

          return newConversation;
        } catch (error) {
          console.error('创建会话失败:', error);
          set({
            error: error instanceof Error ? error.message : '创建会话失败',
            isLoading: false,
          });
          throw error;
        }
      },

      // 选择会话
      selectConversation: (id: number | null) => {
        set({ currentConversationId: id });
      },

      // 更新会话
      updateConversation: async (id: number, data: UpdateConversationDto) => {
        try {
          set({ error: null });

          await apiUpdateConversation(id, data);

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === id
                ? { ...conv, ...data, updatedAt: new Date().toISOString() }
                : conv,
            ),
          }));
        } catch (error) {
          console.error('更新会话失败:', error);
          set({
            error: error instanceof Error ? error.message : '更新会话失败',
          });
          throw error;
        }
      },

      // 删除会话
      deleteConversation: async (id: number) => {
        try {
          set({ error: null });

          await apiDeleteConversation(id);

          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
            currentConversationId:
              state.currentConversationId === id
                ? null
                : state.currentConversationId,
          }));
        } catch (error) {
          console.error('删除会话失败:', error);
          set({
            error: error instanceof Error ? error.message : '删除会话失败',
          });
          throw error;
        }
      },

      // 归档会话
      archiveConversation: async (id: number) => {
        try {
          await get().updateConversation(id, { isArchived: true });
        } catch (error) {
          console.error('归档会话失败:', error);
          throw error;
        }
      },

      // 批量删除会话
      deleteMultipleConversations: async (ids: number[]) => {
        try {
          set({ isLoading: true, error: null });

          // 并行删除所有会话
          await Promise.all(ids.map((id) => apiDeleteConversation(id)));

          set((state) => ({
            conversations: state.conversations.filter(
              (conv) => !ids.includes(conv.id),
            ),
            currentConversationId: ids.includes(
              state.currentConversationId || 0,
            )
              ? null
              : state.currentConversationId,
            isLoading: false,
          }));
        } catch (error) {
          console.error('批量删除会话失败:', error);
          set({
            error: error instanceof Error ? error.message : '批量删除会话失败',
            isLoading: false,
          });
          throw error;
        }
      },

      // 批量归档会话
      archiveMultipleConversations: async (ids: number[]) => {
        try {
          set({ isLoading: true, error: null });

          // 并行归档所有会话
          await Promise.all(
            ids.map((id) => apiUpdateConversation(id, { isArchived: true })),
          );

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              ids.includes(conv.id)
                ? {
                    ...conv,
                    isArchived: true,
                    updatedAt: new Date().toISOString(),
                  }
                : conv,
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error('批量归档会话失败:', error);
          set({
            error: error instanceof Error ? error.message : '批量归档会话失败',
            isLoading: false,
          });
          throw error;
        }
      },

      // 搜索会话
      searchConversations: (query: string) => {
        const { conversations } = get();

        if (!query.trim()) {
          return conversations;
        }

        const searchTerm = query.toLowerCase();
        return conversations.filter(
          (conv) =>
            conv.title?.toLowerCase().includes(searchTerm) ||
            conv.latestMessage?.userMessage?.toLowerCase().includes(searchTerm),
        );
      },

      // 获取归档会话
      getArchivedConversations: () => {
        const { conversations } = get();
        return conversations.filter((conv) => conv.isArchived);
      },

      // 获取活跃会话
      getActiveConversations: () => {
        const { conversations } = get();
        return conversations.filter((conv) => !conv.isArchived);
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'conversation-store',
      partialize: (state: ConversationStore) => ({
        currentConversationId: state.currentConversationId,
      }),
    },
  ),
);

/**
 * 会话统计Hook
 * 提供会话相关的统计信息
 */
export const useConversationStats = () => {
  const conversations = useConversationStore(
    (state: ConversationStore) => state.conversations,
  );

  return {
    totalCount: conversations.length,
    activeCount: conversations.filter((conv) => !conv.isArchived).length,
    archivedCount: conversations.filter((conv) => conv.isArchived).length,
    totalMessages: conversations.reduce(
      (sum, conv) => sum + (conv.messageCount || 0),
      0,
    ),
  };
};

/**
 * 会话搜索Hook
 * 提供搜索功能和结果管理
 */
export const useConversationSearch = () => {
  const searchConversations = useConversationStore(
    (state: ConversationStore) => state.searchConversations,
  );

  return {
    search: searchConversations,
  };
};

// ========== 选择器 Hooks ==========

/**
 * 获取当前选中的会话
 */
export const useCurrentConversation = () => {
  return useConversationStore((state) => {
    if (!state.currentConversationId) return null;
    return (
      state.conversations.find(
        (conv) => conv.id === state.currentConversationId,
      ) || null
    );
  });
};

/**
 * 获取会话加载状态
 */
export const useConversationLoading = () => {
  return useConversationStore((state) => state.isLoading);
};

/**
 * 获取会话错误状态
 */
export const useConversationError = () => {
  return useConversationStore((state) => state.error);
};

/**
 * 获取会话列表（按更新时间排序）
 */
export const useSortedConversations = () => {
  return useConversationStore((state) =>
    [...state.conversations].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ),
  );
};

/**
 * 检查是否有会话存在
 */
export const useHasConversations = () => {
  return useConversationStore((state) => state.conversations.length > 0);
};

// ========== 工具函数 ==========

/**
 * 生成会话标题（基于首条消息内容）
 */
export const generateConversationTitle = (
  firstMessage: string,
  maxLength = 20,
): string => {
  if (!firstMessage?.trim()) return '新对话';

  const title = firstMessage.trim();
  if (title.length <= maxLength) return title;

  return title.substring(0, maxLength - 3) + '...';
};

/**
 * 格式化会话时间
 */
export const formatConversationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
};
