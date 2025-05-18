import React from 'react';

interface ProgressProps {
  percent: number;
  type?: 'line' | 'circle';
  size?: number; // circle尺寸
  strokeWidth?: number;
  showInfo?: boolean;
  color?: string; // 自定义颜色
  status?: 'normal' | 'success' | 'exception'; // 状态
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({
  percent,
  type = 'line',
  size = 36,
  strokeWidth = type === 'line' ? 8 : 4,
  showInfo = true,
  color,
  status = 'normal',
  className = '',
}) => {
  // 确保百分比值在0-100之间
  const validPercent = Math.max(0, Math.min(100, percent));

  // 根据状态确定颜色
  const getStatusColor = () => {
    if (color) return color;

    switch (status) {
      case 'success':
        return 'var(--color-success)';
      case 'exception':
        return 'var(--color-error)';
      default:
        return 'var(--color-primary)';
    }
  };

  const statusColor = getStatusColor();

  // 环形进度条
  if (type === 'circle') {
    // 计算圆形进度条的属性
    const radius = 50 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (validPercent / 100) * circumference;

    return (
      <div
        className={`relative inline-block ${className}`}
        style={{ width: size, height: size }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* 背景圆环 */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth={strokeWidth}
          />
          {/* 进度圆环 */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        {showInfo && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {status === 'exception' ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-error"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : validPercent >= 100 && status === 'success' ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-success"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              `${validPercent}%`
            )}
          </div>
        )}
      </div>
    );
  }

  // 线性进度条
  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${validPercent}%`,
              backgroundColor: statusColor,
            }}
          />
        </div>

        {showInfo && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 transform text-xs font-medium ml-2">
            {validPercent}%
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
