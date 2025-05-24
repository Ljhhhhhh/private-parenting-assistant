/**
 * 📋 消息列表UI组件
 *
 * @description
 * 展示消息列表的纯UI组件，支持虚拟滚动和动画效果
 * 不包含业务逻辑，通过props接收数据和回调
 *
 * @author Chat Team
 * @since 1.0.0
 */

import React, { memo, useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import type { ChatMessage } from '../../hooks/core/useMessageManager';

// ========== 类型定义 ==========

export interface MessageListProps {
  messages: ChatMessage[];
  className?: string;
  loading?: boolean;
  error?: Error | null;
  onFeedback?: (
    messageId: string,
    feedback: 'helpful' | 'not-helpful' | undefined,
  ) => void;
  onRetry?: () => void;
  autoScroll?: boolean;
  showTimestamp?: boolean;
  showFeedback?: boolean;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface LoadingStateProps {
  message?: string;
}

export interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

// ========== 子组件 ==========

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = '开始新的对话',
  description = '向AI助手提问，获取专业的育儿建议',
  action,
}) => (
  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
    <div className="mb-4 text-4xl">{icon || '💬'}</div>
    <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mb-6 text-gray-500 max-w-sm">{description}</p>
    {action}
  </div>
);

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'AI正在思考中...',
}) => (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center space-x-3 text-blue-600">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  </div>
);

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="mb-4 text-3xl">⚠️</div>
    <h3 className="mb-2 text-lg font-medium text-red-900">出现错误</h3>
    <p className="mb-4 text-red-600 text-sm max-w-sm">
      {error.message || '未知错误'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        重试
      </button>
    )}
  </div>
);

// ========== 主组件 ==========

export const MessageList: React.FC<MessageListProps> = memo(
  ({
    messages,
    className = '',
    loading = false,
    error = null,
    onFeedback,
    onRetry,
    autoScroll = true,
    showTimestamp = true,
    showFeedback = true,
  }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const isAutoScrolling = useRef<boolean>(false);

    /**
     * 自动滚动到底部
     */
    const scrollToBottom = (smooth: boolean = true) => {
      if (!listRef.current || !autoScroll) return;

      isAutoScrolling.current = true;

      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });

      // 延迟重置标志位，避免用户滚动被覆盖
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 1000);
    };

    /**
     * 检测用户是否手动滚动
     */
    const handleScroll = () => {
      if (!listRef.current || isAutoScrolling.current) return;

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      // 如果用户滚动到底部附近，恢复自动滚动
      if (isAtBottom && !autoScroll) {
        // 这里可以通过props回调通知父组件恢复自动滚动
      }
    };

    /**
     * 消息变化时自动滚动
     */
    useEffect(() => {
      if (messages.length > 0) {
        // 新消息时立即滚动，流式更新时平滑滚动
        const lastMessage = messages[messages.length - 1];
        const smooth = lastMessage.isStreaming || false;

        scrollToBottom(smooth);
      }
    }, [messages, autoScroll]);

    /**
     * 渲染消息项
     */
    const renderMessage = (message: ChatMessage, index: number) => {
      return (
        <div
          key={message.id}
          className="animate-in slide-in-from-bottom-4 duration-300"
          style={{
            animationDelay: `${Math.min(index * 50, 300)}ms`,
            animationFillMode: 'both',
          }}
        >
          <MessageItem
            message={message}
            onFeedback={onFeedback}
            showTimestamp={showTimestamp}
            showFeedback={showFeedback}
            className="mb-4"
          />
        </div>
      );
    };

    /**
     * 渲染内容
     */
    const renderContent = () => {
      // 错误状态
      if (error) {
        return <ErrorState error={error} onRetry={onRetry} />;
      }

      // 空状态
      if (messages.length === 0 && !loading) {
        return (
          <EmptyState
            action={
              <div className="text-sm text-gray-400">
                试试问问：我的宝宝几个月可以添加辅食？
              </div>
            }
          />
        );
      }

      // 消息列表
      return (
        <div className="space-y-4 pb-4">
          {messages.map(renderMessage)}

          {/* 加载状态 */}
          {loading && <LoadingState />}
        </div>
      );
    };

    return (
      <div
        ref={listRef}
        className={`
        flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
        ${className}
      `}
        onScroll={handleScroll}
        role="log"
        aria-label="聊天消息列表"
        aria-live="polite"
      >
        <div className="p-4">{renderContent()}</div>
      </div>
    );
  },
);

MessageList.displayName = 'MessageList';
