import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { provideChatFeedback } from '@/api/chat';
import type { ChatFeedbackDto } from '@/types/models';

interface MessageFeedbackProps {
  messageId: string;
  chatHistoryId?: number;
  initialFeedback?: 'helpful' | 'not-helpful';
  onFeedbackChange?: (feedback: 'helpful' | 'not-helpful' | undefined) => void;
}

/**
 * 消息反馈组件
 * 支持有帮助/无帮助的反馈功能
 */
export const MessageFeedback: React.FC<MessageFeedbackProps> = ({
  chatHistoryId,
  initialFeedback,
  onFeedbackChange,
}) => {
  const [feedback, setFeedback] = useState<
    'helpful' | 'not-helpful' | undefined
  >(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = useCallback(
    async (isHelpful: boolean) => {
      const newFeedback = isHelpful ? 'helpful' : 'not-helpful';

      // 如果点击的是已选中的反馈，则取消选择
      const finalFeedback = feedback === newFeedback ? undefined : newFeedback;

      setFeedback(finalFeedback);
      onFeedbackChange?.(finalFeedback);

      // 如果有chatHistoryId，提交到API
      if (chatHistoryId && finalFeedback) {
        try {
          setIsSubmitting(true);
          const feedbackData: ChatFeedbackDto = {
            chatHistoryId,
            isHelpful: finalFeedback === 'helpful',
          };
          await provideChatFeedback(feedbackData);
        } catch (error) {
          console.error('提交反馈失败:', error);
          // 如果提交失败，回滚状态
          setFeedback(initialFeedback);
          onFeedbackChange?.(initialFeedback);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [feedback, chatHistoryId, initialFeedback, onFeedbackChange],
  );

  return (
    <div className="mt-2 pt-2 border-t border-[#F0F0F0] flex justify-end space-x-2">
      {/* 有帮助按钮 */}
      <button
        onClick={() => handleFeedback(true)}
        disabled={isSubmitting}
        className={`text-xs px-2 py-1 rounded-full transition-colors ${
          feedback === 'helpful'
            ? 'bg-[#66BB6A]/20 text-[#66BB6A] font-medium'
            : 'text-[#999999] hover:bg-[#F5F5F5] hover:text-[#66BB6A]'
        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center">
          <Icon
            icon={feedback === 'helpful' ? 'ph:thumbs-up-fill' : 'ph:thumbs-up'}
            className="mr-1"
            width={14}
            height={14}
          />
          有帮助
        </span>
      </button>

      {/* 无帮助按钮 */}
      <button
        onClick={() => handleFeedback(false)}
        disabled={isSubmitting}
        className={`text-xs px-2 py-1 rounded-full transition-colors ${
          feedback === 'not-helpful'
            ? 'bg-[#EF5350]/20 text-[#EF5350] font-medium'
            : 'text-[#999999] hover:bg-[#F5F5F5] hover:text-[#EF5350]'
        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center">
          <Icon
            icon={
              feedback === 'not-helpful'
                ? 'ph:thumbs-down-fill'
                : 'ph:thumbs-down'
            }
            className="mr-1"
            width={14}
            height={14}
          />
          无帮助
        </span>
      </button>

      {/* 提交中指示器 */}
      {isSubmitting && (
        <div className="flex items-center">
          <Icon
            icon="ph:spinner"
            width={12}
            height={12}
            className="text-[#999999] animate-spin"
          />
        </div>
      )}
    </div>
  );
};
