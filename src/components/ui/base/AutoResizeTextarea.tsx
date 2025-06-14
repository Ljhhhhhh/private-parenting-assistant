import React, { useEffect, useRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

export const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, minHeight = 48, maxHeight = 120, ...props }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const combinedRef = ref || textareaRef;

  const adjustHeight = () => {
    const textarea =
      typeof combinedRef === 'function'
        ? textareaRef.current
        : combinedRef?.current;
    if (!textarea) return;

    // 如果没有内容，直接设置为最小高度
    if (!textarea.value.trim()) {
      textarea.style.height = `${minHeight}px`;
      textarea.style.overflowY = 'hidden';
      return;
    }

    // 临时设置高度为最小值，然后获取scrollHeight
    textarea.style.height = `${minHeight}px`;

    // 计算实际需要的高度
    const scrollHeight = textarea.scrollHeight;

    // 如果scrollHeight小于等于minHeight，说明内容不多，使用minHeight
    if (scrollHeight <= minHeight) {
      textarea.style.height = `${minHeight}px`;
      textarea.style.overflowY = 'hidden';
      return;
    }

    // 计算新高度，限制在minHeight和maxHeight之间
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // 如果内容超出最大高度，显示滚动条
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value, minHeight, maxHeight]);

  // 初始化时设置最小高度
  useEffect(() => {
    const textarea =
      typeof combinedRef === 'function'
        ? textareaRef.current
        : combinedRef?.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
      textarea.style.overflowY = 'hidden';
    }
  }, [minHeight]);

  return (
    <textarea
      ref={combinedRef}
      className={cn(
        'w-full resize-none transition-all duration-200 ease-out',
        'border border-[#E0E0E0] rounded-2xl px-4 py-3',
        'focus:border-[#FFB38A] focus:outline-none focus:ring-1 focus:ring-[#FFB38A]/20',
        'placeholder:text-[#999999] text-[#333333]',
        'disabled:bg-[#F5F5F5] disabled:text-[#CCCCCC] disabled:cursor-not-allowed',
        'custom-scrollbar',
        className,
      )}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
        lineHeight: '1.5',
      }}
      onInput={adjustHeight}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
