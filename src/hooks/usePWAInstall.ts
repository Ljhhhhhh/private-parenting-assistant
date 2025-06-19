import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  canInstall: boolean;
  isShowPrompt: boolean;
  isDismissed: boolean;
}

// 全局状态存储
let globalPWAState: PWAInstallState = {
  deferredPrompt: null,
  isInstalled: false,
  canInstall: false,
  isShowPrompt: false,
  isDismissed: false,
};

// 全局状态更新回调列表
const stateUpdateCallbacks = new Set<(state: PWAInstallState) => void>();

// 检查是否已安装PWA
const checkIfInstalled = (): boolean => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  return isStandalone || isIOSStandalone;
};

// 检查是否在24小时内被关闭过
const checkIfDismissed = (): boolean => {
  const dismissed = localStorage.getItem('pwa-dismissed');
  if (!dismissed) return false;

  const dismissedTime = parseInt(dismissed);
  const now = Date.now();
  const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);
  return hoursPassed < 24;
};

// 更新全局状态
const updateGlobalState = (updates: Partial<PWAInstallState>) => {
  globalPWAState = { ...globalPWAState, ...updates };
  stateUpdateCallbacks.forEach((callback) => callback(globalPWAState));
};

// 初始化全局PWA监听器（只初始化一次）
let isInitialized = false;

const initializePWAListeners = () => {
  if (isInitialized) return;
  isInitialized = true;

  const isInstalled = checkIfInstalled();
  const isDismissed = checkIfDismissed();

  updateGlobalState({
    isInstalled,
    isDismissed,
    canInstall: false,
    isShowPrompt: false,
  });

  if (isInstalled) {
    return; // 如果已安装，不需要监听安装事件
  }

  // 监听beforeinstallprompt事件
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    const promptEvent = e as BeforeInstallPromptEvent;

    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 PWA beforeinstallprompt事件已捕获');
    }

    updateGlobalState({
      deferredPrompt: promptEvent,
      canInstall: true,
      isShowPrompt: !isDismissed, // 只有未被关闭的情况下才显示
    });
  };

  // 监听appinstalled事件
  const handleAppInstalled = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ PWA已安装');
    }
    updateGlobalState({
      isInstalled: true,
      canInstall: false,
      isShowPrompt: false,
      deferredPrompt: null,
    });
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  // 清理函数（在应用卸载时调用）
  return () => {
    window.removeEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt,
    );
    window.removeEventListener('appinstalled', handleAppInstalled);
  };
};

// PWA安装管理Hook
export const usePWAInstall = () => {
  const [state, setState] = useState<PWAInstallState>(globalPWAState);

  useEffect(() => {
    // 初始化全局监听器
    initializePWAListeners();

    // 注册状态更新回调
    stateUpdateCallbacks.add(setState);

    // 设置当前状态
    setState(globalPWAState);

    // 清理函数
    return () => {
      stateUpdateCallbacks.delete(setState);
    };
  }, []);

  // 触发安装
  const install = useCallback(async (): Promise<boolean> => {
    if (!state.deferredPrompt) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ 没有可用的安装提示');
      }
      return false;
    }

    try {
      await state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `📱 用户${outcome === 'accepted' ? '同意' : '拒绝'}安装PWA`,
        );
      }

      updateGlobalState({
        deferredPrompt: null,
        canInstall: false,
        isShowPrompt: false,
      });

      return outcome === 'accepted';
    } catch (error) {
      console.error('安装PWA时出错:', error);
      return false;
    }
  }, [state.deferredPrompt]);

  // 关闭安装提示
  const dismiss = useCallback(() => {
    localStorage.setItem('pwa-dismissed', Date.now().toString());
    updateGlobalState({
      isShowPrompt: false,
      isDismissed: true,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('📋 用户关闭了PWA安装提示（24小时内不再显示）');
    }
  }, []);

  // 手动显示安装提示（用于特定页面触发）
  const showPrompt = useCallback(() => {
    if (state.canInstall && !state.isDismissed && !state.isInstalled) {
      updateGlobalState({ isShowPrompt: true });
    }
  }, [state.canInstall, state.isDismissed, state.isInstalled]);

  // 调试信息
  const debugInfo = {
    isInstalled: state.isInstalled,
    canInstall: state.canInstall,
    isShowPrompt: state.isShowPrompt,
    isDismissed: state.isDismissed,
    hasDeferredPrompt: !!state.deferredPrompt,
    userAgent: navigator.userAgent,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    hasServiceWorker: 'serviceWorker' in navigator,
    isOnline: navigator.onLine,
  };

  return {
    // 状态
    isInstalled: state.isInstalled,
    canInstall: state.canInstall,
    isShowPrompt: state.isShowPrompt,
    isDismissed: state.isDismissed,

    // 操作方法
    install,
    dismiss,
    showPrompt,

    // 调试信息
    debugInfo,
  };
};
