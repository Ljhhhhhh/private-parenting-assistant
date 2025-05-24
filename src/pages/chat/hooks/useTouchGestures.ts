import { useCallback, useRef, useEffect } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  onTap?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
}

interface TouchGestureResult {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}

/**
 * 移动端触摸手势Hook
 * 支持滑动、长按、轻点等手势识别
 */
export const useTouchGestures = (
  options: TouchGestureOptions,
): TouchGestureResult => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onLongPress,
    onTap,
    swipeThreshold = 50,
    longPressDelay = 500,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMovingRef = useRef(false);

  // 清理长按定时器
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // 触摸开始
  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      isMovingRef.current = false;

      // 设置长按定时器
      if (onLongPress) {
        clearLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
          if (!isMovingRef.current && touchStartRef.current) {
            onLongPress();
            touchStartRef.current = null; // 阻止后续事件
          }
        }, longPressDelay);
      }
    },
    [onLongPress, longPressDelay, clearLongPressTimer],
  );

  // 触摸移动
  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

      // 如果移动距离超过阈值，认为是移动手势
      if (deltaX > 10 || deltaY > 10) {
        isMovingRef.current = true;
        clearLongPressTimer();
      }
    },
    [clearLongPressTimer],
  );

  // 触摸结束
  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      clearLongPressTimer();

      if (!touchStartRef.current) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // 重置状态
      touchStartRef.current = null;
      isMovingRef.current = false;

      // 如果是快速轻点（短时间内且移动距离小）
      if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        if (onTap) {
          onTap();
          return;
        }
      }

      // 判断滑动手势
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > swipeThreshold
      ) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    },
    [onSwipeLeft, onSwipeRight, onTap, swipeThreshold, clearLongPressTimer],
  );

  // 清理定时器
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

/**
 * 消息滑动操作Hook
 * 专门用于消息列表的滑动操作
 */
export const useMessageSwipeGestures = (
  onReply?: () => void,
  onShare?: () => void,
  onCopy?: () => void,
) => {
  return useTouchGestures({
    onSwipeLeft: onReply,
    onSwipeRight: onShare,
    onLongPress: onCopy,
    swipeThreshold: 80,
    longPressDelay: 600,
  });
};

/**
 * 侧边栏滑动手势Hook
 * 用于侧边栏的滑动打开/关闭
 */
export const useSidebarSwipeGestures = (
  onOpen?: () => void,
  onClose?: () => void,
) => {
  return useTouchGestures({
    onSwipeRight: onOpen,
    onSwipeLeft: onClose,
    swipeThreshold: 60,
  });
};
