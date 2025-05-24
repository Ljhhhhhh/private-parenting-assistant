/**
 * 🏪 统一聊天状态管理Store
 *
 * @description
 * 基于Reducer模式的统一状态管理，整合会话、消息、流式、UI等状态
 * 提供中间件支持，实现副作用处理和状态持久化
 *
 * @author Chat Team
 * @since 1.0.0
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import type { ChatMessage } from '../hooks/core/useMessageManager';

// ========== 状态类型定义 ==========

export interface ChatState {
  // 会话状态
  conversations: {
    activeConversationId: number | null;
    conversations: Conversation[];
  };

  // 消息状态
  messages: {
    messageList: ChatMessage[];
    currentStreamingId: string | null;
    isLoading: boolean;
  };

  // 流式状态
  streaming: {
    isStreaming: boolean;
    content: string;
    error: Error | null;
  };

  // UI状态
  ui: {
    sidebarVisible: boolean;
    inputFocused: boolean;
    theme: 'light' | 'dark' | 'auto';
  };

  // 离线状态
  offline: {
    isOnline: boolean;
    queuedMessages: QueuedMessage[];
    lastSyncTime: Date | null;
  };
}

export interface Conversation {
  id: number;
  title: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueuedMessage {
  id: string;
  content: string;
  timestamp: Date;
  retryCount: number;
}

// ========== Action类型定义 ==========

export type ChatAction =
  // 会话Actions
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: number | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | {
      type: 'UPDATE_CONVERSATION';
      payload: { id: number; updates: Partial<Conversation> };
    }
  | { type: 'REMOVE_CONVERSATION'; payload: number }

  // 消息Actions
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | {
      type: 'UPDATE_MESSAGE';
      payload: { id: string; updates: Partial<ChatMessage> };
    }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STREAMING_ID'; payload: string | null }

  // 流式Actions
  | { type: 'START_STREAMING' }
  | { type: 'UPDATE_STREAMING_CONTENT'; payload: string }
  | {
      type: 'COMPLETE_STREAMING';
      payload: { content: string; messageId?: string };
    }
  | { type: 'STREAMING_ERROR'; payload: Error }
  | { type: 'STOP_STREAMING' }

  // UI Actions
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_VISIBLE'; payload: boolean }
  | { type: 'SET_INPUT_FOCUSED'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }

  // 离线Actions
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'QUEUE_MESSAGE'; payload: QueuedMessage }
  | { type: 'REMOVE_QUEUED_MESSAGE'; payload: string }
  | { type: 'CLEAR_QUEUED_MESSAGES' }
  | { type: 'UPDATE_LAST_SYNC_TIME'; payload: Date };

// ========== 初始状态 ==========

const initialState: ChatState = {
  conversations: {
    activeConversationId: null,
    conversations: [],
  },
  messages: {
    messageList: [],
    currentStreamingId: null,
    isLoading: false,
  },
  streaming: {
    isStreaming: false,
    content: '',
    error: null,
  },
  ui: {
    sidebarVisible: true,
    inputFocused: false,
    theme: 'auto',
  },
  offline: {
    isOnline: navigator.onLine,
    queuedMessages: [],
    lastSyncTime: null,
  },
};

// ========== Reducer实现 ==========

export const chatReducer = (
  state: ChatState,
  action: ChatAction,
): ChatState => {
  console.debug('🏪 Store Action:', action.type, action);

  switch (action.type) {
    // ===== 会话相关 =====
    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        conversations: {
          ...state.conversations,
          activeConversationId: action.payload,
        },
      };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: {
          ...state.conversations,
          conversations: [...state.conversations.conversations, action.payload],
        },
      };

    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: {
          ...state.conversations,
          conversations: state.conversations.conversations.map((conv) =>
            conv.id === action.payload.id
              ? { ...conv, ...action.payload.updates }
              : conv,
          ),
        },
      };

    case 'REMOVE_CONVERSATION':
      return {
        ...state,
        conversations: {
          ...state.conversations,
          conversations: state.conversations.conversations.filter(
            (conv) => conv.id !== action.payload,
          ),
          activeConversationId:
            state.conversations.activeConversationId === action.payload
              ? null
              : state.conversations.activeConversationId,
        },
      };

    // ===== 消息相关 =====
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          messageList: [...state.messages.messageList, action.payload],
        },
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          messageList: state.messages.messageList.map((msg) =>
            msg.id === action.payload.id
              ? { ...msg, ...action.payload.updates }
              : msg,
          ),
        },
      };

    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          messageList: state.messages.messageList.filter(
            (msg) => msg.id !== action.payload,
          ),
          currentStreamingId:
            state.messages.currentStreamingId === action.payload
              ? null
              : state.messages.currentStreamingId,
        },
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          messageList: action.payload,
          currentStreamingId: null,
        },
      };

    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: {
          messageList: [],
          currentStreamingId: null,
          isLoading: false,
        },
        streaming: {
          isStreaming: false,
          content: '',
          error: null,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        messages: {
          ...state.messages,
          isLoading: action.payload,
        },
      };

    case 'SET_STREAMING_ID':
      return {
        ...state,
        messages: {
          ...state.messages,
          currentStreamingId: action.payload,
        },
      };

    // ===== 流式处理相关 =====
    case 'START_STREAMING':
      return {
        ...state,
        streaming: {
          isStreaming: true,
          content: '',
          error: null,
        },
        messages: {
          ...state.messages,
          isLoading: true,
        },
      };

    case 'UPDATE_STREAMING_CONTENT':
      return {
        ...state,
        streaming: {
          ...state.streaming,
          content: action.payload,
        },
      };

    case 'COMPLETE_STREAMING':
      return {
        ...state,
        streaming: {
          isStreaming: false,
          content: action.payload.content,
          error: null,
        },
        messages: {
          ...state.messages,
          isLoading: false,
          currentStreamingId: null,
        },
      };

    case 'STREAMING_ERROR':
      return {
        ...state,
        streaming: {
          isStreaming: false,
          content: '',
          error: action.payload,
        },
        messages: {
          ...state.messages,
          isLoading: false,
        },
      };

    case 'STOP_STREAMING':
      return {
        ...state,
        streaming: {
          isStreaming: false,
          content: '',
          error: null,
        },
        messages: {
          ...state.messages,
          isLoading: false,
          currentStreamingId: null,
        },
      };

    // ===== UI相关 =====
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarVisible: !state.ui.sidebarVisible,
        },
      };

    case 'SET_SIDEBAR_VISIBLE':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarVisible: action.payload,
        },
      };

    case 'SET_INPUT_FOCUSED':
      return {
        ...state,
        ui: {
          ...state.ui,
          inputFocused: action.payload,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };

    // ===== 离线相关 =====
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        offline: {
          ...state.offline,
          isOnline: action.payload,
        },
      };

    case 'QUEUE_MESSAGE':
      return {
        ...state,
        offline: {
          ...state.offline,
          queuedMessages: [...state.offline.queuedMessages, action.payload],
        },
      };

    case 'REMOVE_QUEUED_MESSAGE':
      return {
        ...state,
        offline: {
          ...state.offline,
          queuedMessages: state.offline.queuedMessages.filter(
            (msg) => msg.id !== action.payload,
          ),
        },
      };

    case 'CLEAR_QUEUED_MESSAGES':
      return {
        ...state,
        offline: {
          ...state.offline,
          queuedMessages: [],
        },
      };

    case 'UPDATE_LAST_SYNC_TIME':
      return {
        ...state,
        offline: {
          ...state.offline,
          lastSyncTime: action.payload,
        },
      };

    default:
      console.warn('🏪 未知的Action类型:', action);
      return state;
  }
};

// ========== Context定义 ==========

export interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

export const ChatContext = createContext<ChatContextValue | undefined>(
  undefined,
);

// ========== Provider组件 ==========

export interface ChatProviderProps {
  children: React.ReactNode;
  initialState?: Partial<ChatState>;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  initialState: providedInitialState = {},
}) => {
  const mergedInitialState = { ...initialState, ...providedInitialState };
  const [state, dispatch] = useReducer(chatReducer, mergedInitialState);

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      console.debug('🏪 网络已连接');
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    };

    const handleOffline = () => {
      console.debug('🏪 网络已断开');
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 状态持久化（简单版本）
  useEffect(() => {
    // 保存重要状态到localStorage
    const stateToSave = {
      conversations: state.conversations,
      ui: { theme: state.ui.theme },
    };

    localStorage.setItem('chatState', JSON.stringify(stateToSave));
  }, [state.conversations, state.ui.theme]);

  const contextValue: ChatContextValue = {
    state,
    dispatch,
  };

  return React.createElement(
    ChatContext.Provider,
    { value: contextValue },
    children,
  );
};

// ========== Hook使用 ==========

export const useChatStore = () => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error('useChatStore must be used within a ChatProvider');
  }

  return context;
};

// ========== Selector Hook ==========

export const useChatSelector = <T>(selector: (state: ChatState) => T) => {
  const { state } = useChatStore();
  return selector(state);
};

// ========== Action Creators ==========

export const useChatActions = () => {
  const { dispatch } = useChatStore();

  return {
    // 会话操作
    setActiveConversation: useCallback(
      (conversationId: number | null) => {
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
      },
      [dispatch],
    ),

    addConversation: useCallback(
      (conversation: Conversation) => {
        dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
      },
      [dispatch],
    ),

    // 消息操作
    addMessage: useCallback(
      (message: ChatMessage) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
      },
      [dispatch],
    ),

    updateMessage: useCallback(
      (id: string, updates: Partial<ChatMessage>) => {
        dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
      },
      [dispatch],
    ),

    clearMessages: useCallback(() => {
      dispatch({ type: 'CLEAR_MESSAGES' });
    }, [dispatch]),

    // 流式操作
    startStreaming: useCallback(() => {
      dispatch({ type: 'START_STREAMING' });
    }, [dispatch]),

    updateStreamingContent: useCallback(
      (content: string) => {
        dispatch({ type: 'UPDATE_STREAMING_CONTENT', payload: content });
      },
      [dispatch],
    ),

    completeStreaming: useCallback(
      (content: string, messageId?: string) => {
        dispatch({
          type: 'COMPLETE_STREAMING',
          payload: { content, messageId },
        });
      },
      [dispatch],
    ),

    // UI操作
    toggleSidebar: useCallback(() => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, [dispatch]),

    setSidebarVisible: useCallback(
      (visible: boolean) => {
        dispatch({ type: 'SET_SIDEBAR_VISIBLE', payload: visible });
      },
      [dispatch],
    ),

    setTheme: useCallback(
      (theme: 'light' | 'dark' | 'auto') => {
        dispatch({ type: 'SET_THEME', payload: theme });
      },
      [dispatch],
    ),
  };
};
