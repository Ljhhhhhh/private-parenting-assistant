import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import type { ConversationResponseDto } from '@/types/models';

interface ConversationTag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface ConversationTagsProps {
  conversation: ConversationResponseDto;
  tags: ConversationTag[];
  selectedTags: string[];
  onTagsChange: (conversationId: number, tagIds: string[]) => void;
  onCreateTag?: (tag: Omit<ConversationTag, 'id'>) => void;
  className?: string;
}

// 预定义标签
const DEFAULT_TAGS: ConversationTag[] = [
  { id: 'health', name: '健康护理', color: '#66BB6A', icon: 'ph:heart-fill' },
  {
    id: 'nutrition',
    name: '营养喂养',
    color: '#FFB38A',
    icon: 'ph:bowl-food-fill',
  },
  { id: 'sleep', name: '睡眠行为', color: '#9C27B0', icon: 'ph:moon-fill' },
  { id: 'growth', name: '成长发育', color: '#4CAF50', icon: 'ph:plant-fill' },
  { id: 'education', name: '早期教育', color: '#2196F3', icon: 'ph:book-fill' },
  {
    id: 'behavior',
    name: '行为习惯',
    color: '#FF9800',
    icon: 'ph:smiley-fill',
  },
  {
    id: 'emergency',
    name: '紧急情况',
    color: '#FF5252',
    icon: 'ph:warning-fill',
  },
  {
    id: 'milestone',
    name: '成长里程碑',
    color: '#9C27B0',
    icon: 'ph:star-fill',
  },
];

/**
 * 会话标签组件
 * 支持标签选择、创建、管理等功能
 */
