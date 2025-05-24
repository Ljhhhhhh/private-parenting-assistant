import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatContainerProps } from '../types/chat';
import {
  useChatRuntime,
  useSendMessage,
  useLoadMessages,
} from '../hooks/useChatRuntime';
import { useStreamingChat } from '../hooks/useStreamingMessage';
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
 * 集成聊天运行时、消息显示、输入功能和智能建议
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({
  childId,
  initialConversationId,
}) => {
  // 聊天运行时
  const runtime = useChatRuntime({
    conversationId: initialConversationId || null,
    childId,
  });

  const sendMessage = useSendMessage(runtime);
  const loadMessages = useLoadMessages(runtime);

  // 流式消息处理
  const streamingChat = useStreamingChat();

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

  // 加载消息历史
  useEffect(() => {
    if (!runtime || streamingChat.messages.length > 0) return;

    const loadHistory = async () => {
      try {
        const historyData = await loadMessages();

        // 转换为UI消息格式
        const historyMessages = historyData.map(convertApiMessageToUI);

        // 按时间排序
        historyMessages.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        );

        streamingChat.setMessageList(historyMessages);
      } catch (error) {
        console.error('加载消息历史失败:', error);
      }
    };

    loadHistory();
  }, [
    runtime,
    loadMessages,
    streamingChat.messages.length,
    streamingChat.setMessageList,
  ]);

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
  }, [streamingChat.messages, scrollToBottom]);

  // 发送消息
  const handleSend = useCallback(async () => {
    if (isEmptyMessage(inputValue) || streamingChat.isStreaming || !runtime)
      return;

    const content = inputValue.trim();
    setInputValue('');

    try {
      // 使用流式聊天Hook发送消息
      await streamingChat.sendMessage(content, (messageContent, onStream) => {
        console.debug('🚀 ChatContainer调用sendMessage:', { messageContent });
        return sendMessage(messageContent, onStream);
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      // 错误处理由streamingChat内部处理
    }
  }, [inputValue, streamingChat, runtime, sendMessage]);

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
      {/* 消息区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-4 py-5 overflow-y-auto">
          {streamingChat.messages.length === 0 ? (
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
              {streamingChat.messages.map((message) => (
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
                      {!message.isUser && message.content && (
                        <MessageFeedback
                          messageId={message.id}
                          chatHistoryId={message.chatHistoryId}
                          initialFeedback={message.feedback}
                          onFeedbackChange={(feedback) => {
                            streamingChat.updateMessageFeedback(
                              message.id,
                              feedback,
                            );
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
              disabled={streamingChat.isStreaming}
            />
          </div>

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={isEmptyMessage(inputValue) || streamingChat.isStreaming}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isEmptyMessage(inputValue) || streamingChat.isStreaming
                ? 'bg-[#E0E0E0] text-white cursor-not-allowed'
                : 'bg-gradient-to-br from-[#FFB38A] to-[#FFC9A8] text-white shadow-sm hover:shadow-md active:scale-95 relative overflow-hidden group'
            }`}
          >
            {streamingChat.isStreaming ? (
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
