import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { createUrgeUpdate } from '@/api/urge';
import { UrgeType } from '@/types/models';

interface FeatureComingSoonProps {
  /** 是否显示对话框 */
  visible: boolean;
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  featureDescription: string;
  /** 催更类型 */
  urgeType: UrgeType;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 功能即将推出提示组件（简化版）
 * 温馨友好的设计，自动调用催更接口
 */
const FeatureComingSoon: React.FC<FeatureComingSoonProps> = ({
  visible,
  featureName,
  featureDescription: _featureDescription,
  urgeType,
  onClose,
}) => {
  // 根据催更类型获取图标和色彩
  const getFeatureConfig = (type: UrgeType) => {
    switch (type) {
      case UrgeType.GROWTH_REPORT:
        return {
          icon: 'mdi:chart-line',
          color: '#81C784',
          bgColor: '#81C78420',
          accentColor: '#4CAF50',
        };
      case UrgeType.VACCINE_REMINDER:
        return {
          icon: 'mdi:needle',
          color: '#64B5F6',
          bgColor: '#64B5F620',
          accentColor: '#2196F3',
        };
      case UrgeType.PARENTING_KNOWLEDGE:
        return {
          icon: 'mdi:book-heart',
          color: '#FFB74D',
          bgColor: '#FFB74D20',
          accentColor: '#FF9800',
        };
      default:
        return {
          icon: 'mdi:heart',
          color: '#FFB38A',
          bgColor: '#FFB38A20',
          accentColor: '#FF9F73',
        };
    }
  };

  const config = getFeatureConfig(urgeType);

  // 组件显示时自动调用催更接口
  useEffect(() => {
    if (visible) {
      handleAutoUrge();
    }
  }, [visible]);

  // 自动催更
  const handleAutoUrge = async () => {
    try {
      await createUrgeUpdate({ urgeType });
    } catch (_error) {
      // 静默处理错误，不影响用户体验
      console.log('催更提交失败，但不影响用户体验');
    }
  };

  // 阻止冒泡
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center"
        onClick={onClose}
      >
        {/* 遮罩层 */}
        <div className="fixed inset-0 transition-opacity duration-300 bg-black/40"></div>

        {/* 对话框容器 */}
        <div
          className="relative bg-white rounded-dialog w-[280px] max-w-[90vw] shadow-dialog overflow-hidden animate-scale-in"
          onClick={handleDialogClick}
        >
          {/* 装饰性顶部 */}
          <div
            className="h-1 w-full"
            style={{ backgroundColor: config.accentColor }}
          />

          {/* 内容区域 */}
          <div className="px-6 py-8 text-center">
            {/* 图标和标题 */}
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ backgroundColor: config.bgColor }}
              >
                <Icon
                  icon={config.icon}
                  className="text-3xl"
                  style={{ color: config.color }}
                />
              </div>

              <h2 className="text-h2 font-semibold text-text-primary mb-3">
                {featureName}
              </h2>

              <div className="px-4 py-2 bg-orange/20 text-orange text-base rounded-tag font-medium mb-4">
                评估开发中
              </div>

              <p className="text-sm text-text-secondary leading-relaxed">
                抱歉，该功能暂未开放
                <br />
                我们正在评估开发中
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="border-t border-gray-300">
            <button
              className="w-full py-3 text-base font-medium transition text-primary hover:bg-primary/10 active:bg-primary/20"
              onClick={onClose}
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureComingSoon;
