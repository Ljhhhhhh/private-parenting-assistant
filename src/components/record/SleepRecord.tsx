import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import RecordModal from './RecordModal';
import { createRecord } from '@/api/records';
import { CreateRecordDto, RecordType, SleepDetails } from '@/types/models';

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

  // 睡眠时长（格式为小时:minute）
  const [sleepDuration, setSleepDuration] = useState<string>('1:00');

  // 睡眠质量
  const [quality, setQuality] = useState<number>(3);

  // 睡眠环境
  const [environment, setEnvironment] = useState<string>('');

  // 备注
  const [notes, setNotes] = useState<string>('');

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 预设时长选项
  const durationOptions = [
    { minutes: 30, display: '0:30' },
    { minutes: 60, display: '1:00' },
    { minutes: 90, display: '1:30' },
    { minutes: 120, display: '2:00' },
    { minutes: 150, display: '2:30' },
    { minutes: 180, display: '3:00' },
  ];

  // 睡眠质量选项
  const qualityOptions = [
    { value: 5, label: '良好', icon: 'mdi:emoticon' },
    { value: 3, label: '一般', icon: 'mdi:emoticon-neutral' },
    { value: 1, label: '较差', icon: 'mdi:emoticon-sad' },
  ];

  // 睡眠环境选项
  // const environmentOptions = [
  //   { value: '安静', label: '安静', icon: 'mdi:volume-off' },
  //   { value: '有噪音', label: '有噪音', icon: 'mdi:volume-medium' },
  //   { value: '舒适', label: '舒适', icon: 'mdi:sofa' },
  //   { value: '不舒适', label: '不舒适', icon: 'mdi:sofa-outline' },
  // ];

  // 提交记录
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const details: SleepDetails = {
        sleepDuration,
        notes: notes.trim(),
      };

      // 只有当选择了质量时才添加
      if (quality) {
        details.quality = quality;
      }

      // 只有当选择了环境时才添加
      if (environment) {
        details.environment = environment;
      }

      const recordData: CreateRecordDto = {
        childId,
        recordType: RecordType.SLEEP,
        recordTimestamp: new Date(recordTime).toISOString(),
        details,
      };

      await createRecord(recordData);

      // 重置表单
      setSleepDuration('1:00');
      setQuality(3);
      setEnvironment('');
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
              type="text"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(e.target.value)}
              placeholder="格式: 1:30"
              className="flex-1 p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5CAE9] focus:ring-offset-0"
            />
            <span className="text-[#666666]">小时:分钟</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {durationOptions.map((option) => (
              <button
                key={option.minutes}
                onClick={() => setSleepDuration(option.display)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  sleepDuration === option.display
                    ? 'bg-[#C5CAE9] text-[#3F51B5]'
                    : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                }`}
              >
                {option.display}
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

        {/* 睡眠环境 */}
        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            睡眠环境（可选）
          </label>
          <div className="flex flex-wrap gap-2">
            {environmentOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setEnvironment(option.value)}
                className={`px-3 py-1.5 rounded-full flex items-center transition-colors ${
                  environment === option.value
                    ? 'bg-[#C5CAE9]/20 border border-[#C5CAE9] text-[#3F51B5]'
                    : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`mr-1 ${
                    environment === option.value ? 'text-[#3F51B5]' : 'text-[#999999]'
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
            className="w-full p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5CAE9] focus:ring-offset-0 resize-none h-24"
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
