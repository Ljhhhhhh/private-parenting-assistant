import { useState } from 'react';
import { UrgeType } from '@/types/models';
import FeatureComingSoon from './FeatureComingSoon';

interface FeatureConfig {
  featureName: string;
  urgeType: UrgeType;
}

/**
 * 功能即将推出管理Hook（极简版）
 * 提供便捷的方式来显示功能预告对话框
 */
export const useFeatureComingSoon = () => {
  const [visible, setVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureConfig | null>(
    null,
  );

  // 预定义的功能配置
  const getFeatureConfig = (urgeType: UrgeType): FeatureConfig => {
    switch (urgeType) {
      case UrgeType.GROWTH_REPORT:
        return {
          featureName: '成长报告',
          urgeType: UrgeType.GROWTH_REPORT,
        };
      case UrgeType.VACCINE_REMINDER:
        return {
          featureName: '疫苗提醒',
          urgeType: UrgeType.VACCINE_REMINDER,
        };
      case UrgeType.PARENTING_KNOWLEDGE:
        return {
          featureName: '育儿知识',
          urgeType: UrgeType.PARENTING_KNOWLEDGE,
        };
      default:
        return {
          featureName: '新功能',
          urgeType,
        };
    }
  };

  // 显示功能预告
  const showFeatureComingSoon = (
    urgeType: UrgeType,
    customConfig?: Partial<FeatureConfig>,
  ) => {
    const defaultConfig = getFeatureConfig(urgeType);
    const finalConfig = { ...defaultConfig, ...customConfig };
    setCurrentFeature(finalConfig);
    setVisible(true);
  };

  // 关闭对话框
  const hideFeatureComingSoon = () => {
    setVisible(false);
    // 延迟清除状态，等待动画完成
    setTimeout(() => {
      setCurrentFeature(null);
    }, 300);
  };

  // 快捷方法
  const showGrowthReport = (customConfig?: Partial<FeatureConfig>) => {
    showFeatureComingSoon(UrgeType.GROWTH_REPORT, customConfig);
  };

  const showVaccineReminder = (customConfig?: Partial<FeatureConfig>) => {
    showFeatureComingSoon(UrgeType.VACCINE_REMINDER, customConfig);
  };

  const showParentingKnowledge = (customConfig?: Partial<FeatureConfig>) => {
    showFeatureComingSoon(UrgeType.PARENTING_KNOWLEDGE, customConfig);
  };

  // 渲染组件
  const FeatureComingSoonDialog = () => {
    if (!currentFeature) return null;

    return (
      <FeatureComingSoon
        visible={visible}
        featureName={currentFeature.featureName}
        featureDescription="" // 传递空字符串，组件中不再使用
        urgeType={currentFeature.urgeType}
        onClose={hideFeatureComingSoon}
      />
    );
  };

  return {
    // 状态
    visible,
    currentFeature,

    // 方法
    showFeatureComingSoon,
    hideFeatureComingSoon,

    // 快捷方法
    showGrowthReport,
    showVaccineReminder,
    showParentingKnowledge,

    // 组件
    FeatureComingSoonDialog,
  };
};
