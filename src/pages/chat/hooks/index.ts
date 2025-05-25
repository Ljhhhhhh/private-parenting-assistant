/**
 * 聊天模块 Hook 统一导出
 *
 * @description
 * 导出所有聊天相关的 Hook，便于统一管理和使用
 *
 * @author Chat Team
 * @since 1.0.0
 */

// ========== 核心 Hook ==========
export * from './core';

// ========== 业务 Hook ==========

// 会话数据管理
export {
  useConversations,
  type UseConversationsOptions,
  type ConversationsState,
  type ConversationsActions,
  type UseConversationsReturn,
} from './useConversations';

// 🆕 会话状态管理
export {
  useConversationState,
  type ConversationStateOptions,
  type ConversationState,
  type ConversationActions,
  type UseConversationStateReturn,
} from './useConversationState';

// 路由参数处理（保持向后兼容）
export {
  useRouterParams,
  usePresetQuestion,
  useSetPresetQuestion,
  useClearPresetQuestion,
  useChatNavigation,
} from './useRouterParams';

export type { RouterParams } from '../types/chat';

// API 集成
export * from './integrations/useChatAPI';