export const ConversationTags: React.FC<ConversationTagsProps> = ({
  conversation,
  tags = DEFAULT_TAGS,
  selectedTags,
  onTagsChange,
  onCreateTag,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4A90E2');

  // 切换标签选择状态
  const toggleTag = useCallback(
    (tagId: string) => {
      const newSelectedTags = selectedTags.includes(tagId)
        ? selectedTags.filter((id) => id !== tagId)
        : [...selectedTags, tagId];

      onTagsChange(conversation.id, newSelectedTags);
    },
    [conversation.id, selectedTags, onTagsChange],
  );

  // 创建新标签
  const handleCreateTag = useCallback(() => {
    if (!newTagName.trim() || !onCreateTag) return;

    const newTag: Omit<ConversationTag, 'id'> = {
      name: newTagName.trim(),
      color: newTagColor,
      icon: 'ph:tag-fill',
    };

    onCreateTag(newTag);
    setNewTagName('');
    setNewTagColor('#4A90E2');
    setIsCreating(false);
  }, [newTagName, newTagColor, onCreateTag]);

  // 获取已选择的标签
  const selectedTagObjects = tags.filter((tag) =>
    selectedTags.includes(tag.id),
  );

  return (
    <div className={`conversation-tags ${className}`}>
      {/* 已选择的标签显示 */}
      {selectedTagObjects.length > 0 && (
        <div className="selected-tags mb-2">
          <div className="flex flex-wrap gap-1">
            {selectedTagObjects.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.icon && <Icon icon={tag.icon} className="w-3 h-3 mr-1" />}
                {tag.name}
                <button
                  onClick={() => toggleTag(tag.id)}
                  className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                >
                  <Icon icon="ph:x" className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 标签选择器 */}
      <div className="tag-selector">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-[#666666] hover:text-[#333333] transition-colors"
        >
          <Icon icon="ph:tag" className="w-4 h-4 mr-1" />
          {selectedTagObjects.length > 0 ? '编辑标签' : '添加标签'}
          <Icon
            icon={isExpanded ? 'ph:caret-up' : 'ph:caret-down'}
            className="w-4 h-4 ml-1"
          />
        </button>

        {isExpanded && (
          <div className="tag-dropdown mt-2 p-3 bg-white border border-[#E0E0E0] rounded-xl shadow-sm">
            {/* 预定义标签 */}
            <div className="predefined-tags">
              <h4 className="text-sm font-medium text-[#333333] mb-2">
                选择标签
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`flex items-center p-2 rounded-lg text-sm transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'bg-opacity-20 border-2'
                        : 'bg-[#F5F7FA] hover:bg-[#E8EBF0] border border-transparent'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id)
                        ? `${tag.color}20`
                        : undefined,
                      borderColor: selectedTags.includes(tag.id)
                        ? tag.color
                        : undefined,
                    }}
                  >
                    {tag.icon && (
                      <Icon
                        icon={tag.icon}
                        className="w-4 h-4 mr-2"
                        style={{ color: tag.color }}
                      />
                    )}
                    <span className="text-[#333333]">{tag.name}</span>
                    {selectedTags.includes(tag.id) && (
                      <Icon
                        icon="ph:check"
                        className="w-4 h-4 ml-auto"
                        style={{ color: tag.color }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 创建新标签 */}
            {onCreateTag && (
              <div className="create-tag mt-4 pt-3 border-t border-[#E0E0E0]">
                {!isCreating ? (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center text-sm text-[#4A90E2] hover:text-[#3A7BC8] transition-colors"
                  >
                    <Icon icon="ph:plus" className="w-4 h-4 mr-1" />
                    创建新标签
                  </button>
                ) : (
                  <div className="create-form space-y-3">
                    <div>
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="标签名称"
                        className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:border-[#4A90E2]"
                        maxLength={10}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-[#666666]">颜色:</span>
                      <div className="flex space-x-1">
                        {[
                          '#4A90E2',
                          '#66BB6A',
                          '#FFB38A',
                          '#9C27B0',
                          '#FF9800',
                          '#FF5252',
                        ].map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewTagColor(color)}
                            className={`w-6 h-6 rounded-full border-2 ${
                              newTagColor === color
                                ? 'border-[#333333]'
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim()}
                        className="px-3 py-1.5 bg-[#4A90E2] text-white text-sm rounded-lg hover:bg-[#3A7BC8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        创建
                      </button>
                      <button
                        onClick={() => {
                          setIsCreating(false);
                          setNewTagName('');
                          setNewTagColor('#4A90E2');
                        }}
                        className="px-3 py-1.5 bg-[#F5F7FA] text-[#666666] text-sm rounded-lg hover:bg-[#E8EBF0] transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 样式 */}
      <style>{`
        .conversation-tags .tag-dropdown {
          animation: slideDown 0.2s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * 标签过滤器组件
 * 用于在会话列表中按标签过滤
 */
interface TagFilterProps {
  tags: ConversationTag[];
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  className?: string;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags = DEFAULT_TAGS,
  selectedTags,
  onTagsChange,
  className = '',
}) => {
  const toggleTag = useCallback(
    (tagId: string) => {
      const newSelectedTags = selectedTags.includes(tagId)
        ? selectedTags.filter((id) => id !== tagId)
        : [...selectedTags, tagId];

      onTagsChange(newSelectedTags);
    },
    [selectedTags, onTagsChange],
  );

  const clearAllTags = useCallback(() => {
    onTagsChange([]);
  }, [onTagsChange]);

  return (
    <div className={`tag-filter ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-[#333333]">按标签筛选</h4>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="text-xs text-[#666666] hover:text-[#333333] transition-colors"
          >
            清除全部
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedTags.includes(tag.id)
                ? 'text-white shadow-sm'
                : 'text-[#666666] bg-[#F5F7FA] hover:bg-[#E8EBF0]'
            }`}
            style={{
              backgroundColor: selectedTags.includes(tag.id)
                ? tag.color
                : undefined,
            }}
          >
            {tag.icon && (
              <Icon
                icon={tag.icon}
                className="w-3 h-3 mr-1"
                style={{
                  color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                }}
              />
            )}
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * 标签统计组件
 * 显示各标签的使用统计
 */
interface TagStatsProps {
  tags: ConversationTag[];
  conversations: ConversationResponseDto[];
  conversationTags: Record<number, string[]>; // conversationId -> tagIds
  className?: string;
}

export const TagStats: React.FC<TagStatsProps> = ({
  tags = DEFAULT_TAGS,
  conversations,
  conversationTags,
  className = '',
}) => {
  // 计算标签使用统计
  const tagStats = tags
    .map((tag) => {
      const count = Object.values(conversationTags).filter((tagIds) =>
        tagIds.includes(tag.id),
      ).length;

      return {
        ...tag,
        count,
        percentage:
          conversations.length > 0 ? (count / conversations.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className={`tag-stats ${className}`}>
      <h4 className="text-sm font-medium text-[#333333] mb-3">标签使用统计</h4>

      <div className="space-y-2">
        {tagStats.map((stat) => (
          <div key={stat.id} className="flex items-center justify-between">
            <div className="flex items-center">
              {stat.icon && (
                <Icon
                  icon={stat.icon}
                  className="w-4 h-4 mr-2"
                  style={{ color: stat.color }}
                />
              )}
              <span className="text-sm text-[#333333]">{stat.name}</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-[#F5F7FA] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: stat.color,
                    width: `${stat.percentage}%`,
                  }}
                />
              </div>
              <span className="text-xs text-[#666666] w-8 text-right">
                {stat.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { ConversationTag };
