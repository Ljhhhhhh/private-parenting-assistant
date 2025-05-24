/**
 * 💬 消息项UI组件
 *
 * @description
 * 展示单条聊天消息的纯UI组件，不包含业务逻辑
 * 支持用户消息和AI消息两种类型，包含反馈功能
 *
 * @author Chat Team
 * @since 1.0.0
 */

import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { ChatMessage } from '../../hooks/core/useMessageManager';

// ========== 类型定义 ==========

export interface MessageItemProps {
  message: ChatMessage;
  className?: string;
  onFeedback?: (
    messageId: string,
    feedback: 'helpful' | 'not-helpful' | undefined,
  ) => void;
  showTimestamp?: boolean;
  showFeedback?: boolean;
}

// ========== 组件实现 ==========

export const MessageItem: React.FC<MessageItemProps> = memo(
  ({
    message,
    className = '',
    onFeedback,
    showTimestamp = true,
    showFeedback = true,
  }) => {
    const isUser = message.isUser;
    const isStreaming = message.isStreaming || false;
    const hasError = !!message.error;

    /**
     * 处理反馈按钮点击
     */
    const handleFeedback = (feedback: 'helpful' | 'not-helpful') => {
      if (onFeedback) {
        // 如果点击的是当前已选中的反馈，则取消选择
        const newFeedback =
          message.feedback === feedback ? undefined : feedback;
        onFeedback(message.id, newFeedback);
      }
    };

    /**
     * 格式化时间显示
     */
    const formatTime = (timestamp: Date) => {
      try {
        return formatDistanceToNow(timestamp, {
          addSuffix: true,
          locale: zhCN,
        });
      } catch (error) {
        console.warn('时间格式化失败:', error);
        return '刚刚';
      }
    };

    return (
      <div
        className={`flex w-full ${
          isUser ? 'justify-end' : 'justify-start'
        } ${className}`}
        role="article"
        aria-label={`${isUser ? '用户' : 'AI助手'}消息`}
      >
        <div className={`max-w-[80%] ${isUser ? 'ml-4' : 'mr-4'}`}>
          {/* 消息气泡 */}
          <div
            className={`
            relative px-4 py-3 rounded-2xl shadow-sm
            transition-all duration-200 ease-in-out
            ${
              isUser
                ? 'bg-blue-600 text-white'
                : hasError
                ? 'bg-red-50 border border-red-200 text-red-800'
                : isStreaming
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-gray-800'
                : 'bg-white border border-gray-200 text-gray-800'
            }
            ${isStreaming ? 'animate-pulse' : ''}
          `}
          >
            {/* 消息内容 */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content || (isStreaming ? '' : '消息内容为空')}

              {/* 流式输入指示器 */}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse rounded-sm" />
              )}
            </div>

            {/* 错误信息 */}
            {hasError && (
              <div className="mt-2 text-xs text-red-600 border-t border-red-200 pt-2">
                <span className="font-medium">错误：</span>
                {message.error}
              </div>
            )}

            {/* 消息气泡尾巴 */}
            <div
              className={`
              absolute top-4 w-3 h-3 transform rotate-45
              ${
                isUser
                  ? 'right-[-6px] bg-blue-600'
                  : hasError
                  ? 'left-[-6px] bg-red-50 border-l border-b border-red-200'
                  : isStreaming
                  ? 'left-[-6px] bg-gradient-to-br from-blue-50 to-indigo-50 border-l border-b border-blue-200'
                  : 'left-[-6px] bg-white border-l border-b border-gray-200'
              }
            `}
            />
          </div>

          {/* 时间戳和反馈区域 */}
          <div
            className={`mt-2 flex items-center gap-3 text-xs text-gray-500 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* 时间戳 */}
            {showTimestamp && (
              <span className="select-none">
                {formatTime(message.timestamp)}
              </span>
            )}

            {/* AI消息反馈按钮 */}
            {!isUser &&
              !isStreaming &&
              !hasError &&
              showFeedback &&
              onFeedback && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFeedback('helpful')}
                    className={`
                  p-1 rounded transition-colors duration-200
                  ${
                    message.feedback === 'helpful'
                      ? 'text-green-600 bg-green-100'
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }
                `}
                    title="这个回答有帮助"
                    aria-label="标记为有帮助"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleFeedback('not-helpful')}
                    className={`
                  p-1 rounded transition-colors duration-200
                  ${
                    message.feedback === 'not-helpful'
                      ? 'text-red-600 bg-red-100'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }
                `}
                    title="这个回答没有帮助"
                    aria-label="标记为没有帮助"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  },
);

MessageItem.displayName = 'MessageItem';
