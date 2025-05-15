import { ChatMessage } from '../types/chat.types';

/**
 * 将API返回的聊天历史转换为UI消息格式
 * @param histories API返回的聊天历史记录
 * @returns 格式化的消息数组
 */
export const formatChatHistories = (histories: any[]): ChatMessage[] => {
  const historyMessages: ChatMessage[] = [];
  
  histories.forEach((history) => {
    // 用户消息
    historyMessages.push({
      type: 'text',
      content: { text: history.userMessage },
      position: 'right',
      createdAt: new Date(history.createdAt).getTime(),
      chatId: history.chatId,
    });

    // AI回复
    historyMessages.push({
      type: 'text',
      content: {
        text: history.response,
        data: {
          chatId: history.chatId,
        },
      },
      position: 'left',
      createdAt: new Date(history.createdAt).getTime() + 1, // 确保顺序正确
      chatId: history.chatId,
    });
  });

  // 按时间排序
  return historyMessages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
};

/**
 * 将流式响应解析为消息内容
 * @param chunk 流式响应数据块
 * @returns 解析后的数据
 */
export const parseStreamResponse = (chunk: string) => {
  try {
    const data = JSON.parse(chunk);
    return data;
  } catch (error) {
    console.error('Error parsing stream response:', error);
    return { type: 'error', error: 'Failed to parse response' };
  }
};
