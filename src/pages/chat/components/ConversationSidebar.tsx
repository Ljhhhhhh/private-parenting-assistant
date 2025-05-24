import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui';

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId?: number | null;
  onConversationSelect: (conversationId: number | null) => void;
  childId: number;
}

interface MockConversation {
  id: number;
  title: string;
  preview: string;
  timestamp: string;
  isArchived: boolean;
}

/**
 * 会话管理侧边栏组件
 * 支持会话列表、搜索、创建等基础功能
 */
export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isOpen,
  onClose,
  currentConversationId,
  onConversationSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 模拟数据
  const mockConversations: MockConversation[] = [
    {
      id: 1,
      title: '宝宝发烧护理',
      preview: '宝宝今天有点发烧，体温38.2度，请问需要立即就医吗？',
      timestamp: '2024-01-15 10:30',
      isArchived: false,
    },
    {
      id: 2,
      title: '辅食添加问题',
      preview: '6个月大的宝宝开始添加辅食，请问有什么注意事项？',
      timestamp: '2024-01-14 15:20',
      isArchived: false,
    },
    {
      id: 3,
      title: '睡眠时间调整',
      preview: '宝宝晚上总是很晚才睡，白天又起得很早...',
      timestamp: '2024-01-13 20:45',
      isArchived: true,
    },
  ];

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

  // 过滤会话
  const filteredConversations = mockConversations.filter((conv) => {
    if (showArchived && !conv.isArchived) return false;
    if (!showArchived && conv.isArchived) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        conv.title.toLowerCase().includes(query) ||
        conv.preview.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // 创建新会话
  const handleCreateConversation = () => {
    onConversationSelect(null);
    onClose();
  };

  // 选择会话
  const handleConversationClick = (conversation: MockConversation) => {
    onConversationSelect(conversation.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />

      {/* 侧边栏 */}
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-[#E0E0E0]">
          <h2 className="text-lg font-semibold text-[#333333]">对话记录</h2>
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

        {/* 工具栏 */}
        <div className="p-4 border-b border-[#E0E0E0] space-y-3">
          {/* 搜索框 */}
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索对话内容..."
              className="pl-10 py-2"
            />
            <Icon
              icon="ph:magnifying-glass"
              width={18}
              height={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#999999]"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateConversation}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FFB38A] text-white rounded-full text-sm font-medium hover:bg-[#FF9966] transition-colors"
            >
              <Icon icon="ph:plus" width={16} height={16} />
              新建
            </button>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                showArchived
                  ? 'bg-[#FFB38A] text-white'
                  : 'border border-[#E0E0E0] text-[#666666] hover:border-[#FFB38A]'
              }`}
            >
              {showArchived ? '显示全部' : '已归档'}
            </button>
          </div>
        </div>

        {/* 会话列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                icon="ph:chat-circle"
                width={48}
                height={48}
                className="mx-auto mb-2 text-[#E0E0E0]"
              />
              <p className="text-[#999999] text-sm">
                {searchQuery.trim()
                  ? '没有找到相关对话'
                  : showArchived
                  ? '暂无归档对话'
                  : '暂无对话记录'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
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
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-[#333333] truncate flex-1">
                          {conversation.title}
                        </h3>
                        {conversation.isArchived && (
                          <Icon
                            icon="ph:archive"
                            width={16}
                            height={16}
                            className="text-[#9E9E9E] ml-2"
                          />
                        )}
                      </div>

                      <p className="text-sm text-[#666666] truncate mb-2">
                        {conversation.preview}
                      </p>

                      <div className="text-xs text-[#999999]">
                        {conversation.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
