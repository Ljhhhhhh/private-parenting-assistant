/**
 * 核心Hook统一导出
 *
 * @description
 * 导出经过重构的核心聊天Hook，保持单一职责原则
 *
 * @author Chat Team
 * @since 1.0.0
 */

// 流式处理器
export {
  useStreamProcessor,
  type StreamProcessorOptions,
  type StreamProcessorState,
  type StreamProcessorActions,
  type StreamProcessorReturn,
} from './useStreamProcessor';

// 消息管理器
export {
  useMessageManager,
  type ChatMessage,
  type MessageManagerOptions,
  type MessageManagerState,
  type MessageManagerActions,
  type MessageManagerReturn,
} from './useMessageManager';

// 聊天编排器
export {
  useChatOrchestrator,
  type ChatOrchestratorOptions,
  type ChatOrchestratorState,
  type ChatOrchestratorActions,
  type ChatOrchestratorReturn,
} from './useChatOrchestrator';
