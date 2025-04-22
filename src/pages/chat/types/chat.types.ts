import { ChildPublic, ChatHistoryPublic } from '../../../types/api';

// 定义快速回复项类型
export interface QuickReplyItem {
  name: string;
  isNew?: boolean;
  isHighlight?: boolean;
}

// 定义消息类型
export interface ChatMessage {
  type: string;
  content: {
    text: string;
    data?: any;
  };
  position?: 'left' | 'right';
  createdAt?: number;
  hasTime?: boolean;
  user?: {
    avatar?: string;
    name?: string;
  };
  sessionId?: string;
}

// 定义聊天上下文类型
export interface ChatContextType {
  // 状态
  loading: boolean;
  sendingMessage: boolean;
  sessionId: string | undefined;
  selectedChildId: string | undefined;
  children: ChildPublic[];
  selectedChild: ChildPublic | null;
  showChildPrompt: boolean;
  sessions: string[];
  messages: ChatMessage[];
  
  // 操作
  setSessionId: (sessionId: string | undefined) => void;
  setSelectedChildId: (childId: string | undefined) => void;
  setShowChildPrompt: (show: boolean) => void;
  handleSend: (type: string, content: string) => Promise<void>;
  handleQuickReplyClick: (reply: QuickReplyItem) => void;
  handleNewSession: () => void;
  handleSwitchSession: (session: string) => void;
  handleDeleteSession: () => void;
  handleCreateChild: () => void;
  handleSelectChild: (childId: string) => void;
  handleGoToChildrenList: () => void;
  appendMsg: (msg: ChatMessage) => string;
  updateMsg: (msgId: string, msg: ChatMessage) => void;
  resetList: (msgs: ChatMessage[]) => void;
}
