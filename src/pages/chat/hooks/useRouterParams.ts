import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { RouterParams } from '../types/chat';

/**
 * 路由参数处理 Hook
 * 用于处理会话ID参数和路由导航
 */
export const useRouterParams = (): RouterParams => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 解析会话ID
  const currentConversationId = conversationId
    ? parseInt(conversationId, 10)
    : null;

  // 检查会话ID是否有效
  useEffect(() => {
    if (conversationId && isNaN(currentConversationId || 0)) {
      console.warn('无效的会话ID，重定向到聊天主页');
      navigateToNewChat();
    }
  }, [conversationId, currentConversationId]);

  /**
   * 导航到指定会话
   */
  const navigateToConversation = (id: number) => {
    const currentPath = location.pathname;

    // 如果当前就在聊天页面，直接更新URL
    if (currentPath.startsWith('/chat')) {
      navigate(`/chat/${id}`, { replace: true });
    } else {
      navigate(`/chat/${id}`);
    }
  };

  /**
   * 导航到新聊天（无会话ID）
   */
  const navigateToNewChat = () => {
    const currentPath = location.pathname;

    // 如果当前就在聊天页面，直接更新URL
    if (currentPath.startsWith('/chat')) {
      navigate('/chat', { replace: true });
    } else {
      navigate('/chat');
    }
  };

  return {
    currentConversationId,
    navigateToConversation,
    navigateToNewChat,
  };
};

/**
 * 从URL查询参数中获取预设问题
 */
export const usePresetQuestion = (): string | null => {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  return searchParams.get('question');
};

/**
 * 添加预设问题到URL
 */
export const useSetPresetQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (question: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('question', question);

    navigate(
      {
        pathname: location.pathname,
        search: searchParams.toString(),
      },
      { replace: true },
    );
  };
};

/**
 * 清除URL中的预设问题参数
 */
export const useClearPresetQuestion = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('question');

    const newSearch = searchParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: newSearch ? `?${newSearch}` : '',
      },
      { replace: true },
    );
  };
};

/**
 * 导航工具函数集合
 */
export const useChatNavigation = () => {
  const routerParams = useRouterParams();
  const setPresetQuestion = useSetPresetQuestion();
  const clearPresetQuestion = useClearPresetQuestion();

  return {
    ...routerParams,
    setPresetQuestion,
    clearPresetQuestion,
  };
};
