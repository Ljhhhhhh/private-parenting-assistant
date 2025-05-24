/**
 * 💡 智能消息输入组件
 *
 * @description
 * 智能消息输入框，支持自适应高度、键盘快捷键、智能建议等功能
 * 提供出色的输入体验和无障碍访问支持
 *
 * @author Chat Team
 * @since 1.0.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

// ========== 类型定义 ==========

export interface SmartMessageInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  suggestions?: string[];
  onSend: (message: string) => void | Promise<void>;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  showCounter?: boolean;
  showSuggestions?: boolean;
  enableShortcuts?: boolean;
}

export interface SendButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

// ========== 子组件 ==========

const SendButton: React.FC<SendButtonProps> = ({
  disabled,
  loading,
  onClick,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      p-2.5 rounded-xl transition-all duration-200 
      ${
        disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg'
      }
    `}
    title="发送消息 (Cmd+Enter)"
    aria-label="发送消息"
  >
    {loading ? (
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    ) : (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    )}
  </button>
);

// ========== 主组件 ==========

export const SmartMessageInput: React.FC<SmartMessageInputProps> = ({
  value: controlledValue,
  placeholder = '输入消息... (Cmd+Enter发送)',
  disabled = false,
  loading = false,
  maxLength = 1000,
  minRows = 1,
  maxRows = 6,
  suggestions = [],
  onSend,
  onChange,
  onFocus,
  onBlur,
  className = '',
  showCounter = true,
  showSuggestions = true,
  enableShortcuts = true,
}) => {
  // 状态管理
  const [internalValue, setInternalValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用受控值或内部状态
  const currentValue =
    controlledValue !== undefined ? controlledValue : internalValue;
  const canSend = currentValue.trim().length > 0 && !disabled && !isComposing;

  /**
   * 自适应高度调整
   */
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 重置高度以获取准确的scrollHeight
    textarea.style.height = 'auto';

    // 计算行高
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseInt(computedStyle.lineHeight);
    const paddingTop = parseInt(computedStyle.paddingTop);
    const paddingBottom = parseInt(computedStyle.paddingBottom);

    // 计算最小和最大高度
    const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

    // 设置高度
    const newHeight = Math.max(
      minHeight,
      Math.min(maxHeight, textarea.scrollHeight),
    );
    textarea.style.height = `${newHeight}px`;
  }, [minRows, maxRows]);

  /**
   * 处理值变化
   */
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (newValue.length > maxLength) {
        newValue = newValue.slice(0, maxLength);
      }

      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);

      // 调整高度
      setTimeout(adjustHeight, 0);

      // 显示/隐藏建议面板
      if (showSuggestions && suggestions.length > 0) {
        setShowSuggestionPanel(newValue.length > 2);
        setSelectedSuggestionIndex(-1);
      }
    },
    [
      controlledValue,
      onChange,
      adjustHeight,
      maxLength,
      showSuggestions,
      suggestions.length,
    ],
  );

  /**
   * 发送消息
   */
  const handleSend = useCallback(async () => {
    if (!canSend) return;

    const messageToSend = currentValue.trim();

    // 清空输入框
    handleValueChange('');
    setShowSuggestionPanel(false);
    setSelectedSuggestionIndex(-1);

    try {
      await onSend(messageToSend);
    } catch (error) {
      console.error('发送消息失败:', error);
      // 发送失败时恢复输入内容
      handleValueChange(messageToSend);
    }
  }, [canSend, currentValue, handleValueChange, onSend]);

  /**
   * 应用建议
   */
  const applySuggestion = useCallback(
    (suggestion: string) => {
      handleValueChange(suggestion);
      setShowSuggestionPanel(false);
      setSelectedSuggestionIndex(-1);
      textareaRef.current?.focus();
    },
    [handleValueChange],
  );

  /**
   * 键盘事件处理
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // 输入法组合状态下不处理快捷键
      if (isComposing) return;

      if (enableShortcuts) {
        // Cmd/Ctrl + Enter 发送
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          handleSend();
          return;
        }

        // 建议面板导航
        if (showSuggestionPanel && suggestions.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : 0,
            );
            return;
          }

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) =>
              prev > 0 ? prev - 1 : suggestions.length - 1,
            );
            return;
          }

          if (e.key === 'Tab' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            applySuggestion(suggestions[selectedSuggestionIndex]);
            return;
          }

          if (e.key === 'Escape') {
            e.preventDefault();
            setShowSuggestionPanel(false);
            setSelectedSuggestionIndex(-1);
            return;
          }
        }
      }

      // Enter 发送（非Shift+Enter）
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [
      isComposing,
      enableShortcuts,
      handleSend,
      showSuggestionPanel,
      suggestions,
      selectedSuggestionIndex,
      applySuggestion,
    ],
  );

  /**
   * 输入法状态处理
   */
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => setIsComposing(false);

  /**
   * 输入框聚焦失焦处理
   */
  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    // 延迟隐藏建议面板，给点击建议的时间
    setTimeout(() => {
      setShowSuggestionPanel(false);
      setSelectedSuggestionIndex(-1);
    }, 200);

    onBlur?.();
  };

  /**
   * 初始化高度调整
   */
  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  /**
   * 值变化时调整高度
   */
  useEffect(() => {
    adjustHeight();
  }, [currentValue, adjustHeight]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 建议面板 */}
      {showSuggestionPanel && showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-2">智能建议</div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${
                    index === selectedSuggestionIndex
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
                onClick={() => applySuggestion(suggestion)}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex items-end gap-3 p-4 bg-white border-t border-gray-200">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              text-sm leading-relaxed transition-all duration-200
            `}
            style={{
              minHeight: `${20 * minRows + 24}px`, // line-height * rows + padding
              maxHeight: `${20 * maxRows + 24}px`,
            }}
            rows={minRows}
            data-message-input // 用于无障碍访问定位
          />

          {/* 字数统计 */}
          {showCounter && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
              {currentValue.length}/{maxLength}
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <SendButton
          disabled={!canSend}
          loading={loading}
          onClick={handleSend}
        />
      </div>

      {/* 快捷键提示 */}
      {enableShortcuts && (
        <div className="px-4 pb-2 text-xs text-gray-400">
          <span>快捷键: </span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">⌘Enter</kbd>
          <span> 发送, </span>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
            Shift+Enter
          </kbd>
          <span> 换行</span>
          {showSuggestions && suggestions.length > 0 && (
            <>
              <span>, </span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Tab</kbd>
              <span> 选择建议</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
