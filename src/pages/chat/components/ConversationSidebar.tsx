import React, { useRef, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useConversationStore } from '../hooks/useConversationStore';
import type { ConversationResponseDto } from '@/types/models';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

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

  // 重试加载
  const handleRetry = () => {
    refreshConversations();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" />

      {/* 侧边栏 */}
      <div
        ref={sidebarRef}
        className="flex fixed top-0 left-0 z-50 flex-col w-80 h-full bg-white shadow-xl"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-[#E0E0E0]">
          <h2 className="text-lg font-semibold text-[#333333]">对话记录</h2>
          <div className="flex gap-2 items-center">
            {/* 刷新按钮 */}
            <button
              onClick={handleRetry}
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

        {/* 工具栏 */}
        <div className="p-4 border-b border-[#E0E0E0] space-y-3">
          {/* 操作按钮 */}
          <div className="flex gap-2 items-center">
            <button
              onClick={handleCreateConversation}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FFB38A] text-white rounded-full text-sm font-medium hover:bg-[#FF9966] transition-colors"
            >
              <Icon icon="ph:plus" width={16} height={16} />
              新建
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
                onClick={handleRetry}
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

          {/* 会话列表 */}
          {!isLoading && !error && filteredConversations.length > 0 && (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conversation) => (
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
          )}
        </div>

        {/* 底部统计信息 */}
        {!isLoading && !error && (
          <div className="p-3 border-t border-[#E0E0E0] text-xs text-[#999999] text-center">
            {`共 ${getActiveConversations().length} 个对话`}
          </div>
        )}
      </div>
    </>
  );
};
