import React, { ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * 通用记录弹窗组件
 */
const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/40"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative p-5 mx-4 w-full max-w-md bg-white rounded-xl shadow-lg animate-fadeIn">
        {/* 弹窗标题 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#333333]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#999999] hover:text-[#666666] transition-colors"
          >
            <Icon icon="mdi:close" className="text-2xl" />
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="max-h-[70vh] overflow-y-auto px-1">{children}</div>
      </div>
    </div>
  );
};

export default RecordModal;
