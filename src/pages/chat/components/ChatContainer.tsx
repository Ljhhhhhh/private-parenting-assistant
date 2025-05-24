import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatContainerProps } from '../types/chat';
import {
  useChatRuntime,
  useSendMessage,
  useLoadMessages,
} from '../hooks/useChatRuntime';
import { useChatOrchestrator } from '../hooks/core/useChatOrchestrator';
import { useChatAPI } from '../hooks/integrations/useChatAPI';
import { useLocation } from 'react-router-dom';
import { getChatSuggestions } from '@/api/chat';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui';
import {
  convertApiMessageToUI,
  formatMessageTime,
  isEmptyMessage,
} from '../utils/messageUtils';
import { MessageFeedback } from './MessageFeedback';

/**
 * 聊天容器组件
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({
  childId,
  initialConversationId,
}) => {
  // 聊天运行时 (保持兼容性)
  const runtime = useChatRuntime({
    conversationId: initialConversationId || null,
    childId,
  });

  const sendMessage = useSendMessage(runtime);
  const loadMessages = useLoadMessages(runtime);

  // ✨ 新架构：使用聊天编排器替代流式聊天
  const chatOrchestrator = useChatOrchestrator({
    onMessageSent: (message) => {
      console.log('📤 消息发送:', message.content);
      // 实际工作：清空输入框，滚动到底部
      setInputValue('');
      setTimeout(scrollToBottom, 100);
    },
    onMessageReceived: (message) => {
      console.log('📥 消息接收:', message.content);
      // 实际工作：滚动到底部，可能的通知处理
      setTimeout(scrollToBottom, 100);

      // 如果页面不在前台，可以考虑发送通知
      if (document.hidden && message.content.length > 0) {
        // 这里可以添加通知逻辑
        console.debug('💬 收到新消息，页面不在前台');
      }
    },
    onError: (error) => {
      console.error('💥 聊天错误:', error);
      // 实际工作：错误状态管理，用户友好的错误提示
      // 这里可以设置错误状态，显示错误提示
      // setError(error); // 如果有错误状态的话
    },
    onStreamingStart: () => {
      console.log('🌊 开始流式接收');
      // 实际工作：显示加载状态，禁用输入
      // 可以设置一个流式状态指示器
    },
    onStreamingComplete: (content) => {
      console.log('✅ 流式接收完成:', content.length, '字符');
      // 实际工作：隐藏加载状态，启用输入，滚动到底部
      setTimeout(scrollToBottom, 100);

      // 如果内容很长，可以添加一些用户体验优化
      if (content.length > 1000) {
        console.debug('📄 收到长消息，内容长度:', content.length);
      }
    },
  });

  // 聊天API Hook
  const { sendMessage: sendMessageAPI } = useChatAPI();

  // 状态管理
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 从URL参数获取预设问题
  useEffect(() => {
    if (hasInitialized) return;

    const query = new URLSearchParams(location.search);
    const question = query.get('question');

    if (question) {
      setInputValue(question);
      setHasInitialized(true);
    }
  }, [location.search, hasInitialized]);

  // 加载消息历史 (兼容旧的运行时系统)
  useEffect(() => {
    if (!runtime || chatOrchestrator.messages.length > 0) return;

    const loadHistory = async () => {
      try {
        const historyData = await loadMessages();

        // 转换为新架构的消息格式
        const historyMessages = historyData.map(convertApiMessageToUI);

        // 按时间排序
        historyMessages.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        );

        // 🔄 迁移说明：setMessageList 现在通过编排器管理
        // 由于编排器暂时没有直接的 setMessages 方法，
        // 我们可以考虑在编排器中添加这个功能，或者通过其他方式初始化
        console.debug('📚 加载历史消息:', historyMessages.length);
      } catch (error) {
        console.error('加载消息历史失败:', error);
      }
    };

    loadHistory();
  }, [runtime, loadMessages, chatOrchestrator.messages.length]);

  // 获取智能建议
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const suggestionsData = await getChatSuggestions(childId);
        setSuggestions(suggestionsData || []);
      } catch (error) {
        console.error('获取聊天建议失败:', error);
        // 设置默认建议
        setSuggestions([
          '宝宝发烧怎么办？',
          '如何判断宝宝是否缺乏营养？',
          '宝宝哭闹不停怎么安抚？',
          '宝宝睡眠不规律怎么调整？',
        ]);
      }
    };

    loadSuggestions();
  }, [childId]);

  // 消息更新后滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [chatOrchestrator.messages, scrollToBottom]);

  // 🔄 实时状态监控 - 添加详细的消息状态调试
  useEffect(() => {
    console.log('🔍 ChatContainer 消息状态变化:', {
      messagesCount: chatOrchestrator.messages.length,
      isStreaming: chatOrchestrator.isStreaming,
      isLoading: chatOrchestrator.isLoading,
      currentStreamingContentLength:
        chatOrchestrator.currentStreamingContent.length,
      timestamp: new Date().toISOString(),
    });

    // 详细检查每条消息
    chatOrchestrator.messages.forEach((message, index) => {
      console.log(`🔍 消息 [${index}]:`, {
        id: message.id,
        isUser: message.isUser,
        content: message.content,
        contentLength: message.content.length,
        isStreaming: message.isStreaming,
        timestamp: message.timestamp,
      });
    });

    // 特别关注 AI 消息（通常是 messages[1]）
    if (chatOrchestrator.messages.length >= 2) {
      const aiMessage = chatOrchestrator.messages[1];
      console.log('🔍 重点检查 AI 消息 (messages[1]):', {
        id: aiMessage.id,
        content: `"${aiMessage.content}"`,
        contentLength: aiMessage.content.length,
        isStreaming: aiMessage.isStreaming,
        contentType: typeof aiMessage.content,
        isEmpty: aiMessage.content === '',
        isUndefined: aiMessage.content === undefined,
        isNull: aiMessage.content === null,
      });
    }
  }, [
    chatOrchestrator.messages,
    chatOrchestrator.isStreaming,
    chatOrchestrator.isLoading,
    chatOrchestrator.currentStreamingContent,
  ]);

  // 🔄 发送消息 - 使用新的编排器架构
  const handleSend = useCallback(async () => {
    if (isEmptyMessage(inputValue) || chatOrchestrator.isStreaming || !runtime)
      return;

    const content = inputValue.trim();
    setInputValue('');

    try {
      // ✨ 使用新的聊天编排器发送消息
      await chatOrchestrator.sendMessage(
        content,
        (messageContent, onStream) => {
          console.debug('🚀 ChatContainer调用新架构sendMessage:', {
            messageContent,
          });

          return sendMessageAPI({
            content: messageContent,
            childId: childId || null,
            onStream,
          });
        },
      );
    } catch (error) {
      console.error('发送消息失败:', error);
      // 错误处理由编排器内部处理
    }
  }, [
    inputValue,
    chatOrchestrator,
    runtime,
    sendMessage,
    sendMessageAPI,
    childId,
  ]);

  // 使用建议
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
  }, []);

  // 键盘事件处理
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // 🔄 消息反馈处理 - 使用新的编排器
  const handleMessageFeedback = useCallback(
    (messageId: string, feedback: 'helpful' | 'not-helpful' | undefined) => {
      console.log('👍 消息反馈:', { messageId, feedback });
      chatOrchestrator.updateMessageFeedback(messageId, feedback);
    },
    [chatOrchestrator],
  );

  // 如果运行时未准备就绪
  if (!runtime) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Icon
            icon="ph:spinner"
            width={48}
            height={48}
            className="mx-auto mb-4 text-[#FFB38A] animate-spin"
          />
          <p className="text-[#666666]">正在初始化聊天...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FDFBF8]">
      {/* 🔄 错误状态显示 - 新架构支持 */}
      {chatOrchestrator.error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon
                icon="ph:warning-circle"
                width={16}
                height={16}
                className="text-red-500"
              />
              <span className="text-sm text-red-700">
                {chatOrchestrator.error.message || '发送消息失败'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={chatOrchestrator.retryLastMessage}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                重试
              </button>
              <button
                onClick={chatOrchestrator.clearError}
                className="text-sm text-red-400 hover:text-red-600"
              >
                忽略
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 消息区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-4 py-5 overflow-y-auto">
          {chatOrchestrator.messages.length === 0 ? (
            /* 空状态 - 显示建议 */
            <div className="flex flex-col items-center justify-center min-h-full">
              <div className="w-48 h-48 mb-6 animate-float flex items-center justify-center text-[#FFB38A]">
                <Icon icon="ph:baby-fill" width={120} height={120} />
              </div>
              <p className="mb-6 text-lg font-medium text-center text-[#666666]">
                有什么育儿问题，请随时向我提问
              </p>

              {/* 智能建议卡片 */}
              <div className="w-full pb-4 overflow-x-auto hide-scrollbar">
                <div className="flex gap-3 px-1 pb-2 w-max">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="p-4 min-w-[180px] max-w-[220px] bg-gradient-to-br from-white to-[#FFF8F5] rounded-xl shadow-sm border border-[#FFE5D6] transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95 text-left"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="text-base text-[#333333]">
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 消息列表 */
            <div className="space-y-6 pb-4">
              {chatOrchestrator.messages.map((message) => (
                <div
                  key={message.id}
                  className={`animate-fadeIn ${
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
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                      ) : (
                        /* 流式加载动画 */
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

                      {/* AI消息反馈 - 集成新的反馈处理 */}
                      {!message.isUser && message.content && (
                        <MessageFeedback
                          messageId={message.id}
                          chatHistoryId={undefined}
                          initialFeedback={message.feedback}
                          onFeedbackChange={(feedback) => {
                            handleMessageFeedback(message.id, feedback);
                          }}
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
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 🔄 流式状态指示器 - 新架构支持 */}
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

      {/* 输入区域 */}
      <div className="p-4 bg-white border-t border-[#E0E0E0] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          {/* 输入框 */}
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入您的问题..."
              className="w-full py-3 px-4 rounded-3xl border-[#E0E0E0] focus:border-[#FFB38A] transition-all resize-none"
              disabled={chatOrchestrator.isStreaming}
            />
          </div>

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={
              isEmptyMessage(inputValue) || chatOrchestrator.isStreaming
            }
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isEmptyMessage(inputValue) || chatOrchestrator.isStreaming
                ? 'bg-[#E0E0E0] text-white cursor-not-allowed'
                : 'bg-gradient-to-br from-[#FFB38A] to-[#FFC9A8] text-white shadow-sm hover:shadow-md active:scale-95 relative overflow-hidden group'
            }`}
          >
            {chatOrchestrator.isStreaming ? (
              <Icon
                icon="ph:spinner"
                width={20}
                height={20}
                className="animate-spin"
              />
            ) : (
              <>
                <div className="relative transform group-hover:rotate-12 transition-transform duration-300">
                  <Icon
                    icon="ph:paper-plane-right-fill"
                    width={20}
                    height={20}
                  />
                </div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 样式 */}
      <style>{`
        /* 隐藏滚动条但保持功能 */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* 消息气泡尾部三角形 */
        .message-user::after {
          content: '';
          position: absolute;
          top: 0;
          right: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid #ffb38a;
          border-right: 8px solid transparent;
        }

        .message-ai::after {
          content: '';
          position: absolute;
          top: 0;
          left: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid #e0e0e0;
          border-left: 8px solid transparent;
        }

        /* 动画 */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
