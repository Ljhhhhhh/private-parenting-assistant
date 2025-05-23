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
  theme?: 'light' | 'dark' | 'transparent'; // 主题模式，用于适配不同背景
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
  theme = 'light',
}) => {
  // 根据主题确定颜色
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          background: 'bg-transparent',
          titleColor: 'text-white',
          iconColor: '#FFFFFF',
          hoverBg: 'hover:bg-white/10 active:bg-white/20',
        };
      case 'transparent':
        return {
          background: 'bg-transparent',
          titleColor: 'text-[#333333]',
          iconColor: '#333333',
          hoverBg: 'hover:bg-[#FDFBF8] active:bg-[#F5F7FA]',
        };
      default: // light
        return {
          background: 'bg-primary',
          titleColor: 'text-[#FFFFFF]',
          iconColor: '#FFFFFF',
          hoverBg: 'hover:bg-[#FDFBF8] active:bg-[#F5F7FA]',
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div
      className={`flex items-center h-[56px] bg-gradient-to-r from-[#FFB38A] to-[#FFC9A8] shadow-sm ${
        safeArea ? 'pt-2' : ''
      } px-4 ${themeClasses.background}
        ${border && theme === 'light' ? 'border-b border-[#E0E0E0]' : ''} 
        ${fixed ? 'fixed top-0 left-0 right-0' : 'relative'} 
        ${
          theme === 'light' ? 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : ''
        } z-10 ${className}`}
    >
      {onBack ? (
        <button
          className={`flex items-center justify-center w-11 h-11 mr-2 rounded-full ${themeClasses.hoverBg} transition-colors duration-200`}
          onClick={onBack}
          aria-label="返回"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M15 19l-7-7 7-7"
              stroke={themeClasses.iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <div className="w-11 h-11 mr-2" />
      )}

      <div
        className={`flex-1 text-lg font-semibold text-center truncate select-none ${
          `${themeClasses.titleColor} ${titleClassName}` // 否则组合主题颜色和自定义样式
        }`}
      >
        {title}
      </div>

      <div className="min-w-[44px] flex justify-end items-center">{right}</div>
    </div>
  );
};

export default NavBar;
