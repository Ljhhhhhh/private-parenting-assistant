import React, { useRef } from 'react';
import { Result, Skeleton } from 'antd-mobile';
import { Icon } from '@iconify/react';
import Chat from '@chatui/core';
import { useChatContext } from '../contexts/ChatContext';
import MessageItem from './MessageItem';
import { Button } from 'antd-mobile';

// 定义推荐问题
const QUICK_REPLIES = [
  {
    name: '宝宝发烧怎么办？',
    isNew: true,
    isHighlight: true,
  },
  {
    name: '宝宝多大可以添加辅食？',
  },
  {
    name: '宝宝不爱喝水怎么办？',
  },
  {
    name: '宝宝晚上哭闹不睡觉怎么办？',
  },
  {
    name: '宝宝几个月会翻身？',
  },
];

/**
 * 聊天主体组件
 */
const ChatBody: React.FC = () => {
  const {
    loading,
    messages,
    children,
    showChildPrompt,
    handleSend,
    handleQuickReplyClick,
    handleCreateChild,
  } = useChatContext();

  const messageContainerRef = useRef<any>(null);

  // 渲染消息内容
  const renderMessageContent = (msg: any) => {
    return <MessageItem message={msg} />;
  };

  // 渲染加载状态
  const renderLoading = () => {
    if (!loading) return null;

    return (
      <div className="p-4">
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={3} animated />
      </div>
    );
  };

  // 渲染空状态
  const renderEmpty = () => {
    if (loading || messages.length > 0) return null;

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Result
          icon={<Icon icon="mdi:account-outline" style={{ fontSize: 48, color: '#ccc' }} />}
          title="开始提问，获取育儿建议"
        />
        <div className="max-w-xs mt-4 text-sm text-center text-gray-500">
          您可以询问关于宝宝成长、喂养、健康、教育等方面的问题，我们的AI助手将为您提供专业的育儿建议。
        </div>

        {children.length === 0 && (
          <Button className="mt-6" color="primary" onClick={handleCreateChild}>
            创建宝宝档案，获取更精准的回答
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={`flex-1 overflow-hidden ${showChildPrompt ? 'mt-16' : ''}`}>
      {renderLoading()}
      {renderEmpty()}

      <Chat
        wideBreakpoint="600px"
        messages={messages}
        renderMessageContent={renderMessageContent}
        quickReplies={QUICK_REPLIES}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
        locale="zh-CN"
        placeholder="输入您的问题..."
        loadMoreText="加载更多"
        messagesRef={messageContainerRef}
      />
    </div>
  );
};

export default ChatBody;
