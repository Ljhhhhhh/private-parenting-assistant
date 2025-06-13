import React, { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { provideChatFeedback } from '@/api/chat';
import type { ChatFeedbackDto } from '@/types/models';

interface MessageFeedbackProps {
  messageId?: string;
  chatHistoryId?: string;
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
    <div className="space-y-2 sm:space-y-0">
      {/* 移动端：竖向布局，桌面端：横向布局 */}
      <div className="sm:flex sm:items-center sm:justify-between">
        {/* 引导文案 */}
        <div className="flex items-center text-xs text-gray-400 mb-2 sm:mb-0">
          <Icon
            icon="ph:lightbulb"
            className="mr-1 flex-shrink-0"
            width={12}
            height={12}
          />
          <span className="leading-relaxed">这个回答对您有帮助吗？</span>
        </div>

        {/* 反馈按钮组 */}
        <div className="flex items-center justify-end sm:justify-end space-x-2">
          {/* 有帮助按钮 */}
          <button
            onClick={() => handleFeedback(true)}
            disabled={isSubmitting}
            className={`
            group relative overflow-hidden flex-shrink-0
            text-xs px-2.5 py-1.5 rounded-full 
            transition-all duration-300 ease-out
            flex items-center space-x-1
            min-w-[68px] justify-center
            ${
              feedback === 'helpful'
                ? 'bg-gradient-to-r from-[#FFB38A] to-[#FFC9A8] text-white shadow-md scale-105 ring-2 ring-[#FFB38A]/30'
                : 'text-gray-500 hover:text-[#FF9F73] hover:bg-[#FFB38A]/10 hover:scale-105 active:scale-95 border border-gray-200 hover:border-[#FFB38A]/30'
            } 
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          >
            <div
              className={`transition-transform duration-200 ${
                feedback === 'helpful' ? 'scale-110' : 'group-hover:scale-110'
              }`}
            >
              <Icon
                icon={
                  feedback === 'helpful' ? 'ph:thumbs-up-fill' : 'ph:thumbs-up'
                }
                width={12}
                height={12}
              />
            </div>
            <span className="font-medium whitespace-nowrap">有帮助</span>
          </button>

          {/* 无帮助按钮 */}
          <button
            onClick={() => handleFeedback(false)}
            disabled={isSubmitting}
            className={`
            group relative overflow-hidden flex-shrink-0
            text-xs px-2.5 py-1.5 rounded-full 
            transition-all duration-300 ease-out
            flex items-center space-x-1
            min-w-[68px] justify-center
            ${
              feedback === 'not-helpful'
                ? 'bg-gradient-to-r from-[#F8BBD0] to-[#FFDCE8] text-white shadow-md scale-105 ring-2 ring-[#F8BBD0]/30'
                : 'text-gray-500 hover:text-[#E091B1] hover:bg-[#F8BBD0]/10 hover:scale-105 active:scale-95 border border-gray-200 hover:border-[#F8BBD0]/30'
            } 
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          >
            <div
              className={`transition-transform duration-200 ${
                feedback === 'not-helpful'
                  ? 'scale-110'
                  : 'group-hover:scale-110'
              }`}
            >
              <Icon
                icon={
                  feedback === 'not-helpful'
                    ? 'ph:thumbs-down-fill'
                    : 'ph:thumbs-down'
                }
                width={12}
                height={12}
              />
            </div>
            <span className="font-medium whitespace-nowrap">无帮助</span>
          </button>
        </div>
      </div>
    </div>
  );
};
