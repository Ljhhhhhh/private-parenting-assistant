import { useState, useCallback } from 'react';
import { Toast } from 'antd-mobile';
import { useMessages } from '@chatui/core';
import { chatApi } from '../../../api';
import { formatChatHistories } from '../utils/messageFormatters';

/**
 * 管理聊天消息的自定义Hook
 * @returns 消息数据和相关操作
 */
export const useChatMessages = (
  sessionId?: string,
  selectedChildId?: string,
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const { messages, appendMsg, resetList, updateMsg } = useMessages([]);

  // 获取聊天历史
  const fetchChatHistory = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await chatApi.getChatHistories(
        sessionId,
        selectedChildId,
      );

      // 转换历史消息格式
      const historyMessages = formatChatHistories(response.data);

      // 重置消息列表并添加历史消息
      resetList(historyMessages);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      Toast.show({
        icon: 'fail',
        content: '获取聊天记录失败',
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId, selectedChildId, resetList]);

  // 处理发送消息
  const handleSend = async (
    type: string,
    content: string,
    onNewSession?: (sessionId: string) => void,
  ) => {
    // 验证消息类型和内容，防止重复发送
    if (type !== 'text' || !content.trim() || sendingMessage) return;

    // 添加用户消息到聊天界面
    appendMsg({
      type: 'text',
      content: { text: content },
      position: 'right',
    });

    // 添加加载中的AI消息
    const aiMsgId = appendMsg({
      type: 'text',
      content: { text: '思考中...' },
      position: 'left',
    });

    try {
      setSendingMessage(true);

      // 创建请求数据
      const requestData = {
        question: content,
        session_id: sessionId,
        child_id: selectedChildId,
      };

      // 创建一个对象来存储完整的响应数据
      const responseData = {
        token: '',
        sources: [] as string[],
        model: '',
        session_id: sessionId,
      };

      // 使用流式处理发送消息
      await chatApi.sendChatMessage(requestData, (chunk: string) => {
        try {
          // 解析 JSON 数据
          const parsedData = JSON.parse(chunk);

          if (parsedData.token) {
            // 处理消息内容
            responseData.token += parsedData.token;

            // 实时更新AI消息
            updateMsg(aiMsgId, {
              type: 'text',
              content: {
                text: responseData.token || '思考中...',
                data: {
                  sources: responseData.sources,
                  model: responseData.model,
                },
              },
              position: 'left',
            });
          } else if (parsedData.sources) {
            // 处理引用源
            responseData.sources = parsedData;
          }
        } catch (error) {
          console.error('Error parsing JSON data:', error);
        }
      });

      // 如果是新会话，更新会话ID并刷新会话列表
      if (!sessionId && responseData.session_id && onNewSession) {
        onNewSession(responseData.session_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      // 更新AI消息为错误信息
      updateMsg(aiMsgId, {
        type: 'text',
        content: { text: '抱歉，发送消息失败，请稍后再试。' },
        position: 'left',
      });

      Toast.show({
        icon: 'fail',
        content: '发送消息失败',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  return {
    messages,
    loading,
    sendingMessage,
    appendMsg,
    updateMsg,
    resetList,
    fetchChatHistory,
    handleSend,
  };
};
