import React from 'react';
import { Icon } from '@iconify/react';
import { AutoResizeTextarea } from '@/components/ui';
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
      {/* 主输入区域 */}
      <div className="flex items-end gap-3">
        {/* 侧边栏按钮 */}
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-[#F5F5F5] transition-colors flex items-center justify-center mb-1"
            aria-label="打开会话列表"
          >
            <Icon
              icon="solar:list-linear"
              width={22}
              height={22}
              className="text-[#666666]"
            />
          </button>
        )}

        {/* 输入框容器 */}
        <div className="flex-1 relative bg-[#F8F9FA] rounded-2xl border border-[#E0E0E0] focus-within:border-[#FFB38A] focus-within:bg-white transition-all duration-200">
          <AutoResizeTextarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // 处理键盘事件：Enter发送，Shift+Enter换行
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isEmptyMessage(value) && !disabled) {
                  onSend();
                }
              } else {
                onKeyPress(e);
              }
            }}
            placeholder="请输入您的问题..."
            disabled={disabled}
            minHeight={44}
            maxHeight={120}
            className="bg-transparent border-0 focus:ring-0 focus:border-0 pr-12 py-3"
          />

          {/* 发送按钮 */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              onClick={onSend}
              disabled={isEmptyMessage(value) || disabled}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isEmptyMessage(value) || disabled
                  ? 'bg-[#E0E0E0] text-[#999999] cursor-not-allowed'
                  : 'bg-gradient-to-br from-[#FFB38A] to-[#FFC9A8] text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group'
              }`}
            >
              {isLoading ? (
                <Icon
                  icon="ph:spinner"
                  width={16}
                  height={16}
                  className="animate-spin"
                />
              ) : (
                <div className="relative transition-transform duration-300 transform group-hover:translate-x-0.5">
                  <Icon
                    icon="ph:paper-plane-right-fill"
                    width={16}
                    height={16}
                  />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
