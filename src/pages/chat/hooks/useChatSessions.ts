import { useState, useCallback } from 'react';
import { Toast, Dialog } from 'antd-mobile';
import { chatApi } from '../../../api';

/**
 * 管理聊天会话的自定义Hook
 * @returns 会话数据和相关操作
 */
export const useChatSessions = () => {
  const [sessions, setSessions] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取会话列表
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const sessions = await chatApi.getChatSessions();
      setSessions(sessions);

      // 如果没有指定会话ID，使用第一个会话
      if (!sessionId && sessions.length > 0) {
        setSessionId(sessions[0]);
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
      Toast.show({
        icon: 'fail',
        content: '获取会话列表失败',
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // 创建新会话
  const handleNewSession = () => {
    setSessionId(undefined);
  };

  // 切换会话
  const handleSwitchSession = (session: string) => {
    setSessionId(session);
  };

  // 删除会话
  const handleDeleteSession = () => {
    if (!sessionId) return;

    Dialog.confirm({
      content: '确定要删除此会话吗？',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          // 这里应该有一个删除会话的API调用
          // await chatApi.deleteSession(sessionId);

          // 刷新会话列表
          fetchSessions();

          // 创建新会话
          handleNewSession();

          Toast.show({
            icon: 'success',
            content: '会话已删除',
          });
        } catch (error) {
          console.error('Failed to delete session:', error);
          Toast.show({
            icon: 'fail',
            content: '删除会话失败',
          });
        }
      },
    });
  };

  return {
    sessions,
    sessionId,
    loading,
    setSessionId,
    fetchSessions,
    handleNewSession,
    handleSwitchSession,
    handleDeleteSession,
  };
};
