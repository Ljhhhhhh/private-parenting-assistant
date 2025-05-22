import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import RecordModal from './RecordModal';
import { createRecord } from '@/api/records';
import { CreateRecordDto, RecordType, NoteDetails } from '@/types/models';

interface NoteRecordProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  onSuccess?: () => void;
}

/**
 * 笔记记录组件
 */
const NoteRecord: React.FC<NoteRecordProps> = ({
  isOpen,
  onClose,
  childId,
  onSuccess,
}) => {
  // 记录时间
  const [recordTime, setRecordTime] = useState<string>(
    new Date().toISOString().slice(0, 16),
  );

  // 内容
  const [content, setContent] = useState<string>('');

  // 标签
  const [tags, setTags] = useState<string[]>([]);

  // 新标签输入
  const [newTag, setNewTag] = useState<string>('');

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 常用标签
  const commonTags = ['成长', '里程碑', '健康', '行为', '情绪', '饮食', '睡眠'];

  // 添加标签
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setNewTag('');
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 处理标签输入
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag(newTag);
    }
  };

  // 提交记录
  const handleSubmit = async () => {
    if (!content.trim()) {
      // 可以添加内容验证提示
      return;
    }

    try {
      setIsSubmitting(true);

      const details: NoteDetails = {
        content: content.trim(),
      };

      // 只有当有标签时才添加
      if (tags.length > 0) {
        details.tags = tags;
      }

      const recordData: CreateRecordDto = {
        childId,
        recordType: RecordType.NOTE,
        recordTimestamp: new Date(recordTime).toISOString(),
        details,
      };

      await createRecord(recordData);

      // 重置表单
      setContent('');
      setTags([]);

      // 关闭弹窗
      onClose();

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('提交笔记记录失败:', error);
      // 这里可以添加错误提示
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecordModal isOpen={isOpen} onClose={onClose} title="记录笔记">
      <div className="space-y-5">
        {/* 记录时间 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            时间
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={recordTime}
              onChange={(e) => setRecordTime(e.target.value)}
              className="w-full p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE58C] focus:ring-offset-0"
              style={{ colorScheme: 'light' }}
            />
            {/* 移除自定义时钟图标，使用浏览器原生图标 */}
          </div>
        </div>

        {/* 内容 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="记录宝宝的成长点滴..."
            className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE58C] focus:ring-offset-0 resize-none h-32"
          />
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            标签（可选）
          </label>

          {/* 已添加的标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center px-3 py-1 bg-[#FFE58C]/50 text-[#FFD040] rounded-full"
                >
                  <span className="mr-1">{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-[#FFD040] hover:text-[#FFC107]"
                  >
                    <Icon icon="mdi:close-circle" className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 标签输入 */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="添加标签..."
                className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE58C] focus:border-transparent pr-10"
              />
              {newTag && (
                <button
                  onClick={() => addTag(newTag)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FFD040]"
                >
                  <Icon icon="mdi:plus-circle" className="text-xl" />
                </button>
              )}
            </div>
          </div>

          {/* 常用标签 */}
          <div className="mt-2">
            <p className="text-xs text-[#999999] mb-1">常用标签:</p>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => addTag(tag)}
                  disabled={tags.includes(tag)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    tags.includes(tag)
                      ? 'bg-[#F5F5F5] text-[#CCCCCC] cursor-not-allowed'
                      : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#FFE58C]/30 hover:text-[#FFD040]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="w-full py-3 mt-3 text-white bg-[#FFD040] rounded-lg hover:bg-[#FFC107] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD040] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '保存记录'}
        </button>
      </div>
    </RecordModal>
  );
};

export default NoteRecord;
