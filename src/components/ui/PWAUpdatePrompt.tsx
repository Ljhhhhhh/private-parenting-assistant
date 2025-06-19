import React, { useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import Button from '@/components/ui/base/Button';
import { useDialog } from '@/components/ui/feedback/Dialog';

interface PWAUpdatePromptProps {
  /**
   * 是否自动显示更新提示
   * @default true
   */
  autoShow?: boolean;

  /**
   * 自定义样式类名
   */
  className?: string;

  /**
   * 更新前的回调
   */
  onBeforeUpdate?: () => void;

  /**
   * 更新后的回调
   */
  onAfterUpdate?: () => void;
}

/**
 * PWA更新提示组件
 * 当有新版本可用时，显示更新提示对话框
 */
export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  autoShow = true,
  className = '',
  onBeforeUpdate,
  onAfterUpdate,
}) => {
  const { updateInfo, isLoading, error, applyUpdate, checkForUpdates } =
    useServiceWorker();

  const { confirm, DialogContainer } = useDialog();
  const [_isUpdating, setIsUpdating] = useState(false);

  // 自动显示更新提示
  React.useEffect(() => {
    if (autoShow && updateInfo.available) {
      showUpdateDialog();
    }
  }, [autoShow, updateInfo.available]);

  // 显示更新对话框
  const showUpdateDialog = () => {
    confirm(
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">🚀</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            萌芽育儿有新功能啦！
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed">
            我们修复了一些问题并添加了新功能，建议您立即更新以获得更好的体验。
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            ✨ 本次更新亮点：
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 优化了应用性能和稳定性</li>
            <li>• 改进了离线功能体验</li>
            <li>• 修复了已知问题</li>
            <li>• 增强了数据安全性</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">更新失败：{error}</p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          更新只需要几秒钟，不会影响您的数据
        </p>
      </div>,
      '🎉 发现新版本',
      handleUpdate,
      () => {}, // 取消回调
    );
  };

  // 处理更新
  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      onBeforeUpdate?.();

      await applyUpdate();

      onAfterUpdate?.();
    } catch (error) {
      console.error('更新失败:', error);
      setIsUpdating(false);
    }
  };

  // 手动检查更新
  const handleCheckUpdate = async () => {
    try {
      await checkForUpdates();
      if (updateInfo.available) {
        showUpdateDialog();
      }
    } catch (error) {
      console.error('检查更新失败:', error);
    }
  };

  return (
    <>
      <DialogContainer />

      {/* 如果没有更新可用，显示检查更新按钮 */}
      {!updateInfo.available && !autoShow && (
        <div className={`pwa-update-prompt ${className}`}>
          <Button
            variant="secondary"
            onClick={handleCheckUpdate}
            loading={isLoading}
            disabled={isLoading}
          >
            检查更新
          </Button>
        </div>
      )}
    </>
  );
};

/**
 * PWA更新状态指示器
 * 显示当前更新状态的小指示器
 */
export const PWAUpdateIndicator: React.FC<{
  className?: string;
  showText?: boolean;
}> = ({ className = '', showText = false }) => {
  const { updateInfo, isOnline, isPWA } = useServiceWorker();

  if (!isPWA) return null;

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        color: 'bg-yellow-500',
        text: '离线模式',
        icon: '📴',
      };
    }

    if (updateInfo.available) {
      return {
        color: 'bg-blue-500 animate-pulse',
        text: '有更新',
        icon: '🔄',
      };
    }

    return {
      color: 'bg-green-500',
      text: '最新版本',
      icon: '✅',
    };
  };

  const status = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${status.color}`} />
      {showText && (
        <span className="text-xs text-gray-600">
          {status.icon} {status.text}
        </span>
      )}
    </div>
  );
};

export default PWAUpdatePrompt;
