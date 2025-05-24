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

// API 集成
export * from './integrations/useChatAPI';
