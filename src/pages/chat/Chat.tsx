import React, { useState, useRef, useEffect } from 'react';
import { NavBar, Input, Button } from '@/components/ui';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChildrenStore } from '@/stores/children';
import { chat, getChatSuggestions } from '@/api/chat';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <NavBar title="智能问答" onBack={() => navigate(-1)} />

      {/* 消息区域 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="mb-4 text-lg">有什么育儿问题，请随时向我提问</p>
            <div className="w-full max-w-md">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="mb-3 p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="text-base">{suggestion}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.isUser ? 'flex justify-end' : 'flex justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isUser
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {message.content || (
                  <div className="flex items-center justify-center h-6">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse mx-0.5"></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse mx-0.5"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse mx-0.5"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="请输入您的问题..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 mr-2"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
