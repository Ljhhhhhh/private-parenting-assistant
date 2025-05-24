import {
  ChatHistoryDto,
  ConversationResponseDto,
  CreateConversationDto,
  UpdateConversationDto,
} from '@/types/models';

// ========== 基础类型定义 ==========

export type ChatMode = 'conversation' | 'single' | 'auto';

export interface ChatError {
  code: string;
  message: string;
  details?: unknown;
}

// ========== 会话相关类型 ==========

export interface ConversationState {
  conversations: ConversationResponseDto[];
  currentConversationId: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface ConversationActions {
  loadConversations: (childId: number) => Promise<void>;
  createConversation: (data: CreateConversationDto) => Promise<number>;
  selectConversation: (id: number) => void;
  updateConversation: (
    id: number,
    data: UpdateConversationDto,
  ) => Promise<void>;
  archiveConversation: (id: number) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  clearError: () => void;
}

export interface ConversationStore
  extends ConversationState,
    ConversationActions {}

// ========== 消息相关类型 ==========

export interface MessageState {
  messagesByConversation: Record<number, ChatHistoryDto[]>;
  streamingMessage: string | null;
  isStreaming: boolean;
  pendingMessages: Record<string, string>;
}

export interface MessageActions {
  loadMessages: (conversationId: number) => Promise<void>;
  addPendingMessage: (tempId: string, content: string) => void;
  updateStreamingMessage: (content: string) => void;
  finishMessage: (tempId: string, finalMessage: ChatHistoryDto) => void;
  clearStreaming: () => void;
}

export interface MessageStore extends MessageState, MessageActions {}

// ========== UI 组件类型 ==========

export interface ChatContainerProps {
  childId: number;
  initialConversationId?: number;
  mode?: ChatMode;
}

export interface ConversationSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConversationSelect: (id: number) => void;
  onNewConversation: () => void;
  currentChildId: number;
}

export interface SmartChatThreadProps {
  conversationId?: number;
  childId: number;
}

export interface ConversationItemProps {
  conversation: ConversationResponseDto;
  isActive: boolean;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

// ========== 智能建议类型 ==========

export interface SmartSuggestion {
  id: string;
  text: string;
  category: 'feeding' | 'sleep' | 'growth' | 'health' | 'behavior';
}

export interface SuggestionCardProps {
  suggestion: string;
  category: SmartSuggestion['category'];
  onSelect: (suggestion: string) => void;
}

// ========== 反馈系统类型 ==========

export type FeedbackType = 'helpful' | 'not-helpful';

export interface FeedbackButtonProps {
  type: FeedbackType;
  isActive: boolean;
  onClick: () => void;
}

export interface FeedbackState {
  [messageId: string]: FeedbackType;
}

// ========== 消息组件类型 ==========

export interface EnhancedMessageProps {
  messageId: string;
  content: string;
  timestamp?: Date;
  feedback?: FeedbackType;
  onFeedback?: (messageId: string, isHelpful: boolean) => void;
}

// ========== Runtime 配置类型 ==========

export interface ChatRuntimeConfig {
  conversationId: number | null;
  childId: number;
}

// ========== 路由相关类型 ==========

export interface RouterParams {
  currentConversationId: number | null;
  navigateToConversation: (id: number) => void;
  navigateToNewChat: () => void;
}

// ========== 性能优化类型 ==========

export interface VirtualMessageListProps {
  messages: ChatHistoryDto[];
  conversationId?: number;
}

export interface MessageHeightEstimate {
  estimated: number;
  actual?: number;
}

// ========== 离线支持类型 ==========

export interface OfflineMessage {
  id: string;
  content: string;
  timestamp: number;
  conversationId?: number;
  childId: number;
}

export interface OfflineState {
  isOnline: boolean;
  queuedMessages: OfflineMessage[];
  syncInProgress: boolean;
}

// ========== 设计规范相关类型 ==========

export interface DesignColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  error: string;
  warning: string;
}

// ========== 导出所有类型 ==========

export * from '@/types/models';
