import React from 'react';
import { SafeArea } from 'antd-mobile';

// 导入自定义组件
import ChatHeader from './components/ChatHeader';
import ChatBody from './components/ChatBody';
import ChildPrompt from './components/ChildPrompt';

// 导入上下文提供者
import { ChatProvider } from './contexts/ChatContext';

/**
 * 聊天页面组件
 * 使用 ChatProvider 包装，提供所有聊天相关状态和操作
 */
const ChatPage: React.FC = () => {
  return (
    <ChatProvider>
      <div className="flex flex-col h-screen bg-white">
        {/* 导航栏 */}
        <div className="border-b border-gray-200">
          <ChatHeader />
          <SafeArea position="top" />
        </div>

        {/* 儿童提示 */}
        <ChildPrompt />

        {/* 聊天界面 */}
        <ChatBody />
      </div>
    </ChatProvider>
  );
};

export default ChatPage;
