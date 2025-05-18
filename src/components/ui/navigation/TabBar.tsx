import React from 'react';

interface TabBarItem {
  key: string;
  title: React.ReactNode;
  icon: React.ReactNode;
  badge?: number | string;
}

interface TabBarProps {
  items: TabBarItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  fixed?: boolean; // 是否固定在底部
  safeArea?: boolean; // 是否考虑底部安全区域
  border?: boolean; // 是否显示顶部边框
}

const TabBar: React.FC<TabBarProps> = ({
  items,
  activeKey,
  onChange,
  className = '',
  fixed = false,
  safeArea = true,
  border = true,
}) => {
  return (
    <div
      className={`
        flex items-center justify-around h-[56px] ${
          safeArea ? 'pb-safe-bottom' : ''
        } bg-white
        ${border ? 'border-t border-gray-200' : ''}
        ${fixed ? 'fixed left-0 right-0 bottom-0' : 'relative'}
        shadow-sm z-10
        ${className}
      `}
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={`
            flex flex-col items-center justify-center h-full flex-1 cursor-pointer
            ${activeKey === item.key ? 'text-primary' : 'text-gray-500'}
            active:bg-gray-50 transition-colors
          `}
          onClick={() => onChange?.(item.key)}
        >
          <div className="relative">
            <div className="text-[24px]">{item.icon}</div>

            {/* 徽标 */}
            {item.badge && (
              <span
                className={`
                  absolute -top-1.5 -right-1.5 
                  ${
                    typeof item.badge === 'number' && item.badge > 9
                      ? 'min-w-[16px] px-1'
                      : 'w-4 h-4'
                  }
                  flex items-center justify-center
                  rounded-full bg-error text-white text-xs
                `}
              >
                {typeof item.badge === 'number' && item.badge > 99
                  ? '99+'
                  : item.badge}
              </span>
            )}
          </div>

          <div className="text-xs mt-1">{item.title}</div>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
