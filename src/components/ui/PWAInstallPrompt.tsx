import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className = '',
}) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 检查是否已经安装为PWA
    const checkIfInstalled = () => {
      // 检查是否在standalone模式下运行
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;
      // 检查是否在navigator中有appInstalled
      const isAppInstalled = (window.navigator as any).standalone === true;

      return isStandalone || isAppInstalled;
    };

    setIsInstalled(checkIfInstalled());

    // 监听beforeinstallprompt事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // 监听appinstalled事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 延迟显示安装提示（避免过于突兀）
    const timer = setTimeout(() => {
      if (deferredPrompt && !isInstalled) {
        setShowInstallPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('用户同意安装PWA');
      } else {
        console.log('用户拒绝安装PWA');
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('安装PWA时出错:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // 24小时后再次显示
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // 检查是否在24小时内被关闭过
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  // 如果已经安装或不显示提示，则不渲染
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-[1200] ${className}`}>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/50 max-w-sm mx-auto">
        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="关闭安装提示"
        >
          <Icon icon="mdi:close" className="w-4 h-4" />
        </button>

        {/* 内容 */}
        <div className="flex items-start space-x-3">
          {/* 图标 */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FFB38A] to-[#FFC9A8] rounded-xl flex items-center justify-center">
            <Icon icon="mdi:heart" className="w-6 h-6 text-white" />
          </div>

          {/* 文本内容 */}
          <div className="flex-1 pr-4">
            <h3 className="text-base font-semibold text-[#333333] mb-1">
              安装育儿助手
            </h3>
            <p className="text-sm text-[#666666] mb-3 leading-relaxed">
              添加到桌面，随时记录宝宝成长，享受更便捷的使用体验
            </p>

            {/* 操作按钮 */}
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-[#FFB38A] to-[#FFC9A8] text-white text-sm font-medium py-2 px-4 rounded-xl hover:shadow-lg hover:shadow-[#FFB38A]/30 transition-all duration-300 flex items-center justify-center space-x-1"
              >
                <Icon icon="mdi:download" className="w-4 h-4" />
                <span>安装</span>
              </button>

              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-sm text-[#666666] hover:text-[#333333] transition-colors"
              >
                稍后
              </button>
            </div>
          </div>
        </div>

        {/* 特性说明 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-[#999999]">
            <div className="flex items-center space-x-1">
              <Icon icon="mdi:wifi-off" className="w-3 h-3" />
              <span>离线使用</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon icon="mdi:rocket-launch" className="w-3 h-3" />
              <span>快速启动</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon icon="mdi:bell" className="w-3 h-3" />
              <span>及时提醒</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
