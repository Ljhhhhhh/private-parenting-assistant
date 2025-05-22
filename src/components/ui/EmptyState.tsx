import React, { ReactNode, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

interface EmptyStateProps {
  /** 主标题 */
  title: string;
  /** 副标题/描述文本 */
  description?: string;
  /** 自定义图标组件，如果不提供则使用默认图标 */
  customIcon?: ReactNode;
  /** 底部操作按钮 */
  action?: ReactNode;
  /** 图标类型，预设的图标类型 */
  iconType?: 'empty' | 'noData' | 'noResult' | 'offline' | 'error';
  /** 自定义图标名称（iconify格式） */
  iconName?: string;
  /** 图标颜色 */
  iconColor?: string;
}

/**
 * 空状态组件
 * 用于显示列表为空、搜索无结果等状态
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  customIcon,
  action,
  iconType = 'empty',
  iconName,
  iconColor,
}) => {
  // 微动效状态
  const [animationStep, setAnimationStep] = useState(0);

  // 设置微动效循环
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 3);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // 根据类型获取图标
  const getIconByType = () => {
    switch (iconType) {
      case 'noData':
        return 'mdi:database-off-outline';
      case 'noResult':
        return 'mdi:file-search-outline';
      case 'offline':
        return 'mdi:wifi-off';
      case 'error':
        return 'mdi:alert-circle-outline';
      case 'empty':
      default:
        return 'mdi:inbox-outline';
    }
  };

  // 根据类型获取颜色
  const getColorByType = () => {
    switch (iconType) {
      case 'noData':
        return '#7986CB';
      case 'noResult':
        return '#FFD040';
      case 'offline':
        return '#9E9E9E';
      case 'error':
        return '#F44336';
      case 'empty':
      default:
        return '#FFB38A';
    }
  };

  // 确定最终使用的图标
  const finalIconName = iconName || getIconByType();
  const finalIconColor = iconColor || getColorByType();
  return (
    <div className="flex flex-col justify-center items-center p-6">
      <div className="relative mb-6">
        {customIcon ? (
          customIcon
        ) : (
          <div className="flex relative justify-center items-center">
            {/* 主图标 */}
            <div
              className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ease-in-out ${
                animationStep === 1
                  ? 'scale-110'
                  : animationStep === 2
                  ? 'scale-95'
                  : 'scale-100'
              }`}
              style={{ backgroundColor: `${finalIconColor}20` }} // 使用10%透明度的背景色
            >
              <Icon
                icon={finalIconName}
                className={`text-5xl transition-all duration-500 ease-in-out ${
                  animationStep === 1
                    ? 'scale-110 rotate-3'
                    : animationStep === 2
                    ? 'scale-95 rotate-0'
                    : 'scale-100 rotate-0'
                }`}
                style={{ color: finalIconColor }}
              />
            </div>
          </div>
        )}

        {/* 装饰性光晕效果 */}
        <div
          className={`absolute top-1/2 left-1/2 rounded-full -z-10 transition-all duration-500 ease-in-out ${
            animationStep === 1
              ? 'scale-110 opacity-70'
              : animationStep === 2
              ? 'scale-95 opacity-50'
              : 'scale-100 opacity-60'
          }`}
          style={{
            backgroundColor: `${finalIconColor}10`, // 使用5%透明度的背景色
            width: '6rem',
            height: '6rem',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <h2 className="mb-3 text-xl font-semibold text-[#333333]">{title}</h2>

      {description && (
        <p className="mb-6 text-base text-center text-[#666666] max-w-xs">
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
