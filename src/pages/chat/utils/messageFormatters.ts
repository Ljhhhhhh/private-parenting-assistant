import { ChatHistoryPublic } from '../../../types/api';
import { ChatMessage } from '../types/chat.types';

/**
 * 将API返回的聊天历史转换为UI消息格式
 * @param histories API返回的聊天历史记录
 * @returns 格式化的消息数组
 */
export const formatChatHistories = (histories: ChatHistoryPublic[]): ChatMessage[] => {
  const historyMessages: ChatMessage[] = [];
  
  histories.forEach((history: ChatHistoryPublic) => {
    // 用户消息
    historyMessages.push({
      type: 'text',
      content: { text: history.user_query },
      position: 'right',
      createdAt: new Date(history.created_at).getTime(),
      sessionId: history.session_id,
    });

    // AI回复
    historyMessages.push({
      type: 'text',
      content: {
        text: history.ai_response,
        data: {
          sources: history.sources,
          model: history.model,
        },
      },
      position: 'left',
      createdAt: new Date(history.created_at).getTime() + 1, // 确保顺序正确
      sessionId: history.session_id,
    });
  });

  // 按时间排序
  return historyMessages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
};
