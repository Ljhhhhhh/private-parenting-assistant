import { useState, useCallback } from 'react';
import { Toast } from 'antd-mobile';
import { useMessages } from '@chatui/core';
import { chat, getChatHistory } from '../../../api/chat';
import {
  formatChatHistories,
  parseStreamResponse,
} from '../utils/messageFormatters';
import { ChatRequestDto } from '../../../types/models';

/**
 * 管理聊天消息的自定义Hook
 * @returns 消息数据和相关操作
 */
export const useChatMessages = (chatId?: number, selectedChildId?: number) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const { messages, appendMsg, resetList, updateMsg } = useMessages([]);

  // 获取聊天历史
  const fetchChatHistory = useCallback(async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      // 使用新的API获取聊天历史
      const response = await getChatHistory(selectedChildId || 0, 10, 0);

      // 转换历史消息格式
      const historyMessages = formatChatHistories(response);

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
  }, [chatId, selectedChildId, resetList]);

  // 处理发送消息
  const handleSend = async (
    type: string,
    content: string,
    onNewChat?: (chatId: number) => void,
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
      const requestData: ChatRequestDto = {
        message: content,
        childId: selectedChildId,
      };

      // 创建一个对象来存储完整的响应数据
      let responseText = '';
      let responseChatId: number | undefined;

      // 使用流式处理发送消息
      const onStreamCallback = (chunk: string) => {
        try {
          // 解析流式响应
          const parsedData = parseStreamResponse(chunk);

          if (parsedData.type === 'content' && parsedData.content) {
            // 处理消息内容
            responseText += parsedData.content;

            // 实时更新AI消息
            updateMsg(aiMsgId, {
              type: 'text',
              content: {
                text: responseText || '思考中...',
              },
              position: 'left',
            });
          } else if (parsedData.type === 'done' && parsedData.chatId) {
            // 处理完成状态，更新聊天ID
            responseChatId = parsedData.chatId;

            // 更新消息中的chatId
            updateMsg(aiMsgId, {
              type: 'text',
              content: {
                text: responseText,
                data: {
                  chatId: responseChatId,
                },
              },
              position: 'left',
              chatId: responseChatId,
            });

            // 如果是新聊天，更新聊天ID并通知父组件
            if (!chatId && responseChatId && onNewChat) {
              onNewChat(responseChatId);
            }
          } else if (parsedData.type === 'error') {
            // 处理错误
            throw new Error(parsedData.error || '未知错误');
          }
        } catch (error) {
          console.error('Error parsing stream response:', error);
        }
      };

      // 发送聊天消息
      await chat(requestData, onStreamCallback);
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
