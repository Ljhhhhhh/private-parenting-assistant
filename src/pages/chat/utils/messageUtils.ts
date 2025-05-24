import type { ChatHistoryDto } from '@/types/models';
import type { ChatMessage } from '../types/chat';

/**
 * 将API消息转换为UI消息格式
 */
export const convertApiMessageToUI = (
  apiMessage: ChatHistoryDto,
): ChatMessage => {
  return {
    id: `chat-${apiMessage.id}`,
    content: apiMessage.userMessage || apiMessage.aiResponse || '',
    isUser: Boolean(apiMessage.userMessage),
    timestamp: new Date(
      apiMessage.requestTimestamp ||
        apiMessage.responseTimestamp ||
        apiMessage.createdAt,
    ),
    chatHistoryId: apiMessage.id,
    conversationId: apiMessage.conversationId,
    feedback:
      apiMessage.isHelpful !== undefined
        ? apiMessage.isHelpful
          ? ('helpful' as const)
          : ('not-helpful' as const)
        : undefined,
  };
};

/**
 * 估算消息高度（用于虚拟滚动）
 */
export const estimateMessageHeight = (message: ChatHistoryDto): number => {
  const baseHeight = 80; // 基础高度（包含头像、时间戳等）
  const contentLength = (message.userMessage || message.aiResponse || '')
    .length;
  const lineHeight = 24; // 每行高度
  const charsPerLine = 50; // 每行字符数（估算，考虑中文）

  const estimatedLines = Math.ceil(contentLength / charsPerLine);
  const contentHeight = estimatedLines * lineHeight;

  // 额外高度（反馈按钮、间距等）
  const extraHeight = message.aiResponse ? 40 : 0;

  return baseHeight + contentHeight + extraHeight;
};

/**
 * 格式化消息时间
 */
export const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}小时前`;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays}天前`;

  return timestamp.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * 格式化详细时间（用于时间戳显示）
 */
export const formatDetailedTime = (timestamp: Date): string => {
  return timestamp.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 检查消息是否为今天
 */
export const isToday = (timestamp: Date): boolean => {
  const today = new Date();
  const messageDate = new Date(timestamp);

  return (
    today.getFullYear() === messageDate.getFullYear() &&
    today.getMonth() === messageDate.getMonth() &&
    today.getDate() === messageDate.getDate()
  );
};

/**
 * 按日期分组消息
 */
export const groupMessagesByDate = (
  messages: ChatMessage[],
): Record<string, ChatMessage[]> => {
  const groups: Record<string, ChatMessage[]> = {};

  messages.forEach((message) => {
    const dateKey = message.timestamp.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(message);
  });

  return groups;
};

/**
 * 生成消息摘要（用于通知等）
 */
export const generateMessageSummary = (
  content: string,
  maxLength: number = 50,
): string => {
  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength - 3) + '...';
};

/**
 * 检查消息内容是否包含敏感词
 */
export const containsSensitiveContent = (content: string): boolean => {
  // 简单的敏感词检查，实际项目中应该使用更完善的过滤系统
  const sensitiveWords = ['测试敏感词']; // 这里应该从配置中读取

  return sensitiveWords.some((word) => content.includes(word));
};

/**
 * 清理消息内容（移除多余空格、换行等）
 */
export const cleanMessageContent = (content: string): string => {
  return content
    .trim()
    .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
    .replace(/\n{3,}/g, '\n\n'); // 将多个换行符限制为最多两个
};

/**
 * 检查消息是否为空或只包含空白字符
 */
export const isEmptyMessage = (content: string): boolean => {
  return !content || content.trim().length === 0;
};
