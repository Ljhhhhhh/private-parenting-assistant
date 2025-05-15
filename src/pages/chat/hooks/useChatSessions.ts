import { useState, useCallback } from 'react';
import { Toast, Dialog } from 'antd-mobile';
import { getChatHistory } from '../../../api/chat';

/**
 * 管理聊天会话的自定义Hook
 * @param selectedChildId 选定的儿童ID，用于获取该儿童的聊天历史
 * @returns 会话数据和相关操作
 */
export const useChatSessions = (selectedChildId?: number) => {
  const [sessions, setSessions] = useState<number[]>([]);
  const [chatId, setChatId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取会话列表
  const fetchSessions = useCallback(async () => {
    // TODO: 应该在选择儿童时保存儿童id，用来获取上一次聊天的儿童ID，
    // TODO: 然后是通过儿童ID获取聊天记录 getChildChats
    // TODO: 后端需要支持跨域
    try {
      setLoading(true);
      // 使用选定的儿童ID获取聊天历史
      if (!selectedChildId) return;
      const response = await getChatHistory(selectedChildId, 20, 0);

      // 提取不同的聊天ID
      const chatIds = response
        .map((chat: any) => chat.chatId)
        .filter((id: number, index: number, self: any) => {
          return self.indexOf(id) === index;
        });

      setSessions(chatIds);

      // 如果没有指定聊天ID，使用第一个聊天ID
      if (!chatId && chatIds.length > 0) {
        setChatId(chatIds[0]);
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
      Toast.show({
        icon: 'fail',
        content: '获取聊天列表失败',
      });
    } finally {
      setLoading(false);
    }
  }, [chatId, selectedChildId]);

  // 创建新聊天
  const handleNewSession = () => {
    setChatId(undefined);
  };

  // 切换聊天
  const handleSwitchSession = (id: number) => {
    setChatId(id);
  };

  // 删除聊天
  const handleDeleteSession = () => {
    if (!chatId) return;

    Dialog.confirm({
      content: '确定要删除此聊天吗？',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          // 注意：当前版本的API中可能没有删除聊天的功能
          // 如果需要实现删除功能，需要添加相应的API

          // 刷新聊天列表
          fetchSessions();

          // 创建新聊天
          handleNewSession();

          Toast.show({
            icon: 'success',
            content: '聊天已删除',
          });
        } catch (error) {
          console.error('Failed to delete chat:', error);
          Toast.show({
            icon: 'fail',
            content: '删除聊天失败',
          });
        }
      },
    });
  };

  return {
    sessions,
    chatId,
    loading,
    setChatId,
    fetchSessions,
    handleNewSession,
    handleSwitchSession,
    handleDeleteSession,
  };
};
