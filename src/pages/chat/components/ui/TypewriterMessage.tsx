/**
 * ⌨️ 打字机效果消息组件
 *
 * @description
 * 提供流式文本的打字机效果展示，增强用户体验
 * 支持可变速度、暂停、恢复等功能
 *
 * @author Chat Team
 * @since 1.0.0
 */

import React, { useState, useEffect, useRef, memo } from 'react';

// ========== 类型定义 ==========

export interface TypewriterMessageProps {
  content: string;
  speed?: number; // 字符显示间隔（毫秒）
  isActive?: boolean; // 是否激活打字机效果
  onComplete?: () => void; // 完成回调
  onProgress?: (progress: number) => void; // 进度回调
  className?: string;
  showCursor?: boolean; // 是否显示光标
  pauseOnHover?: boolean; // 鼠标悬停时暂停
}

// ========== 组件实现 ==========

export const TypewriterMessage: React.FC<TypewriterMessageProps> = memo(
  ({
    content,
    speed = 50,
    isActive = true,
    onComplete,
    onProgress,
    className = '',
    showCursor = true,
    pauseOnHover = false,
  }) => {
    const [displayedContent, setDisplayedContent] = useState<string>('');
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isCompleted, setIsCompleted] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const pausedRef = useRef<boolean>(false);

    /**
     * 清理定时器
     */
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    /**
     * 重置状态
     */
    const resetState = () => {
      setDisplayedContent('');
      setCurrentIndex(0);
      setIsCompleted(false);
      setIsPaused(false);
      clearTimer();
    };

    /**
     * 立即显示所有内容
     */
    const showAll = () => {
      clearTimer();
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      setIsCompleted(true);

      onProgress?.(100);
      onComplete?.();
    };

    /**
     * 暂停打字机效果
     */
    const pause = () => {
      pausedRef.current = true;
      setIsPaused(true);
      clearTimer();
    };

    /**
     * 恢复打字机效果
     */
    const resume = () => {
      pausedRef.current = false;
      setIsPaused(false);
    };

    /**
     * 打字机核心逻辑
     */
    useEffect(() => {
      if (!isActive || isCompleted || currentIndex >= content.length) {
        if (currentIndex >= content.length && !isCompleted) {
          setIsCompleted(true);
          onComplete?.();
        }
        return;
      }

      if (pausedRef.current) {
        return;
      }

      timerRef.current = setTimeout(() => {
        const nextChar = content[currentIndex];
        setDisplayedContent((prev) => prev + nextChar);
        setCurrentIndex((prev) => prev + 1);

        // 计算进度
        const progress = ((currentIndex + 1) / content.length) * 100;
        onProgress?.(progress);
      }, speed);

      return clearTimer;
    }, [
      content,
      currentIndex,
      speed,
      isActive,
      isCompleted,
      onComplete,
      onProgress,
    ]);

    /**
     * 内容变化时重置
     */
    useEffect(() => {
      if (content !== displayedContent.slice(0, content.length)) {
        resetState();
      }
    }, [content]);

    /**
     * 鼠标悬停处理
     */
    const handleMouseEnter = () => {
      if (pauseOnHover && !isCompleted) {
        pause();
      }
    };

    const handleMouseLeave = () => {
      if (pauseOnHover && !isCompleted) {
        resume();
      }
    };

    /**
     * 点击立即显示全部
     */
    const handleClick = () => {
      if (!isCompleted && isActive) {
        showAll();
      }
    };

    /**
     * 获取光标样式
     */
    const getCursorStyle = () => {
      if (!showCursor) return '';

      if (isCompleted) {
        return 'opacity-0';
      }

      if (isPaused) {
        return 'opacity-50';
      }

      return 'animate-pulse';
    };

    return (
      <div
        className={`relative ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="text"
        aria-live="polite"
        aria-label="AI正在回复"
      >
        {/* 文本内容 */}
        <span className="whitespace-pre-wrap text-sm leading-relaxed">
          {isActive ? displayedContent : content}
        </span>

        {/* 打字机光标 */}
        {showCursor && isActive && (
          <span
            className={`
            inline-block w-0.5 h-4 ml-1 bg-blue-500 rounded-sm
            transition-opacity duration-200
            ${getCursorStyle()}
          `}
          />
        )}

        {/* 进度提示 */}
        {isActive && !isCompleted && (
          <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>
                AI正在回复...
                {pauseOnHover && (
                  <span className="text-gray-300 ml-1">(点击查看全部)</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* 完成提示 */}
        {isCompleted && isActive && (
          <div className="absolute -bottom-6 left-0 text-xs text-green-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>回复完成</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

TypewriterMessage.displayName = 'TypewriterMessage';

// ========== 使用示例组件 ==========

export interface StreamingMessageWrapperProps {
  content: string;
  isStreaming: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * 流式消息包装组件
 * 根据流式状态自动切换显示模式
 */
export const StreamingMessageWrapper: React.FC<StreamingMessageWrapperProps> =
  memo(({ content, isStreaming, onComplete, className = '' }) => {
    return (
      <div className={`relative ${className}`}>
        {isStreaming ? (
          <TypewriterMessage
            content={content}
            speed={30} // 较快的速度适合流式场景
            isActive={true}
            onComplete={onComplete}
            showCursor={true}
            pauseOnHover={true}
            className="min-h-[1.5rem]" // 确保有最小高度
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </div>
        )}

        {/* 流式状态指示器 */}
        {isStreaming && (
          <div className="absolute top-0 right-0 -mt-2 -mr-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg" />
          </div>
        )}
      </div>
    );
  });

StreamingMessageWrapper.displayName = 'StreamingMessageWrapper';
