import type { ConversationResponseDto } from '@/types/models';

/**
 * 生成会话标题（基于首条消息内容）
 */
export const generateConversationTitle = (
  firstMessage: string,
  maxLength = 20,
): string => {
  if (!firstMessage?.trim()) return '新对话';

  const title = firstMessage.trim();
  if (title.length <= maxLength) return title;

  return title.substring(0, maxLength - 3) + '...';
};

/**
 * 格式化会话时间
 */
export const formatConversationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * 格式化详细的会话时间
 */
export const formatDetailedConversationTime = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 获取会话状态文本
 */
export const getConversationStatusText = (
  conversation: ConversationResponseDto,
): string => {
  if (conversation.isArchived) {
    return '已归档';
  }

  if (conversation.messageCount === 0) {
    return '新建会话';
  }

  return `${conversation.messageCount} 条消息`;
};

/**
 * 按日期分组会话
 */
export const groupConversationsByDate = (
  conversations: ConversationResponseDto[],
): Record<string, ConversationResponseDto[]> => {
  const groups: Record<string, ConversationResponseDto[]> = {};

  conversations.forEach((conversation) => {
    const date = new Date(conversation.updatedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey: string;

    if (date.toDateString() === today.toDateString()) {
      groupKey = '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = '昨天';
    } else {
      const diffDays = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays < 7) {
        groupKey = '本周';
      } else if (diffDays < 30) {
        groupKey = '本月';
      } else {
        groupKey = date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
        });
      }
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(conversation);
  });

  return groups;
};

/**
 * 排序会话列表
 */
export const sortConversations = (
  conversations: ConversationResponseDto[],
  sortBy: 'updatedAt' | 'createdAt' | 'messageCount' = 'updatedAt',
  order: 'asc' | 'desc' = 'desc',
): ConversationResponseDto[] => {
  return [...conversations].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'messageCount':
        aValue = a.messageCount;
        bValue = b.messageCount;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default: // 'updatedAt'
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
    }

    if (order === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
};

/**
 * 过滤会话列表
 */
export const filterConversations = (
  conversations: ConversationResponseDto[],
  filters: {
    search?: string;
    includeArchived?: boolean;
    minMessages?: number;
    dateRange?: {
      start: Date;
      end: Date;
    };
  },
): ConversationResponseDto[] => {
  return conversations.filter((conversation) => {
    // 归档状态过滤
    if (!filters.includeArchived && conversation.isArchived) {
      return false;
    }

    // 最小消息数过滤
    if (
      filters.minMessages &&
      conversation.messageCount < filters.minMessages
    ) {
      return false;
    }

    // 日期范围过滤
    if (filters.dateRange) {
      const conversationDate = new Date(conversation.updatedAt);
      if (
        conversationDate < filters.dateRange.start ||
        conversationDate > filters.dateRange.end
      ) {
        return false;
      }
    }

    // 搜索过滤
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const title = (conversation.title || '').toLowerCase();
      const latestMessage =
        conversation.latestMessage?.userMessage ||
        conversation.latestMessage?.aiResponse ||
        '';

      return (
        title.includes(searchTerm) ||
        latestMessage.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });
};

/**
 * 检查会话是否可以删除
 */
export const canDeleteConversation = (
  conversation: ConversationResponseDto,
): boolean => {
  // 可以根据业务规则自定义，比如：
  // - 已归档的会话可以删除
  // - 超过一定时间的会话可以删除
  // - 没有消息的会话可以删除
  return conversation.isArchived || conversation.messageCount === 0;
};

/**
 * 检查会话是否可以归档
 */
export const canArchiveConversation = (
  conversation: ConversationResponseDto,
): boolean => {
  // 已归档的会话不能再次归档，有消息的会话才能归档
  return !conversation.isArchived && conversation.messageCount > 0;
};

/**
 * 获取会话摘要信息
 */
export const getConversationSummary = (
  conversation: ConversationResponseDto,
): string => {
  if (conversation.latestMessage) {
    const message =
      conversation.latestMessage.userMessage ||
      conversation.latestMessage.aiResponse ||
      '';
    return message.length > 50 ? message.substring(0, 50) + '...' : message;
  }

  return conversation.title || '暂无消息';
};

/**
 * 检查会话是否为新建会话（无消息）
 */
export const isNewConversation = (
  conversation: ConversationResponseDto,
): boolean => {
  return conversation.messageCount === 0;
};

/**
 * 获取会话的显示标题
 */
export const getDisplayTitle = (
  conversation: ConversationResponseDto,
): string => {
  if (conversation.title) {
    return conversation.title;
  }

  if (conversation.latestMessage?.userMessage) {
    return generateConversationTitle(conversation.latestMessage.userMessage);
  }

  return '新对话';
};
