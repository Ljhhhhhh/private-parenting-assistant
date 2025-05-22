import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import RecordModal from './RecordModal';
import { createRecord } from '@/api/records';
import { CreateRecordDto } from '@/types/models';

interface SleepRecordProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  onSuccess?: () => void;
}

/**
 * 睡眠记录组件
 */
const SleepRecord: React.FC<SleepRecordProps> = ({
  isOpen,
  onClose,
  childId,
  onSuccess,
}) => {
  // 记录时间
  const [recordTime, setRecordTime] = useState<string>(
    new Date().toISOString().slice(0, 16),
  );

  // 睡眠时长（分钟）
  const [sleepDuration, setSleepDuration] = useState<number>(60);

  // 睡眠质量
  const [quality, setQuality] = useState<number>(3);

  // 备注
  const [notes, setNotes] = useState<string>('');

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 预设时长选项
  const durationOptions = [30, 60, 90, 120, 150, 180];

  // 睡眠质量选项
  const qualityOptions = [
    { value: 5, label: '良好', icon: 'mdi:emoticon' },
    { value: 3, label: '一般', icon: 'mdi:emoticon-neutral' },
    { value: 1, label: '较差', icon: 'mdi:emoticon-sad' },
  ];

  // 提交记录
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const recordData: CreateRecordDto = {
        childId,
        recordType: 'Sleep',
        recordTimestamp: new Date(recordTime).toISOString(),
        details: {
          sleepDuration: sleepDuration,
          quality,
          notes: notes.trim(),
        },
      };

      await createRecord(recordData);

      // 重置表单
      setSleepDuration(60);
      setQuality(3);
      setNotes('');

      // 关闭弹窗
      onClose();

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('提交睡眠记录失败:', error);
      // 这里可以添加错误提示
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecordModal isOpen={isOpen} onClose={onClose} title="记录睡眠">
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
              className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5CAE9] focus:ring-offset-0"
              style={{ colorScheme: 'light' }}
            />
            {/* 移除自定义时钟图标，使用浏览器原生图标 */}
          </div>
        </div>

        {/* 睡眠时长 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            睡眠时长
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(Number(e.target.value))}
              min={1}
              className="flex-1 p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5CAE9] focus:ring-offset-0"
            />
            <span className="text-[#666666]">分钟</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {durationOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSleepDuration(option)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  sleepDuration === option
                    ? 'bg-[#C5CAE9] text-[#3F51B5]'
                    : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                }`}
              >
                {option} 分钟
              </button>
            ))}
          </div>
        </div>

        {/* 睡眠质量 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            睡眠质量
          </label>
          <div className="flex space-x-3">
            {qualityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setQuality(option.value as any)}
                className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  quality === option.value
                    ? 'bg-[#C5CAE9]/20 border-[#C5CAE9] text-[#3F51B5]'
                    : 'border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`text-2xl mb-1 ${
                    quality === option.value
                      ? 'text-[#3F51B5]'
                      : 'text-[#999999]'
                  }`}
                />
                <span>{option.label}</span>
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
            className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5CAE9] focus:ring-offset-0 resize-none h-24"
          />
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 mt-3 text-white bg-[#7986CB] rounded-lg hover:bg-[#5C6BC0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3F51B5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '保存记录'}
        </button>
      </div>
    </RecordModal>
  );
};

export default SleepRecord;
