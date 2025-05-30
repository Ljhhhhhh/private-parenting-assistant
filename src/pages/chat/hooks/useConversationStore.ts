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
    initialMessage?: string,
  ) => Promise<ConversationResponseDto>;
  selectConversation: (id: number | null) => void;
  updateConversation: (
    id: number,
    data: UpdateConversationDto,
  ) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;

  // 批量操作
  deleteMultipleConversations: (ids: number[]) => Promise<void>;

  // 搜索和过滤
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
      createConversation: async (
        childId: number,
        title = '新的对话',
        initialMessage = '',
      ) => {
        try {
          set({ isLoading: true, error: null });

          const createData: CreateConversationDto = {
            childId,
            title,
            initialMessage,
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
