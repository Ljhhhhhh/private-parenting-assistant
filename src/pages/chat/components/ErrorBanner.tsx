import React from 'react';
import { Icon } from '@iconify/react';

interface ErrorBannerProps {
  error: Error | null;
  onRetry: () => void;
  onDismiss: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  if (!error) return null;

  return (
    <div className="px-4 py-3 bg-red-50 border-b border-red-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Icon
            icon="ph:warning-circle"
            width={16}
            height={16}
            className="text-red-500"
          />
          <span className="text-sm text-red-700">
            {error.message || '发送消息失败'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRetry}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            重试
          </button>
          <button
            onClick={onDismiss}
            className="text-sm text-red-400 hover:text-red-600"
          >
            忽略
          </button>
        </div>
      </div>
    </div>
  );
};
