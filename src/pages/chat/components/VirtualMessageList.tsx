import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import type { ChatMessage } from '../types/chat';
import { formatMessageTime } from '../utils/messageUtils';
import { MessageFeedback } from './MessageFeedback';
import { Icon } from '@iconify/react';

interface VirtualMessageListProps {
  messages: ChatMessage[];
  height: number;
  onFeedbackChange?: (
    messageId: string,
    feedback: 'helpful' | 'not-helpful' | undefined,
  ) => void;
  className?: string;
}

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: ChatMessage[];
    onFeedbackChange?: (
      messageId: string,
      feedback: 'helpful' | 'not-helpful' | undefined,
    ) => void;
  };
}

// 消息项高度估算
const ESTIMATED_MESSAGE_HEIGHT = 120;
const MIN_MESSAGE_HEIGHT = 80;
const MAX_MESSAGE_HEIGHT = 300;

/**
 * 单个消息项组件
 */
const MessageItem = React.memo<MessageItemProps>(({ index, style, data }) => {
  const { messages, onFeedbackChange } = data;
  const message = messages[index];

  if (!message) {
    return <div style={style} />;
  }

  return (
    <div
      style={style}
      className={`px-4 py-3 animate-fadeIn ${
        message.isUser ? 'flex justify-end' : 'flex justify-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] ${
          message.isUser ? 'message-user' : 'message-ai'
        }`}
      >
        <div
          className={`rounded-xl p-4 ${
            message.isUser
              ? 'bg-gradient-to-br from-[#FFB38A] to-[#FFC9A8] text-white rounded-tr-sm shadow-sm'
              : 'bg-white border border-[#E0E0E0] text-[#333333] rounded-tl-sm shadow-sm'
          }`}
        >
          {message.content ? (
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap selectable">
              {message.content}
            </div>
          ) : (
            /* 加载动画 */
            <div className="flex items-center justify-center h-8">
              <div className="w-2 h-2 bg-[#FFB38A] opacity-70 rounded-full animate-bounce mx-0.5"></div>
              <div
                className="w-2 h-2 bg-[#FFB38A] opacity-70 rounded-full animate-bounce mx-0.5"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-[#FFB38A] opacity-70 rounded-full animate-bounce mx-0.5"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          )}

          {/* AI消息反馈 */}
          {!message.isUser && message.content && onFeedbackChange && (
            <MessageFeedback
              messageId={message.id}
              chatHistoryId={message.chatHistoryId}
              initialFeedback={message.feedback}
              onFeedbackChange={(feedback) =>
                onFeedbackChange(message.id, feedback)
              }
            />
          )}
        </div>

        {/* 时间戳 */}
        {message.content && (
          <div
            className={`text-xs text-[#999999] mt-1 ${
              message.isUser ? 'text-right mr-1' : 'ml-1'
            }`}
          >
            {formatMessageTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}, areEqual);

MessageItem.displayName = 'MessageItem';

/**
 * 虚拟滚动消息列表组件
 * 优化大量消息的渲染性能
 */
export const VirtualMessageList: React.FC<VirtualMessageListProps> = ({
  messages,
  height,
  onFeedbackChange,
  className = '',
}) => {
  const listRef = useRef<List>(null);
  const messageHeights = new Map<string, number>();

  // 计算消息高度
  const getItemSize = useCallback(
    (index: number) => {
      const message = messages[index];
      if (!message) return ESTIMATED_MESSAGE_HEIGHT;

      const cachedHeight = messageHeights.get(message.id);
      if (cachedHeight) return cachedHeight;

      // 基于内容长度估算高度
      const contentLength = message.content?.length || 0;
      let estimatedHeight = MIN_MESSAGE_HEIGHT;

      // 基础消息高度
      estimatedHeight += Math.min(Math.floor(contentLength / 50) * 20, 100);

      // AI消息包含反馈组件
      if (!message.isUser) {
        estimatedHeight += 40;
      }

      return Math.min(
        Math.max(estimatedHeight, MIN_MESSAGE_HEIGHT),
        MAX_MESSAGE_HEIGHT,
      );
    },
    [messages, messageHeights],
  );

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  // 新消息时自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // 准备传递给列表的数据
  const itemData = useMemo(
    () => ({
      messages,
      onFeedbackChange,
    }),
    [messages, onFeedbackChange],
  );

  // 如果没有消息，显示空状态
  if (messages.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="w-48 h-48 mb-6 animate-float flex items-center justify-center text-[#FFB38A]">
          <Icon icon="ph:baby-fill" width={120} height={120} />
        </div>
        <p className="mb-6 text-lg font-medium text-center text-[#666666]">
          有什么育儿问题，请随时向我提问
        </p>
      </div>
    );
  }

  return (
    <div className={`virtual-message-list ${className}`} style={{ height }}>
      <List
        ref={listRef}
        height={height}
        itemCount={messages.length}
        itemSize={getItemSize}
        itemData={itemData}
        overscanCount={5}
        className="hide-scrollbar"
        style={{ overflowX: 'hidden' }}
      >
        {MessageItem}
      </List>

      {/* 样式 */}
      <style>{`
        /* 虚拟列表样式 */
        .virtual-message-list .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .virtual-message-list .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* 消息气泡尾部三角形 */
        .virtual-message-list .message-user::after {
          content: '';
          position: absolute;
          top: 0;
          right: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid #FFB38A;
          border-right: 8px solid transparent;
        }
        
        .virtual-message-list .message-ai::after {
          content: '';
          position: absolute;
          top: 0;
          left: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid #E0E0E0;
          border-left: 8px solid transparent;
        }
        
        /* 动画 */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .virtual-message-list .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .virtual-message-list .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        /* 可选择文本 */
        .virtual-message-list .selectable {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
      `}</style>
    </div>
  );
};
