import { useState, useEffect, useCallback, useRef, RefObject } from 'react';
import { useChatOrchestrator } from './core/useChatOrchestrator';
import { chat } from '@/api/chat';
import type { ChatRequestDto } from '@/types/models';
import { useLocation } from 'react-router-dom';
import { getChatSuggestions } from '@/api/chat';
import { isEmptyMessage } from '../utils/messageUtils';
import type { MessageListRef } from '../components/MessageList';

interface UseChatContainerOptions {
  childId?: number | null;
  initialConversationId?: number | null;
  messageListRef?: RefObject<MessageListRef | null>;
}

export const useChatContainer = ({
  childId,
  initialConversationId,
  messageListRef,
}: UseChatContainerOptions) => {
  // 状态管理
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const historyLoadedRef = useRef<boolean>(false);

  // 滚动控制 - 优先使用传入的messageListRef
  const scrollToBottom = useCallback(() => {
    if (messageListRef?.current) {
      messageListRef.current.scrollToBottom(true);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageListRef]);

  const scrollToBottomInstantly = useCallback(() => {
    if (messageListRef?.current) {
      messageListRef.current.scrollToBottomInstantly();
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messageListRef]);

  // 聊天编排器
  const chatOrchestrator = useChatOrchestrator({
    childId: childId || null,
    conversationId: initialConversationId || null,
    onMessageSent: () => {
      setInputValue('');
      setTimeout(scrollToBottom, 100);
    },
    onMessageReceived: (message) => {
      setTimeout(scrollToBottom, 100);
      if (document.hidden && message.content.length > 0) {
        console.debug('💬 收到新消息，页面不在前台');
      }
    },
    onError: (error) => {
      console.error('💥 聊天错误:', error);
    },
    onStreamingStart: () => {
      console.log('🌊 开始流式接收');
    },
    onStreamingComplete: (content) => {
      console.log('✅ 流式接收完成:', content.length, '字符');
      setTimeout(scrollToBottom, 100);
      if (content.length > 1000) {
        console.debug('📄 收到长消息，内容长度:', content.length);
      }
    },
    onConversationCreated: (conversationId) => {
      console.log('🆕 会话创建成功:', conversationId);
    },
  });

  // API调用
  const sendMessageAPI = useCallback(
    async (params: {
      content: string;
      childId: number | null;
      conversationId?: number | null;
      onStream?: (chunk: string) => void;
    }) => {
      const { content, childId, conversationId, onStream } = params;

      try {
        const requestData: ChatRequestDto = {
          message: content.trim(),
          childId: childId || undefined,
          conversationId: conversationId || undefined,
        };

        const response = await chat(requestData, onStream);
        return response.content || '';
      } catch (error) {
        console.error('❌ API请求失败:', error);
        throw new Error('发送消息失败，请稍后重试');
      }
    },
    [],
  );

  // URL参数处理
  useEffect(() => {
    if (hasInitialized) return;

    const query = new URLSearchParams(location.search);
    const question = query.get('question');

    if (question) {
      setInputValue(question);
      setHasInitialized(true);
    }
  }, [location.search, hasInitialized]);

  // 🔄 历史消息加载状态 - 关键改进点
  useEffect(() => {
    if (chatOrchestrator.isLoadingHistory) {
      // 开始加载历史消息
      historyLoadedRef.current = false;
      console.debug('📚 开始加载历史消息，暂停自动滚动');
    } else if (!historyLoadedRef.current) {
      // 历史消息加载完成
      historyLoadedRef.current = true;
      if (chatOrchestrator.messages.length > 0) {
        // 立即滚动到底部，不使用动画
        console.debug('📚 历史消息加载完成，立即定位到底部');
        setTimeout(() => {
          scrollToBottomInstantly();
        }, 50); // 稍微延迟确保DOM更新完成
      }
    }
  }, [
    chatOrchestrator.isLoadingHistory,
    chatOrchestrator.messages.length,
    scrollToBottomInstantly,
  ]);

  // 🔄 移除原有的消息更新滚动逻辑，让MessageList组件自己控制
  // 这样可以避免重复滚动和滚动冲突

  // 会话切换重置
  useEffect(() => {
    console.debug('🔄 会话ID变化，重置聊天状态:', {
      newConversationId: initialConversationId,
      previousMessageCount: chatOrchestrator.messages.length,
    });

    historyLoadedRef.current = false;

    if (chatOrchestrator.messages.length > 0) {
      chatOrchestrator.clearMessages();
    }

    setInputValue('');
    setHasInitialized(false);

    const query = new URLSearchParams(location.search);
    const question = query.get('question');
    if (question) {
      setInputValue(question);
      setHasInitialized(true);
    }
  }, [initialConversationId]);

  // 获取智能建议
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const suggestionsData = await getChatSuggestions(childId as number);
        setSuggestions(suggestionsData || []);
      } catch (error) {
        console.error('获取聊天建议失败:', error);
        setSuggestions([
          '宝宝发烧怎么办？',
          '如何判断宝宝是否缺乏营养？',
          '宝宝哭闹不停怎么安抚？',
          '宝宝睡眠不规律怎么调整？',
        ]);
      }
    };

    // 只有当childId存在且为number类型时才加载建议
    if (childId && typeof childId === 'number') {
      loadSuggestions();
    } else {
      // 没有childId时设置默认建议
      setSuggestions([
        '宝宝发烧怎么办？',
        '如何判断宝宝是否缺乏营养？',
        '宝宝哭闹不停怎么安抚？',
        '宝宝睡眠不规律怎么调整？',
      ]);
    }
  }, [childId]);

  // 事件处理器
  const handleSend = useCallback(async () => {
    if (isEmptyMessage(inputValue) || chatOrchestrator.isStreaming) return;

    const content = inputValue.trim();
    setInputValue('');

    try {
      await chatOrchestrator.sendMessage(
        content,
        (
          messageContent: string,
          onStream: (chunk: string) => void,
          conversationId?: number | null,
        ) => {
          return sendMessageAPI({
            content: messageContent,
            childId: childId || null,
            conversationId,
            onStream,
          });
        },
      );
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  }, [inputValue, chatOrchestrator, sendMessageAPI, childId]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleMessageFeedback = useCallback(
    (messageId: string, feedback: 'helpful' | 'not-helpful' | undefined) => {
      console.log('👍 消息反馈:', { messageId, feedback });
      chatOrchestrator.updateMessageFeedback(messageId, feedback);
    },
    [chatOrchestrator],
  );

  return {
    chatOrchestrator,
    inputValue,
    setInputValue,
    suggestions,
    messagesEndRef,
    handleSend,
    handleSuggestionClick,
    handleKeyPress,
    handleMessageFeedback,
    sendMessageAPI,
  };
};
