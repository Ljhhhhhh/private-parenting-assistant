import React from 'react';

type TagType = 'default' | 'primary' | 'success' | 'warning' | 'error';
type TagSize = 'small' | 'medium';

interface TagProps {
  children: React.ReactNode;
  type?: TagType;
  size?: TagSize;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  className?: string;
  closable?: boolean;
  onClose?: () => void;
}

const Tag: React.FC<TagProps> = ({
  children,
  type = 'default',
  size = 'medium',
  selectable = false,
  selected = false,
  onSelect,
  className = '',
  closable = false,
  onClose,
}) => {
  // 基本类，处理高度和字体
  const baseClass = `
    inline-flex items-center 
    ${size === 'small' ? 'h-6 px-2 text-xs' : 'h-8 px-3 text-sm'} 
    rounded-tag
    transition-all duration-200
  `;

  // 类型类，处理颜色
  let typeClass = '';

  // 可选择标签样式
  if (selectable) {
    typeClass = selected
      ? 'bg-primary text-white'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
  // 普通标签样式
  else {
    switch (type) {
      case 'primary':
        typeClass =
          'bg-primary-light/10 text-primary border border-primary-light/30';
        break;
      case 'success':
        typeClass = 'bg-success/10 text-success border border-success/30';
        break;
      case 'warning':
        typeClass = 'bg-warning/10 text-warning border border-warning/30';
        break;
      case 'error':
        typeClass = 'bg-error/10 text-error border border-error/30';
        break;
      default:
        typeClass = 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  // 处理点击事件
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(!selected);
    }
  };

  // 处理关闭事件
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <span
      className={`${baseClass} ${typeClass} ${
        selectable ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={handleClick}
    >
      <span>{children}</span>

      {closable && (
        <span
          className="ml-1 cursor-pointer hover:text-opacity-80"
          onClick={handleClose}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      )}
    </span>
  );
};

export default Tag;
