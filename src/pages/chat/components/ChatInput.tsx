import React from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui';
import { isEmptyMessage } from '../utils/messageUtils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onOpenSidebar?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  onOpenSidebar,
  disabled = false,
  isLoading = false,
}) => {
  return (
    <div className="p-4 bg-white border-t border-[#E0E0E0] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex gap-3 items-center">
        {/* 打开会话列表按钮 */}
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[#F5F5F5] transition-colors"
            aria-label="打开会话列表"
          >
            <Icon
              icon="solar:list-linear"
              width={28}
              height={28}
              className="text-[#666666]"
            />
          </button>
        )}

        {/* 输入框 */}
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="请输入您的问题..."
            className="w-full py-3 px-4 rounded-3xl border-[#E0E0E0] focus:border-[#FFB38A] transition-all resize-none"
            disabled={disabled}
          />
        </div>

        {/* 发送按钮 */}
        <button
          onClick={onSend}
          disabled={isEmptyMessage(value) || disabled}
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isEmptyMessage(value) || disabled
              ? 'bg-[#E0E0E0] text-white cursor-not-allowed'
              : 'bg-gradient-to-br from-[#FFB38A] to-[#FFC9A8] text-white shadow-sm hover:shadow-md active:scale-95 relative overflow-hidden group'
          }`}
        >
          {isLoading ? (
            <Icon
              icon="ph:spinner"
              width={20}
              height={20}
              className="animate-spin"
            />
          ) : (
            <div className="relative transition-transform duration-300 transform group-hover:rotate-12">
              <Icon icon="ph:paper-plane-right-fill" width={20} height={20} />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
