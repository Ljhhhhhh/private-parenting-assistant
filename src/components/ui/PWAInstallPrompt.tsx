import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import LogoImage from '@/assets/logo.svg?react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface SimplePWAInstallPromptProps {
  className?: string;
  // 是否在组件加载时自动尝试显示
  autoShow?: boolean;
  // 延迟显示时间（毫秒）
  showDelay?: number;
}

export const PWAInstallPrompt: React.FC<SimplePWAInstallPromptProps> = ({
  className = '',
  autoShow = true,
  showDelay = 3000,
}) => {
  const {
    isInstalled,
    canInstall,
    isShowPrompt,
    isDismissed,
    install,
    dismiss,
    showPrompt,
  } = usePWAInstall();

  // 自动显示逻辑
  useEffect(() => {
    if (autoShow && canInstall && !isDismissed && !isInstalled) {
      const timer = setTimeout(() => {
        showPrompt();

        if (process.env.NODE_ENV === 'development') {
          console.log('🏠 Home页面延迟显示PWA安装提示');
        }
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, canInstall, isDismissed, isInstalled, showPrompt, showDelay]);

  // 处理安装点击
  const handleInstallClick = async () => {
    const success = await install();
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 安装${success ? '成功' : '失败'}`);
    }
  };

  // 处理关闭点击
  const handleDismissClick = () => {
    dismiss();
  };

  // 如果已安装，不显示
  if (isInstalled) {
    return null;
  }

  // 如果不能安装或不显示提示，则不渲染
  if (!isShowPrompt) {
    return null;
  }

  // 正常显示安装提示
  return (
    <div className={`fixed bottom-4 left-4 right-4 z-[1200] ${className}`}>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/50 max-w-sm mx-auto animate-slide-down">
        {/* 关闭按钮 */}
        <button
          onClick={handleDismissClick}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="关闭安装提示"
        >
          <Icon icon="mdi:close" className="w-4 h-4" />
        </button>

        {/* 内容 */}
        <div className="flex items-start space-x-3">
          {/* 图标 */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#F5F5F5] to-[#F5F5F5] rounded-xl flex items-center justify-center">
            <LogoImage className="w-10 h-10" />
          </div>

          {/* 文本内容 */}
          <div className="flex-1 pr-4">
            <h3 className="text-base font-semibold text-[#333333] mb-1">
              安装萌芽育儿
            </h3>
            <p className="text-sm text-[#666666] mb-3 leading-relaxed">
              添加到桌面，随时记录宝宝成长，享受更便捷的使用体验
            </p>

            {/* 操作按钮 */}
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 text-white bg-gradient-to-r from-[#FFB38A] to-[#FFC9A8] text-sm font-medium py-2 px-4 rounded-xl hover:shadow-lg transition-shadow flex items-center justify-center space-x-1"
              >
                <Icon icon="mdi:download" className="w-4 h-4" />
                <span>安装</span>
              </button>

              <button
                onClick={handleDismissClick}
                className="px-3 py-2 text-sm text-[#666666] hover:text-[#333333] transition-colors"
              >
                稍后
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
