import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import RecordModal from './RecordModal';
import { createRecord } from '@/api/records';
import { CreateRecordDto } from '@/types/models';

interface DiaperRecordProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  onSuccess?: () => void;
}

/**
 * 尿布记录组件
 */
const DiaperRecord: React.FC<DiaperRecordProps> = ({
  isOpen,
  onClose,
  childId,
  onSuccess,
}) => {
  // 记录时间
  const [recordTime, setRecordTime] = useState<string>(
    new Date().toISOString().slice(0, 16),
  );

  // 尿布类型
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both'>('wet');

  // 状态
  const [condition, setCondition] = useState<'normal' | 'abnormal'>('normal');

  // 备注
  const [notes, setNotes] = useState<string>('');

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 尿布类型选项
  const diaperTypeOptions = [
    { value: 'wet', label: '尿尿', icon: 'mdi:water-outline' },
    { value: 'dirty', label: '便便', icon: 'mdi:emoticon' },
    { value: 'both', label: '混合', icon: 'mdi:water-plus' },
  ];

  // 状态选项
  const conditionOptions = [
    { value: 'normal', label: '正常', icon: 'mdi:check-circle-outline' },
    { value: 'abnormal', label: '异常', icon: 'mdi:alert-circle-outline' },
  ];

  // 提交记录
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const recordData: CreateRecordDto = {
        childId,
        recordType: 'Diaper',
        recordTimestamp: new Date(recordTime).toISOString(),
        details: {
          diaperType,
          condition,
          notes: notes.trim(),
        },
      };

      await createRecord(recordData);

      // 重置表单
      setDiaperType('wet');
      setCondition('normal');
      setNotes('');

      // 关闭弹窗
      onClose();

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('提交尿布记录失败:', error);
      // 这里可以添加错误提示
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecordModal isOpen={isOpen} onClose={onClose} title="记录尿布">
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
              className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BCAAA4] focus:ring-offset-0"
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>

        {/* 尿布类型 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            尿布类型
          </label>
          <div className="flex space-x-3">
            {diaperTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDiaperType(option.value as any)}
                className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  diaperType === option.value
                    ? 'bg-[#BCAAA4]/20 border-[#BCAAA4] text-[#8D6E63]'
                    : 'border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`text-2xl mb-1 ${
                    diaperType === option.value
                      ? 'text-[#8D6E63]'
                      : 'text-[#999999]'
                  }`}
                />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 状态 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            状态
          </label>
          <div className="flex space-x-3">
            {conditionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCondition(option.value as any)}
                className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  condition === option.value
                    ? 'bg-[#BCAAA4]/20 border-[#BCAAA4] text-[#8D6E63]'
                    : 'border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`text-2xl mb-1 ${
                    condition === option.value
                      ? 'text-[#8D6E63]'
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
            className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BCAAA4] focus:ring-offset-0 resize-none h-24"
          />
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 mt-3 text-white bg-[#8D6E63] rounded-lg hover:bg-[#795548] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8D6E63] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '保存记录'}
        </button>
      </div>
    </RecordModal>
  );
};

export default DiaperRecord;
