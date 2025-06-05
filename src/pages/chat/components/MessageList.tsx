import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChatMessage } from '../hooks/core/useMessageManager';
import { MessageFeedback } from './MessageFeedback';
import { formatMessageTime } from '../utils/messageUtils';
import { MarkdownRenderer } from '../../../components/ui/data-display/MarkdownRenderer';
import { Icon } from '@iconify/react';

interface MessageListProps {
  messages: ChatMessage[];
  onMessageFeedback: (
    messageId: string,
    feedback: 'helpful' | 'not-helpful' | undefined,
  ) => void;
  isLoadingHistory?: boolean;
  autoScrollToBottom?: boolean;
}

export interface MessageListRef {
  scrollToBottom: (smooth?: boolean) => void;
  scrollToBottomInstantly: () => void;
}

// 智能头像显示逻辑
const shouldShowAvatar = (
  currentMessage: ChatMessage,
  previousMessage: ChatMessage | undefined,
): boolean => {
  if (!previousMessage) return true;

  // 不同发送者，显示头像
  if (currentMessage.isUser !== previousMessage.isUser) return true;

  // 时间间隔超过5分钟，显示头像
  const currentTime = new Date(currentMessage.timestamp).getTime();
  const previousTime = new Date(previousMessage.timestamp).getTime();
  const timeDiff = currentTime - previousTime;
  if (timeDiff > 5 * 60 * 1000) return true;

  return false;
};

