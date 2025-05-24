import React, { useState, useEffect, useCallback } from 'react';
import { useChildrenStore } from '@/stores/children';
import { useRouterParams } from '../hooks/useRouterParams';
import { ChatContainer } from './ChatContainer';
import { ConversationSidebar } from './ConversationSidebar';
import { NavBar } from '@/components/ui';
import { Icon } from '@iconify/react';

/**
 * 智能聊天主页面组件
 * 管理整体布局、响应式侧边栏、会话切换等
 */
export const SmartChatPage: React.FC = () => {
  const { currentChild } = useChildrenStore();
  const { currentConversationId, navigateToConversation, navigateToNewChat } =
    useRouterParams();

  // 侧边栏状态
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // 监听屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      const newIsDesktop = window.innerWidth >= 768;
      setIsDesktop(newIsDesktop);

      // 桌面端自动关闭移动端侧边栏
      if (newIsDesktop) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 会话选择处理
  const handleConversationSelect = useCallback(
    (conversationId: number | null) => {
      if (conversationId) {
        navigateToConversation(conversationId);
      } else {
        navigateToNewChat();
      }
      setIsSidebarOpen(false);
    },
    [navigateToConversation, navigateToNewChat],
  );

  // 新建会话
  const handleNewConversation = useCallback(() => {
    navigateToNewChat();
    setIsSidebarOpen(false);
  }, [navigateToNewChat]);

  // 打开侧边栏
  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  // 关闭侧边栏
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

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
      {/* 桌面端固定侧边栏 */}
      {isDesktop && (
        <div className="w-80 border-r border-[#E0E0E0] bg-white">
          <ConversationSidebar
            isOpen={true}
            onClose={() => {}}
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            childId={currentChild.id}
          />
        </div>
      )}

      {/* 移动端抽屉式侧边栏 */}
      {!isDesktop && (
        <ConversationSidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          childId={currentChild.id}
        />
      )}

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b border-[#E0E0E0] shadow-sm">
          <NavBar
            title="智能问答"
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

                {/* 新建会话按钮 */}
                <button
                  onClick={handleNewConversation}
                  className="p-2 rounded-full hover:bg-[#FFF8F5] transition-colors group"
                  aria-label="新建对话"
                >
                  <Icon
                    icon="ph:plus"
                    width={20}
                    height={20}
                    className="text-[#FFB38A] group-hover:text-[#FF9966]"
                  />
                </button>

                {/* 移动端菜单按钮 */}
                {!isDesktop && (
                  <button
                    onClick={handleOpenSidebar}
                    className="p-2 rounded-full hover:bg-[#F5F5F5] transition-colors"
                    aria-label="打开会话列表"
                  >
                    <Icon
                      icon="ph:list"
                      width={20}
                      height={20}
                      className="text-[#666666]"
                    />
                  </button>
                )}
              </div>
            }
            border={false}
            safeArea={false}
          />
        </div>

        {/* 聊天容器 */}
        <div className="flex-1 overflow-hidden">
          <ChatContainer
            childId={currentChild.id}
            initialConversationId={currentConversationId || undefined}
          />
        </div>
      </div>
    </div>
  );
};
