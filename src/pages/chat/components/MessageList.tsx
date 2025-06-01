import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChatMessage } from '../hooks/core/useMessageManager';
import { MessageFeedback } from './MessageFeedback';
import { formatMessageTime } from '../utils/messageUtils';

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
        <div className="pb-4 space-y-6">
          {messages.map((message) => (
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
                    <div className="flex justify-center items-center h-8">
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

                  {!message.isUser && message.content && (
                    <MessageFeedback
                      messageId={message.id}
                      chatHistoryId={message.chatHistoryId}
                      initialFeedback={message.feedback}
                      onFeedbackChange={(feedback) => {
                        onMessageFeedback(message.id, feedback);
                      }}
                    />
                  )}
                </div>

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

        <div ref={messagesEndRef} />

        <style>{`
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
      `}</style>
      </>
    );
  },
);

MessageList.displayName = 'MessageList';
