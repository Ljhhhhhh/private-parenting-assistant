import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import { useConversationStore } from '../hooks/useConversationStore';
import type { ConversationResponseDto } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ExpandCollapseAnimation } from '@/components/animations/ExpandCollapseAnimation';

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId?: number | null;
  onConversationSelect: (conversationId: number | null) => void;
  childId: number;
}

/**
 * 会话管理侧边栏组件
 * 支持会话列表、搜索、创建等基础功能
 * 集成真实 API 数据
 */
export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isOpen,
  onClose,
  currentConversationId,
  onConversationSelect,
  childId,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 使用 Zustand store 管理会话数据
  const { isLoading, error, loadConversations, getActiveConversations } =
    useConversationStore();

  // 刷新会话列表
  const refreshConversations = useCallback(() => {
    loadConversations(childId);
  }, [loadConversations, childId]);

  useEffect(() => {
    if (isOpen) {
      loadConversations(childId);
    }
  }, [isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // 初始加载会话列表
  useEffect(() => {
    if (childId) {
      loadConversations(childId);
    }
  }, [childId, loadConversations]);

  // 获取过滤后的会话列表
  const filteredConversations = getActiveConversations();

  // 会话列表分组和展开收起状态
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  
  // 按日期分组会话
  const groupedConversations = filteredConversations.reduce<{
    [key: string]: ConversationResponseDto[];
  }>((groups, conversation) => {
    // 简单分组：今天、最近一周、更早
    const date = new Date(conversation.updatedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    let groupKey = '更早';
    if (diffDays < 1) {
      groupKey = '今天';
    } else if (diffDays < 7) {
      groupKey = '最近一周';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(conversation);
    return groups;
  }, {});
  
  // 初始化展开状态
  useEffect(() => {
    if (filteredConversations.length > 0 && Object.keys(expandedGroups).length === 0) {
      // 默认展开今天的会话
      setExpandedGroups({
        '今天': true,
        '最近一周': false,
        '更早': false
      });
    }
  }, [filteredConversations, expandedGroups]);
  
  // 切换分组展开收起状态
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // 创建新会话
  const handleCreateConversation = () => {
    onConversationSelect(null);
    onClose();
  };

  // 选择会话
  const handleConversationClick = (conversation: ConversationResponseDto) => {
    onConversationSelect(conversation.id);
    onClose();
  };

  // 格式化时间显示
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: zhCN,
      });
    } catch (error) {
      console.warn('时间格式化失败:', error);
      return '未知时间';
    }
  };

  // 获取会话预览文本
  const getConversationPreview = (
    conversation: ConversationResponseDto,
  ): string => {
    if (conversation.latestMessage?.userMessage) {
      return conversation.latestMessage.userMessage;
    }

    if (conversation.title) {
      return '新建对话';
    }

    return '暂无消息';
  };

  // 使用状态来控制动画而不是条件渲染
  return (
    <>
      {/* 背景遮罩 - 添加渐变动画 */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-150 ease-in-out ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 侧边栏 - 添加滑入滑出动画 */}
      <div
        ref={sidebarRef}
        className={`flex fixed top-0 z-50 flex-col w-80 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-[#E0E0E0]">
          <h2 className="text-lg font-semibold text-[#333333]">对话记录</h2>
          <div className="flex gap-2 items-center">
            {/* 刷新按钮 */}
            <button
              onClick={refreshConversations}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              title="刷新列表"
            >
              <Icon
                icon={isLoading ? 'ph:spinner' : 'ph:arrow-clockwise'}
                width={18}
                height={18}
                className={`text-[#666666] ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F5F5F5] transition-colors"
            >
              <Icon
                icon="ph:x"
                width={20}
                height={20}
                className="text-[#666666]"
              />
            </button>
          </div>
        </div>

        {/* 会话列表 */}
        <div className="overflow-y-auto flex-1">
          {/* 错误状态 */}
          {error && (
            <div className="px-4 py-8 text-center">
              <Icon
                icon="ph:warning-circle"
                width={48}
                height={48}
                className="mx-auto mb-3 text-red-400"
              />
              <p className="mb-3 text-sm text-red-600">{error || '加载失败'}</p>
              <button
                onClick={refreshConversations}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg transition-colors hover:bg-red-600"
              >
                重试
              </button>
            </div>
          )}

          {/* 加载状态 */}
          {isLoading && !error && (
            <div className="py-8 text-center">
              <Icon
                icon="ph:spinner"
                width={48}
                height={48}
                className="mx-auto mb-3 text-[#FFB38A] animate-spin"
              />
              <p className="text-[#999999] text-sm">加载中...</p>
            </div>
          )}

          {/* 空状态 */}
          {!isLoading && !error && filteredConversations.length === 0 && (
            <div className="py-8 text-center">
              <Icon
                icon="ph:chat-circle"
                width={48}
                height={48}
                className="mx-auto mb-2 text-[#E0E0E0]"
              />
              <button
                onClick={handleCreateConversation}
                className="mt-3 px-4 py-2 bg-[#FFB38A] text-white text-sm rounded-lg hover:bg-[#FF9966] transition-colors"
              >
                开始第一个对话
              </button>
            </div>
          )}

          {/* 会话列表 - 分组展示 */}
          {!isLoading && !error && filteredConversations.length > 0 && (
            <div className="p-2 space-y-2">
              {Object.entries(groupedConversations).map(([groupKey, conversations]) => (
                <div key={groupKey} className="border border-[#F0F0F0] rounded-lg overflow-hidden shadow-sm">
                  {/* 分组标题栏 - 可点击展开/收起 */}
                  <div 
                    className="flex items-center justify-between p-3 bg-[#FAFAFA] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <div className="flex items-center gap-2">
                      <ExpandCollapseAnimation 
                        isExpanded={!!expandedGroups[groupKey]}
                        size={20}
                        className="text-[#FFB38A]"
                      />
                      <h3 className="font-medium text-[#555555]">{groupKey}</h3>
                      <span className="text-xs text-[#999999] bg-[#F0F0F0] px-1.5 py-0.5 rounded">
                        {conversations.length}
                      </span>
                    </div>
                  </div>
                  
                  {/* 分组内容 - 动画展开/收起 */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedGroups[groupKey] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    style={{
                      transitionTimingFunction: expandedGroups[groupKey] ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <div className="p-2 space-y-1 bg-white">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => handleConversationClick(conversation)}
                          className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-[#F5F5F5] ${
                            currentConversationId === conversation.id
                              ? 'bg-[#FFE5D6] border border-[#FFB38A]'
                              : 'hover:bg-[#F9F9F9]'
                          }`}
                        >
                          <div className="flex gap-3 items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <h3 className="font-medium text-[#333333] truncate flex-1">
                                  {conversation.title || '未命名对话'}
                                </h3>
                                <div className="flex gap-1 items-center ml-2">
                                  {/* 消息数量 */}
                                  {conversation.messageCount > 0 && (
                                    <span className="text-xs text-[#999999] bg-[#F0F0F0] px-1.5 py-0.5 rounded">
                                      {conversation.messageCount}
                                    </span>
                                  )}

                                  {/* 归档标识 */}
                                  {conversation.isArchived && (
                                    <Icon
                                      icon="ph:archive"
                                      width={16}
                                      height={16}
                                      className="text-[#9E9E9E]"
                                    />
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-[#666666] truncate mb-2">
                                {getConversationPreview(conversation)}
                              </p>

                              <div className="text-xs text-[#999999]">
                                {formatTime(conversation.updatedAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部统计信息 */}
        {!isLoading && !error && (
          <div className="p-3 border-t border-[#E0E0E0] text-xs text-[#999999] text-center">
            {`共 ${getActiveConversations().length} 个对话`}
          </div>
        )}

        {/* 新建对话浮动操作按钮(FAB) */}
        <div className="absolute right-4 bottom-20 z-10">
          <button
            onClick={handleCreateConversation}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#FFB38A] hover:bg-[#FF9F73] shadow-[0px_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300"
            aria-label="新建对话"
          >
            <Icon
              icon="ph:plus"
              width={20}
              height={20}
              className="text-white"
            />
            <span className="text-sm font-medium text-white">新建对话</span>
          </button>
        </div>
      </div>
    </>
  );
};
