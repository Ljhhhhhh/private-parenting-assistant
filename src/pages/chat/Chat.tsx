import React, { useState, useCallback } from 'react';
import { useChildrenStore } from '@/stores/children';
import { useConversationStore } from './hooks/useConversationStore';
import { ChatContainer } from './components/ChatContainer';
import { ConversationSidebar } from './components/ConversationSidebar';
import { NavBar } from '@/components/ui';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

/**
 * 智能聊天主页面组件
 * 管理整体布局、响应式侧边栏、会话切换等
 */
const Chat: React.FC = () => {
  const { currentChild } = useChildrenStore();
  const navigate = useNavigate();
  // 🆕 使用 Zustand store 管理会话状态
  const { currentConversationId, selectConversation } = useConversationStore();

  // 侧边栏状态
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 会话选择处理
  const handleConversationSelect = useCallback(
    (conversationId: number | null) => {
      console.debug('🗂️ 用户选择会话:', conversationId);
      selectConversation(conversationId);
      setIsSidebarOpen(false);
    },
    [selectConversation],
  );

  // 打开侧边栏
  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  // 关闭侧边栏
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 如果没有选择宝宝
  if (!currentChild) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDFBF8]">
        <div className="text-center">
          <Icon
            icon="ph:baby-fill"
            width={96}
            height={96}
            className="mx-auto mb-6 text-[#E0E0E0]"
          />
          <h2 className="text-xl font-medium text-[#333333] mb-4">
            请先选择宝宝
          </h2>
          <p className="text-[#666666]">需要选择一个宝宝才能开始智能问答</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFBF8] overflow-hidden">
      {/* 移动端抽屉式侧边栏 */}
      <ConversationSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        childId={currentChild.id}
      />

      {/* 主聊天区域 */}
      <div className="flex overflow-hidden flex-col flex-1">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b border-[#E0E0E0] shadow-sm">
          <NavBar
            onBack={() => {
              navigate('/');
            }}
            title="萌芽助手"
            titleClassName="font-semibold text-xl text-[#FFB38A]"
            right={
              <div className="flex items-center space-x-3">
                {/* 当前宝宝信息 */}
                <div className="flex items-center space-x-2 text-sm text-[#666666] bg-[#FFF8F5] px-3 py-1.5 rounded-full">
                  <Icon
                    icon="ph:baby"
                    width={16}
                    height={16}
                    className="text-[#FFB38A]"
                  />
                  <span className="font-medium">{currentChild.nickname}</span>
                </div>
              </div>
            }
            border={false}
            safeArea={false}
          />
        </div>

        {/* 聊天容器 */}
        <div className="overflow-hidden flex-1">
          <ChatContainer
            childId={currentChild.id}
            initialConversationId={currentConversationId || undefined}
            key={currentConversationId || 'new'}
            onOpenSidebar={handleOpenSidebar}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
