import { useEffect, RefObject } from 'react';

/**
 * 处理点击元素外部的事件
 * @param ref 元素引用
 * @param isOpen 元素是否打开
 * @param onClose 关闭元素的回调函数
 */
export const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, isOpen, onClose]);
};
