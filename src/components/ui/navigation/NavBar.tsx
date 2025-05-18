import React from 'react';

interface NavBarProps {
  title?: React.ReactNode;
  onBack?: () => void;
  right?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  fixed?: boolean;
  border?: boolean;
  safeArea?: boolean; // 是否考虑顶部安全区域（针对移动端）
}

const NavBar: React.FC<NavBarProps> = ({
  title,
  onBack,
  right,
  className = '',
  titleClassName = '',
  fixed = false,
  border = true,
  safeArea = true,
}) => {
  return (
    <div
      className={`flex items-center h-[56px] ${
        safeArea ? 'pt-safe-top' : ''
      } px-4 bg-white 
        ${border ? 'border-b border-gray-200' : ''} 
        ${fixed ? 'fixed top-0 left-0 right-0' : 'relative'} 
        shadow-sm z-10 ${className}`}
    >
      {onBack ? (
        <button
          className="flex items-center justify-center w-10 h-10 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={onBack}
          aria-label="返回"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <div className="w-10 h-10 mr-2" />
      )}

      <div
        className={`flex-1 text-lg font-semibold text-gray-900 text-center truncate select-none ${titleClassName}`}
      >
        {title}
      </div>

      <div className="min-w-[40px] flex justify-end items-center">{right}</div>
    </div>
  );
};

export default NavBar;
