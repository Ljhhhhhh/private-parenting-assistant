import { ChildResponseDto } from '../../../types/models';

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
    data?: {
      sources?: string[];
      model?: string;
      chatId?: number;
    };
  };
  position?: 'left' | 'right';
  createdAt?: number;
  hasTime?: boolean;
  user?: {
    avatar?: string;
    name?: string;
  };
  chatId?: number;
}

// 定义聊天上下文类型
export interface ChatContextType {
  // 状态
  loading: boolean;
  sendingMessage: boolean;
  chatId: number | undefined;
  selectedChildId: number | undefined;
  children: ChildResponseDto[];
  selectedChild: ChildResponseDto | null;
  showChildPrompt: boolean;
  sessions: number[];
  messages: ChatMessage[];
  
  // 操作
  setChatId: (chatId: number | undefined) => void;
  setSelectedChildId: (childId: number | undefined) => void;
  setShowChildPrompt: (show: boolean) => void;
  handleSend: (type: string, content: string) => Promise<void>;
  handleQuickReplyClick: (reply: QuickReplyItem) => void;
  handleNewSession: () => void;
  handleSwitchSession: (chatId: number) => void;
  handleDeleteSession: () => void;
  handleCreateChild: () => void;
  handleSelectChild: (childId: number) => void;
  handleGoToChildrenList: () => void;
  appendMsg: (msg: ChatMessage) => string;
  updateMsg: (msgId: string, msg: ChatMessage) => void;
  resetList: (msgs: ChatMessage[]) => void;
}
