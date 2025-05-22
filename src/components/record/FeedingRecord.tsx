import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import RecordModal from './RecordModal';
import { createRecord } from '@/api/records';
import { CreateRecordDto } from '@/types/models';

interface FeedingRecordProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  onSuccess?: () => void;
}

/**
 * 喂养记录组件
 */
const FeedingRecord: React.FC<FeedingRecordProps> = ({
  isOpen,
  onClose,
  childId,
  onSuccess
}) => {
  // 记录时间
  const [recordTime, setRecordTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  
  // 喂养类型
  const [feedingType, setFeedingType] = useState<'milk' | 'supplement' | 'regular'>('milk');
  
  // 喂养量（毫升）
  const [amount, setAmount] = useState<number>(100);
  
  // 备注
  const [notes, setNotes] = useState<string>('');
  
  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 预设喂养量选项
  const amountOptions = [60, 90, 120, 150, 180];

  // 喂养类型选项
  const feedingTypeOptions = [
    { value: 'milk', label: '奶', icon: 'mdi:baby-bottle-outline' },
    { value: 'supplement', label: '辅食', icon: 'mdi:food-apple-outline' },
    { value: 'regular', label: '正餐', icon: 'mdi:silverware-fork-knife' },
  ];

  // 提交记录
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const recordData: CreateRecordDto = {
        childId,
        recordType: 'Feeding',
        recordTimestamp: new Date(recordTime).toISOString(),
        details: {
          feedingType,
          amount,
          notes: notes.trim()
        }
      };
      
      await createRecord(recordData);
      
      // 重置表单
      setFeedingType('milk');
      setAmount(100);
      setNotes('');
      
      // 关闭弹窗
      onClose();
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('提交喂养记录失败:', error);
      // 这里可以添加错误提示
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecordModal
      isOpen={isOpen}
      onClose={onClose}
      title="记录喂养"
    >
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
              className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC9A8] focus:ring-offset-0"
              style={{ colorScheme: 'light' }}
            />
            {/* 移除自定义时钟图标，使用浏览器原生图标 */}
          </div>
        </div>

        {/* 喂养类型 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            喂养类型
          </label>
          <div className="flex space-x-3">
            {feedingTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFeedingType(option.value as any)}
                className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  feedingType === option.value
                    ? 'bg-[#FFC9A8]/20 border-[#FFC9A8] text-[#FF9F73]'
                    : 'border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`text-2xl mb-1 ${
                    feedingType === option.value ? 'text-[#FF9F73]' : 'text-[#999999]'
                  }`}
                />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 喂养量 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            喂养量
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              className="flex-1 p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC9A8] focus:border-transparent"
            />
            <span className="text-[#666666]">毫升</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {amountOptions.map((option) => (
              <button
                key={option}
                onClick={() => setAmount(option)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  amount === option
                    ? 'bg-[#FFC9A8] text-[#FF9F73]'
                    : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                }`}
              >
                {option} 毫升
              </button>
            ))}
          </div>
        </div>

        {/* 备注 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            备注（可选）
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="添加备注..."
            className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC9A8] focus:ring-offset-0 resize-none h-24"
          />
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 mt-3 text-white bg-[#FF9F73] rounded-lg hover:bg-[#FF8A50] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF9F73] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '保存记录'}
        </button>
      </div>
    </RecordModal>
  );
};

export default FeedingRecord;
