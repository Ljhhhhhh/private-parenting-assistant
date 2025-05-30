import React, { useRef } from 'react';
import { ChatContainerProps } from '../types/chat';
import { useChatContainer } from '../hooks/useChatContainer';
import { MessageList, MessageListRef } from './MessageList';
import { ChatInput } from './ChatInput';
import { ErrorBanner } from './ErrorBanner';
import { StreamingIndicator } from './StreamingIndicator';
import { WelcomeScreen } from './WelcomeScreen';

/**
 * 聊天容器组件 - 重构版
 * 专注于组件组合和布局，具体逻辑委托给子组件和Hook
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({
  childId,
  initialConversationId,
  onOpenSidebar,
}) => {
  const messageListRef = useRef<MessageListRef | null>(null);

  const chatState = useChatContainer({
    childId,
    initialConversationId,
    messageListRef,
  });

  const {
    chatOrchestrator,
    inputValue,
    setInputValue,
    suggestions,
    handleSend,
    handleSuggestionClick,
    handleKeyPress,
    handleMessageFeedback,
  } = chatState;

  return (
    <div className="flex flex-col h-full bg-[#FDFBF8]">
      {/* 错误状态横幅 */}
      <ErrorBanner
        error={chatOrchestrator.error}
        onRetry={chatOrchestrator.retryLastMessage}
        onDismiss={chatOrchestrator.clearError}
      />

      {/* 主要内容区域 */}
      <div className="overflow-hidden flex-1">
        <div className="overflow-y-auto px-4 py-5 h-full">
          {chatOrchestrator.messages.length === 0 ? (
            <WelcomeScreen
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          ) : (
            <MessageList
              ref={messageListRef}
              messages={chatOrchestrator.messages}
              onMessageFeedback={handleMessageFeedback}
              isLoadingHistory={chatOrchestrator.isLoadingHistory}
              autoScrollToBottom={true}
            />
          )}
        </div>
      </div>

      {/* 流式状态指示器 */}
      <StreamingIndicator
        isStreaming={chatOrchestrator.isStreaming}
        streamingContentLength={chatOrchestrator.currentStreamingContent.length}
      />

      {/* 输入区域 */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
        onOpenSidebar={onOpenSidebar}
        disabled={chatOrchestrator.isStreaming}
        isLoading={chatOrchestrator.isStreaming}
      />
    </div>
  );
};
