import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useChildrenData } from '../hooks/useChildrenData';
import { useChatSessions } from '../hooks/useChatSessions';
import { useChatMessages } from '../hooks/useChatMessages';
import { ChatContextType, QuickReplyItem } from '../types/chat.types';

// 创建上下文
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// 定义Provider属性
interface ChatProviderProps {
  children: ReactNode;
}

// 创建Provider组件
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // 获取URL中的childId参数
  const initialChildId = searchParams.get('childId') || undefined;

  // 使用自定义hooks
  const {
    children: childrenData,
    selectedChildId,
    selectedChild,
    showChildPrompt,
    setShowChildPrompt,
    fetchChildren,
    handleSelectChild,
    setSelectedChildId,
  } = useChildrenData(initialChildId);

  const {
    sessions,
    chatId,
    setChatId,
    fetchSessions,
    handleNewSession,
    handleSwitchSession,
    handleDeleteSession,
  } = useChatSessions(selectedChildId);

  const {
    messages,
    loading,
    sendingMessage,
    appendMsg,
    updateMsg,
    resetList,
    fetchChatHistory,
    handleSend: sendMessage,
  } = useChatMessages(chatId, selectedChildId);

  // 初始化
  useEffect(() => {
    if (isAuthenticated) {
      fetchChildren();
      fetchSessions();
    }
  }, [isAuthenticated, fetchChildren, fetchSessions]);

  // 当聊天ID变化时，获取聊天历史
  useEffect(() => {
    if (chatId) {
      fetchChatHistory();
    } else {
      resetList([]);
    }
  }, [chatId, fetchChatHistory, resetList]);

  // 处理发送消息
  const handleSend = async (type: string, content: string) => {
    // 如果没有选择儿童但有儿童数据，显示提示
    if (!selectedChildId && childrenData.length > 0 && !showChildPrompt) {
      setShowChildPrompt(true);
    }

    // 发送消息
    await sendMessage(type, content, (newChatId) => {
      setChatId(newChatId);
      fetchSessions();
    });
  };

  // 处理快速回复点击
  const handleQuickReplyClick = (reply: QuickReplyItem) => {
    handleSend('text', reply.name);
  };

  // 创建儿童档案
  const handleCreateChild = () => {
    navigate('/children/create');
  };

  // 去儿童列表页面
  const handleGoToChildrenList = () => {
    navigate('/children');
  };

  // 提供上下文值
  const contextValue: ChatContextType = {
    loading,
    sendingMessage,
    chatId,
    selectedChildId,
    children: childrenData,
    selectedChild,
    showChildPrompt,
    sessions,
    messages,

    setChatId,
    setSelectedChildId,
    setShowChildPrompt,
    handleSend,
    handleQuickReplyClick,
    handleNewSession,
    handleSwitchSession,
    handleDeleteSession,
    handleCreateChild,
    handleSelectChild,
    handleGoToChildrenList,
    appendMsg,
    updateMsg,
    resetList,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

// 创建自定义hook
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
