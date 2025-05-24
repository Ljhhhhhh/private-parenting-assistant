/**
 * 🏢 聊天容器组件
 *
 * @description
 * 聊天功能的业务容器组件，整合重构后的Hook和UI组件
 * 负责协调聊天流程，不直接处理UI渲染细节
 *
 * @author Chat Team
 * @since 1.0.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useChatOrchestrator } from '../hooks/core/useChatOrchestrator';
import { MessageList } from '../components/ui/MessageList';
import { SmartMessageInput } from '../components/ui/SmartMessageInput';
import { useChatAPI } from '../hooks/integrations/useChatAPI';

// ========== 类型定义 ==========

export interface ChatContainerProps {
  childId?: number;
  className?: string;
  onError?: (error: Error) => void;
  onMessageSent?: (content: string) => void;
  onMessageReceived?: (content: string) => void;
}

// ========== 主组件 ==========

export const ChatContainer: React.FC<ChatContainerProps> = ({
  childId,
  className = '',
  onError,
  onMessageSent,
  onMessageReceived,
}) => {
  // 智能建议状态
  const [suggestions, setSuggestions] = useState<string[]>([
    '我的宝宝几个月可以添加辅食？',
    '宝宝睡眠时间不规律怎么办？',
    '如何判断宝宝是否吃饱了？',
    '宝宝发烧时应该怎么处理？',
    '什么时候可以给宝宝喝水？',
  ]);

  // 聊天API Hook
  const { sendMessage: sendMessageAPI } = useChatAPI();

  // 聊天编排器 - 核心业务逻辑
  const chatOrchestrator = useChatOrchestrator({
    onMessageSent: (message) => {
      console.log('📤 消息发送:', message.content);
      onMessageSent?.(message.content);
    },

    onMessageReceived: (message) => {
      console.log('📥 消息接收:', message.content);
      onMessageReceived?.(message.content);
    },

    onError: (error) => {
      console.error('💥 聊天错误:', error);
      onError?.(error);
    },

    onStreamingStart: () => {
      console.log('🌊 开始流式接收');
    },

    onStreamingComplete: (content) => {
      console.log('✅ 流式接收完成:', content.length, '字符');
    },
  });

  /**
   * 发送消息的业务逻辑
   */
  const handleSendMessage = useCallback(
    async (content: string) => {
      console.log('🎯 发送消息:', { content, childId });

      try {
        // 使用聊天编排器发送消息
        await chatOrchestrator.sendMessage(
          content,
          (messageContent, onStream) => {
            // 调用API发送消息并处理流式响应
            return sendMessageAPI({
              content: messageContent,
              childId: childId || null,
              onStream,
            });
          },
        );
      } catch (error) {
        console.error('发送消息失败:', error);
        throw error; // 让编排器处理错误
      }
    },
    [chatOrchestrator, sendMessageAPI, childId],
  );

  /**
   * 处理消息反馈
   */
  const handleMessageFeedback = useCallback(
    (messageId: string, feedback: 'helpful' | 'not-helpful' | undefined) => {
      console.log('👍 消息反馈:', { messageId, feedback });
      chatOrchestrator.updateMessageFeedback(messageId, feedback);
    },
    [chatOrchestrator],
  );

  /**
   * 重试失败的消息
   */
  const handleRetry = useCallback(() => {
    console.log('🔄 重试消息');
    chatOrchestrator.retryLastMessage();
  }, [chatOrchestrator]);

  /**
   * 清除错误状态
   */
  const handleClearError = useCallback(() => {
    console.log('🧹 清除错误');
    chatOrchestrator.clearError();
  }, [chatOrchestrator]);

  /**
   * 动态更新智能建议
   */
  const updateSuggestions = useCallback((inputValue: string) => {
    // 这里可以根据输入内容动态生成建议
    // 暂时使用静态建议
    if (inputValue.length > 2) {
      const filteredSuggestions = [
        '我的宝宝几个月可以添加辅食？',
        '宝宝睡眠时间不规律怎么办？',
        '如何判断宝宝是否吃饱了？',
        '宝宝发烧时应该怎么处理？',
        '什么时候可以给宝宝喝水？',
      ].filter((suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()),
      );

      setSuggestions(filteredSuggestions);
    }
  }, []);

  /**
   * 组件挂载时的初始化
   */
  useEffect(() => {
    console.log('🏢 ChatContainer 初始化:', { childId });

    // 可以在这里加载历史消息等初始化操作
    return () => {
      console.log('🏢 ChatContainer 清理');
    };
  }, [childId]);

  /**
   * 错误状态处理
   */
  useEffect(() => {
    if (chatOrchestrator.error) {
      console.error('🚨 聊天容器检测到错误:', chatOrchestrator.error);
    }
  }, [chatOrchestrator.error]);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* 消息列表区域 */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={chatOrchestrator.messages}
          loading={chatOrchestrator.isLoading}
          error={chatOrchestrator.error}
          onFeedback={handleMessageFeedback}
          onRetry={handleRetry}
          autoScroll={true}
          showTimestamp={true}
          showFeedback={true}
        />
      </div>

      {/* 错误提示条 */}
      {chatOrchestrator.error && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-red-500">⚠️</div>
              <span className="text-sm text-red-700">
                {chatOrchestrator.error.message || '发生未知错误'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRetry}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                重试
              </button>
              <button
                onClick={handleClearError}
                className="text-sm text-red-400 hover:text-red-600"
              >
                忽略
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 流式状态指示器 */}
      {chatOrchestrator.isStreaming && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-blue-700">AI正在思考中...</span>
            <div className="text-xs text-blue-500">
              已接收 {chatOrchestrator.currentStreamingContent.length} 字符
            </div>
          </div>
        </div>
      )}

      {/* 消息输入区域 */}
      <SmartMessageInput
        onSend={handleSendMessage}
        onChange={updateSuggestions}
        disabled={chatOrchestrator.isLoading}
        loading={chatOrchestrator.isStreaming}
        suggestions={suggestions}
        maxLength={1000}
        minRows={1}
        maxRows={4}
        showCounter={true}
        showSuggestions={true}
        enableShortcuts={true}
        placeholder="询问AI助手关于育儿的问题... (⌘+Enter发送)"
      />
    </div>
  );
};
