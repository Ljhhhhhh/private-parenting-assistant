import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import RecordModal from './RecordModal';
import { createRecord } from '@/api/records';
import { CreateRecordDto, RecordType, DiaperDetails } from '@/types/models';

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

  // 尿布状态
  const [hasUrine, setHasUrine] = useState<boolean>(true);
  const [hasStool, setHasStool] = useState<boolean>(false);

  // 便便颜色和质地
  const [stoolColor, setStoolColor] = useState<string>('');
  const [stoolConsistency, setStoolConsistency] = useState<string>('');

  // 皮疹状态
  const [rashStatus, setRashStatus] = useState<string>('');

  // 备注
  const [notes, setNotes] = useState<string>('');

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 便便颜色选项
  // const stoolColorOptions = [
  //   { value: '黄色', label: '黄色', color: '#FFD700' },
  //   { value: '绿色', label: '绿色', color: '#32CD32' },
  //   { value: '褐色', label: '褐色', color: '#8B4513' },
  //   { value: '黑色', label: '黑色', color: '#2F4F4F' },
  //   { value: '白色', label: '白色', color: '#F5F5F5' },
  // ];

  // 便便质地选项
  const stoolConsistencyOptions = [
    { value: '软', label: '软' },
    { value: '硬', label: '硬' },
    { value: '水状', label: '水状' },
    { value: '糊状', label: '糊状' },
  ];

  // 皮疹状态选项
  // const rashStatusOptions = [
  //   { value: '无', label: '无', icon: 'mdi:check-circle-outline' },
  //   { value: '轻微', label: '轻微', icon: 'mdi:alert-circle-outline' },
  //   { value: '严重', label: '严重', icon: 'mdi:alert-outline' },
  // ];

  // 提交记录
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const details: DiaperDetails = {
        hasUrine,
        hasStool,
        notes: notes.trim(),
      };

      // 只有当有便便时才添加便便相关信息
      if (hasStool) {
        if (stoolColor) details.stoolColor = stoolColor;
        if (stoolConsistency) details.stoolConsistency = stoolConsistency;
      }

      // 只有选择了皮疹状态时才添加
      if (rashStatus && rashStatus !== '无') {
        details.rashStatus = rashStatus;
      }

      const recordData: CreateRecordDto = {
        childId,
        recordType: RecordType.DIAPER,
        recordTimestamp: new Date(recordTime).toISOString(),
        details,
      };

      await createRecord(recordData);

      // 重置表单
      setHasUrine(true);
      setHasStool(false);
      setStoolColor('');
      setStoolConsistency('');
      setRashStatus('');
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
              className="w-full p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BCAAA4] focus:ring-offset-0"
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>

        {/* 尿布状态 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            尿布状态
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setHasUrine(!hasUrine)}
              className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                hasUrine
                  ? 'bg-[#BCAAA4]/20 border-[#BCAAA4] text-[#8D6E63]'
                  : 'border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F5]'
              }`}
            >
              <Icon
                icon="mdi:water-outline"
                className={`text-2xl mb-1 ${
                  hasUrine ? 'text-[#8D6E63]' : 'text-[#999999]'
                }`}
              />
              <span>尿尿 {hasUrine ? '✓' : ''}</span>
            </button>
            <button
              onClick={() => setHasStool(!hasStool)}
              className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                hasStool
                  ? 'bg-[#BCAAA4]/20 border-[#BCAAA4] text-[#8D6E63]'
                  : 'border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F5]'
              }`}
            >
              <Icon
                icon="mdi:emoticon"
                className={`text-2xl mb-1 ${
                  hasStool ? 'text-[#8D6E63]' : 'text-[#999999]'
                }`}
              />
              <span>便便 {hasStool ? '✓' : ''}</span>
            </button>
          </div>
        </div>

        {/* 便便颜色 - 只在有便便时显示 */}
        {/* {hasStool && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#333333]">
              便便颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {stoolColorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStoolColor(option.value)}
                  className={`px-3 py-1.5 rounded-full flex items-center transition-colors ${
                    stoolColor === option.value
                      ? 'bg-[#BCAAA4]/20 border border-[#BCAAA4] text-[#8D6E63]'
                      : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: option.color }}
                  ></div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )} */}

        {/* 便便质地 - 只在有便便时显示 */}
        {hasStool && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#333333]">
              便便质地
            </label>
            <div className="flex flex-wrap gap-2">
              {stoolConsistencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStoolConsistency(option.value)}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    stoolConsistency === option.value
                      ? 'bg-[#BCAAA4]/20 border border-[#BCAAA4] text-[#8D6E63]'
                      : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 皮疹状态 */}
        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            皮疹状态
          </label>
          <div className="flex space-x-3">
            {rashStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRashStatus(option.value)}
                className={`flex-1 flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  rashStatus === option.value
                    ? 'bg-[#BCAAA4]/20 border-[#BCAAA4] text-[#8D6E63]'
                    : 'border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F5]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`text-2xl mb-1 ${
                    rashStatus === option.value
                      ? 'text-[#8D6E63]'
                      : 'text-[#999999]'
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
            className="w-full p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BCAAA4] focus:ring-offset-0 resize-none h-24"
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