export const MessageList = forwardRef<MessageListRef, MessageListProps>(
  (
    {
      messages,
      onMessageFeedback,
      isLoadingHistory = false,
      autoScrollToBottom = true,
    },
    ref,
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (smooth: boolean = true) => {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? 'smooth' : 'instant',
      });
    };

    const scrollToBottomInstantly = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    };

    useImperativeHandle(ref, () => ({
      scrollToBottom,
      scrollToBottomInstantly,
    }));

    useEffect(() => {
      if (!autoScrollToBottom) {
        return;
      }

      if (isLoadingHistory) {
        return;
      }

      console.debug('📜 新消息更新，执行平滑滚动');
      scrollToBottom(true);
    }, [messages, isLoadingHistory, autoScrollToBottom]);

    return (
      <>
        <div className="pb-6 space-y-2 md:space-y-4 px-2 md:px-4">
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const showAvatar = shouldShowAvatar(message, previousMessage);

            return (
              <div
                key={message.id}
                className={`message-container animate-slideInUp ${
                  showAvatar ? 'mt-4 md:mt-6' : 'mt-1 md:mt-2'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* 头像和发送者信息行 - 智能显示 */}
                {showAvatar && (
                  <div
                    className={`flex items-center mb-2 ${
                      message.isUser ? 'justify-end' : 'justify-start'
                    } px-2`}
                  >
                    {!message.isUser && (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#5BA3F5] to-[#8CC8FF] flex items-center justify-center shadow-md ring-1 ring-white">
                        <Icon
                          icon="ph:robot-fill"
                          className="text-white text-sm md:text-lg"
                        />
                      </div>
                    )}
                    {message.isUser && (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#F8BBD0] to-[#FFDCE8] flex items-center justify-center shadow-md ring-1 ring-white">
                        <Icon
                          icon="ph:user-fill"
                          className="text-white text-sm md:text-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 消息气泡行 - 使用更大宽度 */}
                <div
                  className={`flex ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`relative ${
                      message.isUser
                        ? 'w-[95%] md:w-[85%] max-w-[600px]'
                        : 'w-[95%] md:w-[85%] max-w-[600px]'
                    } ${message.isUser ? 'message-user' : 'message-ai'}`}
                  >
                    {/* 消息气泡 */}
                    <div
                      className={`message-bubble relative overflow-hidden ${
                        message.isUser
                          ? 'ai-message-user bg-gradient-to-br from-[#FFB38A] via-[#FFC9A8] to-[#FFDA91] text-white shadow-lg'
                          : 'ai-message-assistant'
                      }`}
                      style={
                        message.isUser
                          ? {}
                          : {
                              background:
                                'linear-gradient(135deg, #FFFFFF 0%, #FFF8F4 30%, #FFEFEF 100%) !important',
                              color: '#555555 !important',
                              border:
                                '1px solid rgba(255, 179, 138, 0.2) !important',
                              boxShadow:
                                '0 4px 16px rgba(248, 187, 208, 0.15) !important',
                            }
                      }
                    >
                      {/* 用户消息的装饰元素 */}
                      {message.isUser && (
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                          <div className="absolute top-[-8px] right-[-8px] w-8 h-8 bg-white rounded-full"></div>
                          <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      )}

                      {/* AI消息的装饰波纹 */}
                      {!message.isUser && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFB38A]/20 via-[#F8BBD0]/25 to-transparent"></div>
                      )}

                      {message.content ? (
                        <div
                          className={`text-[15px] leading-relaxed relative z-10 ${
                            message.isUser ? 'font-medium' : ''
                          }`}
                        >
                          {message.isUser ? (
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          ) : (
                            <MarkdownRenderer content={message.content} />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-2">
                          <div className="typing-indicator">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                          </div>
                          <span className="ml-3 text-sm text-gray-500 font-medium">
                            正在思考中...
                          </span>
                        </div>
                      )}

                      {/* AI消息的反馈组件 */}
                      {!message.isUser && message.content && (
                        <div className="mt-3 pt-3 border-t border-gray-100/50">
                          <MessageFeedback
                            messageId={message.id}
                            chatHistoryId={message.chatHistoryId}
                            initialFeedback={message.feedback}
                            onFeedbackChange={(feedback) => {
                              onMessageFeedback(message.id, feedback);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* 时间戳 */}
                    {message.content && (
                      <div
                        className={`text-xs text-gray-400 mt-2 flex items-center ${
                          message.isUser ? 'justify-end mr-2' : 'ml-2'
                        }`}
                      >
                        <Icon
                          icon="ph:clock"
                          className="mr-1 text-gray-400"
                          width={12}
                          height={12}
                        />
                        {formatMessageTime(message.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={messagesEndRef} />

        <style>{`
          .message-bubble {
            padding: 12px 16px;
            border-radius: 16px;
            position: relative;
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          @media (min-width: 768px) {
            .message-bubble {
              padding: 16px 20px;
              border-radius: 20px;
            }
          }

          .ai-message-assistant {
            background: linear-gradient(135deg, #FFFFFF 0%, #FFF8F4 30%, #FFEFEF 100%) !important;
            color: #555555 !important;
            border: 1px solid rgba(255, 179, 138, 0.2) !important;
            box-shadow: 0 4px 16px rgba(248, 187, 208, 0.15) !important;
          }

          .ai-message-assistant * {
            color: #555555 !important;
          }

          .ai-message-assistant h1,
          .ai-message-assistant h2,
          .ai-message-assistant h3,
          .ai-message-assistant h4,
          .ai-message-assistant h5,
          .ai-message-assistant h6 {
            color: #444444 !important;
          }

          .ai-message-assistant p,
          .ai-message-assistant li,
          .ai-message-assistant td,
          .ai-message-assistant span,
          .ai-message-assistant div {
            color: #555555 !important;
          }

          .ai-message-assistant a {
            color: #FF9F73 !important;
          }

          .ai-message-assistant code {
            background: rgba(255, 179, 138, 0.1) !important;
            color: #333333 !important;
          }

          @media (hover: hover) and (pointer: fine) {
            .message-bubble:hover {
              transform: translateY(-1px);
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
          }

          .message-user .message-bubble {
            border-bottom-right-radius: 6px;
            box-shadow: 0 4px 20px rgba(255, 179, 138, 0.3);
          }

          .message-ai .message-bubble {
            border-bottom-left-radius: 6px;
            box-shadow: 0 4px 20px rgba(248, 187, 208, 0.12);
          }

          /* 打字机效果 */
          .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: linear-gradient(45deg, #FFB38A, #F8BBD0);
            animation: typingPulse 1.5s infinite ease-in-out;
          }

          .typing-dot:nth-child(1) {
            animation-delay: 0s;
          }

          .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes typingPulse {
            0%, 60%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            30% {
              transform: scale(1.2);
              opacity: 1;
            }
          }

          /* 消息入场动画 */
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-slideInUp {
            animation: slideInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }

          /* 消息容器悬浮效果 */
          .message-container {
            transition: all 0.2s ease;
          }

          @media (hover: hover) and (pointer: fine) {
            .message-container:hover .message-bubble {
              transform: translateY(-2px);
            }
          }

          /* 渐变边框效果 */
          .message-ai .message-bubble::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 16px;
            border-bottom-left-radius: 6px;
            padding: 1px;
            background: linear-gradient(135deg, #FFB38A, #F8BBD0, transparent);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          @media (min-width: 768px) {
            .message-ai .message-bubble::before {
              border-radius: 20px;
            }
          }

          @media (hover: hover) and (pointer: fine) {
            .message-container:hover .message-ai .message-bubble::before {
              opacity: 0.3;
            }
          }

          /* 响应式设计 */
          @media (max-width: 480px) {
            .message-bubble {
              padding: 10px 14px;
              border-radius: 14px;
            }
            
            .message-user .message-bubble {
              border-bottom-right-radius: 4px;
            }
            
            .message-ai .message-bubble {
              border-bottom-left-radius: 4px;
            }
          }

          /* 深色模式支持 - 保持温馨配色 */
          @media (prefers-color-scheme: dark) {
            .ai-message-assistant {
              background: linear-gradient(135deg, #FFF8F4, #FFEFEF, #FFE8E8) !important;
              color: #555555 !important;
              border-color: rgba(255, 179, 138, 0.3) !important;
              box-shadow: 0 4px 16px rgba(248, 187, 208, 0.2) !important;
            }
          }
        `}</style>
      </>
    );
  },
);

MessageList.displayName = 'MessageList';
