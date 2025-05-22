import React, { useState, useRef, useEffect } from 'react';
import { NavBar, Input } from '@/components/ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChildrenStore } from '@/stores/children';
import {
  chat,
  getChatSuggestions,
  provideChatFeedback,
  getChatHistory,
} from '@/api/chat';
import { Icon } from '@iconify/react';
import { ChatFeedbackDto } from '@/types/models';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentChild } = useChildrenStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 从URL参数中获取预设问题
  useEffect(() => {
    if (hasInitialized) return;

    const query = new URLSearchParams(location.search);
    const question = query.get('question');

    if (question) {
      setInputValue(question);
      setHasInitialized(true);
    }
  }, [location.search, hasInitialized]);

  // 获取当前儿童的聊天历史记录
  useEffect(() => {
    console.log('currentChild', currentChild);
    // TODO: 消息解析、列表滚动、选择儿童时存储到localstorage、首页咨询按钮修改
    if (currentChild?.id) {
      setIsLoading(true);
      getChatHistory(currentChild.id, 20, 0)
        .then((data) => {
          if (data && Array.isArray(data)) {
            // 将API返回的聊天记录转换为消息数组
            const historyMessages: Message[] = [];

            data.forEach((item) => {
              // 添加用户问题
              historyMessages.push({
                id: `user-${item.id}`,
                content: item.message,
                isUser: true,
                timestamp: new Date(item.createdAt),
              });

              // 添加AI回复
              historyMessages.push({
                id: `${item.id}`,
                content: item.response,
                isUser: false,
                timestamp: new Date(item.createdAt),
                feedback: item.feedback
                  ? item.feedback.isHelpful
                    ? 'helpful'
                    : 'not-helpful'
                  : undefined,
              });
            });

            // 按时间排序
            historyMessages.sort(
              (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
            );

            setMessages(historyMessages);
          }
        })
        .catch((error) => {
          console.error('获取聊天历史失败:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [currentChild?.id]);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 获取聊天建议
  useEffect(() => {
    if (currentChild?.id) {
      getChatSuggestions(currentChild.id)
        .then((data) => {
          setSuggestions(data);
        })
        .catch((error) => {
          console.error('获取聊天建议失败:', error);
          // 设置一些默认建议
          setSuggestions([
            '宝宝发烧怎么办？',
            '如何判断宝宝是否缺乏营养？',
            '宝宝哭闹不停怎么安抚？',
          ]);
        });
    }
  }, [currentChild]);

  // 消息发送后滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 创建一个临时的AI消息占位符
      const tempAiMessage: Message = {
        id: `temp-${Date.now()}`,
        content: '',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tempAiMessage]);

      // 调用API获取回复
      const response = await chat(
        {
          message: userMessage.content,
          childId: currentChild?.id,
        },
        (chunk) => {
          // 处理流式响应
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (!lastMessage.isUser) {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunk,
              };
              return updatedMessages;
            }
            return prev;
          });
        },
      );

      // 如果没有使用流式响应，则直接设置完整回复
      if (!response.type) {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (!lastMessage.isUser) {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: response.content || '抱歉，我现在无法回答这个问题。',
              id: response.chatId?.toString() || lastMessage.id,
            };
            return updatedMessages;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: '抱歉，发送消息失败，请稍后再试。',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 使用建议
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  // 处理反馈
  const handleFeedback = (messageId: string, isHelpful: boolean) => {
    // 更新消息状态以显示反馈
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            feedback: isHelpful ? 'helpful' : 'not-helpful',
          };
        }
        return msg;
      });
    });

    // 发送反馈到API
    // 注意：这里假设messageId可以转换为数字类型的chatHistoryId
    // 实际实现可能需要调整
    try {
      const chatHistoryId = parseInt(messageId.replace('temp-', ''));
      if (!isNaN(chatHistoryId)) {
        const feedbackData: ChatFeedbackDto = {
          chatHistoryId,
          isHelpful,
        };
        provideChatFeedback(feedbackData);
      }
    } catch (error) {
      console.error('发送反馈失败:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 导航栏：渐变背景、阴影 */}
      <div className="bg-gradient-to-r from-[#FFB38A] to-[#FFC9A8] shadow-sm">
        <NavBar
          title="智能问答"
          titleClassName="text-white font-medium text-xl"
          onBack={() => navigate(-1)}
        />
      </div>

      {/* 消息区域：优化内边距和滚动效果 */}
      <div className="flex-1 px-4 py-5 overflow-y-auto bg-[#FDFBF8]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {/* 添加温馨育儿插图 */}
            <div className="w-48 h-48 mb-6 animate-float flex items-center justify-center text-[#FFB38A]">
              <Icon icon="ph:baby-fill" width={120} height={120} />
            </div>
            <p className="mb-6 text-lg font-medium text-center text-[#666666]">
              有什么育儿问题，请随时向我提问
            </p>

            {/* 水平滚动推荐问题卡片 */}
            <div className="w-full pb-4 overflow-x-auto hide-scrollbar">
              <div className="flex gap-3 px-1 pb-2 w-max">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 min-w-[180px] max-w-[220px] bg-gradient-to-br from-white to-[#FFF8F5] rounded-xl shadow-sm cursor-pointer border border-[#FFE5D6] transition-transform duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="text-base text-[#333333]">{suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`animate-fadeIn ${
                  message.isUser ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                {/* 优化消息气泡设计 */}
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
                      <div className="text-[15px] leading-relaxed">
                        {message.content}
                      </div>
                    ) : (
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

                    {/* 添加反馈按钮 - 仅对AI回复显示 */}
                    {!message.isUser && message.content && (
                      <div className="mt-2 pt-2 border-t border-[#F0F0F0] flex justify-end space-x-2">
                        <button
                          onClick={() => handleFeedback(message.id, true)}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            message.feedback === 'helpful'
                              ? 'bg-[#66BB6A]/20 text-[#66BB6A] font-medium'
                              : 'text-[#999999] hover:bg-[#F5F5F5]'
                          }`}
                        >
                          <span className="flex items-center">
                            <Icon
                              icon="ph:thumbs-up"
                              className="mr-1"
                              width={14}
                              height={14}
                            />
                            有帮助
                          </span>
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, false)}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            message.feedback === 'not-helpful'
                              ? 'bg-[#EF5350]/20 text-[#EF5350] font-medium'
                              : 'text-[#999999] hover:bg-[#F5F5F5]'
                          }`}
                        >
                          <span className="flex items-center">
                            <Icon
                              icon="ph:thumbs-down"
                              className="mr-1"
                              width={14}
                              height={14}
                            />
                            无帮助
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                  {/* 添加时间戳 */}
                  {message.content && (
                    <div
                      className={`text-xs text-[#999999] mt-1 ${
                        message.isUser ? 'text-right mr-1' : 'ml-1'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center">
          {/* 圆角输入框 */}
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="请输入您的问题..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="w-full py-3 px-4 rounded-3xl border-[#E0E0E0] focus:border-[#FFB38A] transition-all"
            />
          </div>

          {/* 圆形发送按钮 - 创新设计 */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`flex-shrink-0 ml-3 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !inputValue.trim() || isLoading
                ? 'bg-[#E0E0E0] text-white cursor-not-allowed'
                : 'bg-gradient-to-br from-[#FFB38A] to-[#FFC9A8] text-white shadow-sm hover:shadow-md active:scale-95 relative overflow-hidden group'
            }`}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative z-10 transform group-hover:rotate-12 transition-transform duration-300">
              <Icon icon="ph:paper-plane-right-fill" width={20} height={20} />
            </div>
          </button>
        </div>
      </div>

      <style>{`
        /* 隐藏滚动条但保持功能 */
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        /* 消息气泡尾部三角形 */
        .message-user::after {
          content: '';
          position: absolute;
          top: 0;
          right: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid #FFB38A;
          border-right: 8px solid transparent;
        }
        
        .message-ai::after {
          content: '';
          position: absolute;
          top: 0;
          left: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid #E0E0E0;
          border-left: 8px solid transparent;
        }
        
        /* 渐入动画 */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* 轻微浮动动画 */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Chat;
