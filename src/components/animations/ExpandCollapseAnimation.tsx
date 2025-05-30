import React, { useRef, useEffect } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import expandCollapseAnimation from '@/assets/animations/expand-collapse.json';

interface ExpandCollapseAnimationProps {
  isExpanded: boolean;
  size?: number;
  className?: string;
  speed?: number;
}

/**
 * 展开收起动画组件
 * 基于 lottie-react 实现的高级展开收起动画效果
 */
export const ExpandCollapseAnimation: React.FC<
  ExpandCollapseAnimationProps
> = ({ isExpanded, size = 24, className = '', speed = 1.5 }) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current) {
      // 设置动画速度
      if (lottieRef.current.setSpeed) {
        lottieRef.current.setSpeed(speed);
      }

      // 根据展开状态控制动画方向
      if (isExpanded) {
        // 播放展开动画（0 -> 1）
        lottieRef.current.setDirection(1);
        lottieRef.current.play();
      } else {
        // 播放收起动画（1 -> 0）
        lottieRef.current.setDirection(-1);
        lottieRef.current.play();
      }
    }
  }, [isExpanded, speed]);

  return (
    <div style={{ width: size, height: size }} className={className}>
      <Lottie
        animationData={expandCollapseAnimation}
        loop={false}
        autoplay={false}
        lottieRef={lottieRef}
        style={{ width: '100%', height: '100%' }}
        initialSegment={isExpanded ? [30, 30] : [0, 0]}
      />
    </div>
  );
};
