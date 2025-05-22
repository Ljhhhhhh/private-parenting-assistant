import React, { useState } from 'react';
import RecordModal from './RecordModal';
import { createRecord } from '@/api/records';
import { CreateRecordDto, RecordType, GrowthDetails } from '@/types/models';

interface GrowthRecordProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  onSuccess?: () => void;
}

/**
 * 成长趋势记录组件
 */
const GrowthRecord: React.FC<GrowthRecordProps> = ({
  isOpen,
  onClose,
  childId,
  onSuccess,
}) => {
  // 记录时间
  const [recordTime, setRecordTime] = useState<string>(
    new Date().toISOString().slice(0, 16),
  );

  // 身高（厘米）
  const [height, setHeight] = useState<number | undefined>(undefined);

  // 体重（千克）
  const [weight, setWeight] = useState<number | undefined>(undefined);

  // 头围（厘米）
  const [headCircumference, setHeadCircumference] = useState<
    number | undefined
  >(undefined);

  // 备注
  const [notes, setNotes] = useState<string>('');

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 提交记录
  const handleSubmit = async () => {
    // 至少需要一项测量数据
    if (
      height === undefined &&
      weight === undefined &&
      headCircumference === undefined
    ) {
      // 可以添加验证提示
      return;
    }

    try {
      setIsSubmitting(true);

      const details: GrowthDetails = {};

      // 只添加有值的字段
      if (height !== undefined) {
        details.height = height;
      }

      if (weight !== undefined) {
        details.weight = weight;
      }

      if (headCircumference !== undefined) {
        details.headCircumference = headCircumference;
      }

      if (notes.trim()) {
        details.notes = notes.trim();
      }

      const recordData: CreateRecordDto = {
        childId,
        recordType: RecordType.GROWTH,
        recordTimestamp: new Date(recordTime).toISOString(),
        details,
      };

      await createRecord(recordData);

      // 重置表单
      setHeight(undefined);
      setWeight(undefined);
      setHeadCircumference(undefined);
      setNotes('');

      // 关闭弹窗
      onClose();

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('提交成长记录失败:', error);
      // 这里可以添加错误提示
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecordModal isOpen={isOpen} onClose={onClose} title="记录成长">
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
              className="w-full p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81C784] focus:ring-offset-0"
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>

        {/* 身高 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            身高（可选）
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={height === undefined ? '' : height}
              onChange={(e) =>
                setHeight(e.target.value ? Number(e.target.value) : undefined)
              }
              min={0}
              step={0.1}
              placeholder="输入宝宝身高"
              className="flex-1 p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81C784] focus:ring-offset-0"
            />
            <span className="text-[#666666]">厘米</span>
          </div>
        </div>

        {/* 体重 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            体重（可选）
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={weight === undefined ? '' : weight}
              onChange={(e) =>
                setWeight(e.target.value ? Number(e.target.value) : undefined)
              }
              min={0}
              step={0.01}
              placeholder="输入宝宝体重"
              className="flex-1 p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81C784] focus:ring-offset-0"
            />
            <span className="text-[#666666]">千克</span>
          </div>
        </div>

        {/* 头围 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#333333]">
            头围（可选）
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={headCircumference === undefined ? '' : headCircumference}
              onChange={(e) =>
                setHeadCircumference(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              min={0}
              step={0.1}
              placeholder="输入宝宝头围"
              className="flex-1 p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81C784] focus:ring-offset-0"
            />
            <span className="text-[#666666]">厘米</span>
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
            className="w-full p-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#81C784] focus:ring-offset-0 resize-none h-24"
          />
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (height === undefined &&
              weight === undefined &&
              headCircumference === undefined)
          }
          className="w-full py-3 mt-3 text-white bg-[#81C784] rounded-lg hover:bg-[#66BB6A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '保存记录'}
        </button>
      </div>
    </RecordModal>
  );
};

export default GrowthRecord;
