import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import RecordModal from './RecordModal';
import { createRecord } from '@/api/records';
import {
  CreateRecordDto,
  RecordType,
  FeedingDetails,
  FeedingType,
} from '@/types/models';

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
  onSuccess,
}) => {
  // 记录时间
  const [recordTime, setRecordTime] = useState<string>(
    new Date().toISOString().slice(0, 16),
  );

  // 喂养类型
  const [feedingType, setFeedingType] = useState<FeedingType>(FeedingType.MILK);

  // 喂养量
  const [amount, setAmount] = useState<number>(100);

  // 根据喂养类型自动设置单位，奶为 ml，其他为 g

  // 反应
  const [reaction, setReaction] = useState<string>('');

  // 备注
  const [notes, setNotes] = useState<string>('');

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 预设喂养量选项
  const amountOptions = [60, 90, 120, 150, 180];

  // 喂养类型选项
  const feedingTypeOptions = [
    { value: FeedingType.MILK, label: '奶', icon: 'mdi:baby-bottle-outline' },
    {
      value: FeedingType.COMPLEMENTARY,
      label: '辅食',
      icon: 'mdi:food-apple-outline',
    },
    {
      value: FeedingType.MEAL,
      label: '正餐',
      icon: 'mdi:silverware-fork-knife',
    },
  ];

  // 反应选项
  // const reactionOptions = [
  //   { value: '喜欢', label: '喜欢', icon: 'mdi:emoticon' },
  //   { value: '一般', label: '一般', icon: 'mdi:emoticon-neutral' },
  //   { value: '不喜欢', label: '不喜欢', icon: 'mdi:emoticon-sad' },
  //   { value: '过敏', label: '过敏', icon: 'mdi:alert-circle-outline' },
  // ];

  // 提交记录
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // 根据喝养类型确定单位
      const currentUnit = feedingType === FeedingType.MILK ? 'ml' : 'g';

      const details: FeedingDetails = {
        feedingType,
        amount,
        unit: currentUnit,
        reaction,
        notes: notes.trim(),
      };

      const recordData: CreateRecordDto = {
        childId,
        recordType: RecordType.FEEDING,
        recordTimestamp: new Date(recordTime).toISOString(),
        details,
      };

      await createRecord(recordData);

      // 重置表单
      setFeedingType(FeedingType.MILK);
      setAmount(100);
      setReaction('');
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
    <RecordModal isOpen={isOpen} onClose={onClose} title="记录喂养">
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
              className="w-full p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC9A8] focus:ring-offset-0"
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
                onClick={() => setFeedingType(option.value)}
                className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  feedingType === option.value
                    ? 'bg-[#FFC9A8]/20 border-[#FFC9A8] text-[#FF9F73]'
                    : 'border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`text-2xl mb-1 ${
                    feedingType === option.value
                      ? 'text-[#FF9F73]'
                      : 'text-[#999999]'
                  }`}
                />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 喂养量和单位 */}
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
              className="flex-1 p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC9A8] focus:border-transparent"
            />
            <div className="px-3 py-2 bg-[#F5F5F5] text-[#666666] border border-[#E5E5E5] rounded-lg">
              {feedingType === FeedingType.MILK ? '毫升(ml)' : '克(g)'}
            </div>
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
                {option} {feedingType === FeedingType.MILK ? 'ml' : 'g'}
              </button>
            ))}
          </div>
        </div>

        {/* 宝宝反应 */}
        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            宝宝反应（可选）
          </label>
          <div className="flex flex-wrap gap-2">
            {reactionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setReaction(option.value)}
                className={`px-3 py-1.5 rounded-full flex items-center transition-colors ${
                  reaction === option.value
                    ? 'bg-[#FFC9A8]/20 border border-[#FFC9A8] text-[#FF9F73]'
                    : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`mr-1 ${
                    reaction === option.value ? 'text-[#FF9F73]' : 'text-[#999999]'
                  }`}
                />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div> */}

        {/* 备注 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            备注（可选）
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="添加备注..."
            className="w-full p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC9A8] focus:ring-offset-0 resize-none h-24"
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
