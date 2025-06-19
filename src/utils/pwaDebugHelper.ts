/**
 * PWA 调试助手工具
 * 用于在开发者控制台中快速诊断PWA安装问题
 */

interface PWADebugInfo {
  conditions: {
    https: boolean;
    manifest: boolean;
    serviceWorker: boolean;
    userInteraction: boolean;
    notInstalled: boolean;
  };
  browser: {
    name: string;
    supports_pwa: boolean;
    display_mode: string;
  };
  manifest: any;
  serviceWorker: any;
  recommendations: string[];
}

/**
 * 检查PWA安装条件
 */
export const checkPWAConditions = (): PWADebugInfo => {
  const conditions = {
    https:
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost',
    manifest: !!document.querySelector('link[rel="manifest"]'),
    serviceWorker: 'serviceWorker' in navigator,
    userInteraction: true, // 假设已有用户交互
    notInstalled: window.matchMedia('(display-mode: browser)').matches,
  };

  const userAgent = navigator.userAgent;
  const browser = {
    name: getBrowserName(userAgent),
    supports_pwa: checkBrowserPWASupport(userAgent),
    display_mode: getCurrentDisplayMode(),
  };

  const recommendations: string[] = [];

  if (!conditions.https) {
    recommendations.push('🔒 需要HTTPS连接（localhost除外）');
  }
  if (!conditions.manifest) {
    recommendations.push('📄 需要有效的Web App Manifest');
  }
  if (!conditions.serviceWorker) {
    recommendations.push('⚙️ 需要Service Worker支持');
  }
  if (!conditions.notInstalled) {
    recommendations.push('📱 应用可能已经安装');
  }
  if (!browser.supports_pwa) {
    recommendations.push('🌐 当前浏览器可能不完全支持PWA');
  }

  return {
    conditions,
    browser,
    manifest: getManifestInfo(),
    serviceWorker: getServiceWorkerInfo(),
    recommendations,
  };
};

/**
 * 强制触发PWA安装提示（仅开发环境）
 */
export const forcePWAInstallPrompt = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ 此功能仅在开发环境可用');
    return;
  }

  console.log('🔧 强制触发PWA安装提示...');

  // 创建模拟的beforeinstallprompt事件
  const mockEvent = new CustomEvent('beforeinstallprompt', {
    cancelable: true,
    detail: {
      prompt: () => {
        console.log('📱 模拟安装提示');
        return Promise.resolve();
      },
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    },
  });

  window.dispatchEvent(mockEvent);
};

/**
 * 清除PWA相关数据以重新测试
 */
export const resetPWAState = async () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️ 此功能仅在开发环境可用');
    return;
  }

  console.log('🧹 清除PWA状态...');

  try {
    // 清除localStorage
    localStorage.clear();
    console.log('✅ localStorage已清除');

    // 清除sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage已清除');

    // 清除IndexedDB
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
      console.log('✅ IndexedDB已清除');
    }

    // 注销Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('✅ Service Worker已注销');
    }

    console.log('🎉 PWA状态重置完成，请刷新页面');
  } catch (error) {
    console.error('💥 重置失败:', error);
  }
};

/**
 * 打印详细的PWA诊断报告
 */
export const diagnosePWA = () => {
  const info = checkPWAConditions();

  console.group('🔍 PWA 诊断报告');

  console.log('📋 安装条件检查:');
  Object.entries(info.conditions).forEach(([key, value]) => {
    console.log(`  ${value ? '✅' : '❌'} ${key}: ${value}`);
  });

  console.log('\n🌐 浏览器信息:');
  Object.entries(info.browser).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  if (info.manifest) {
    console.log('\n📄 Manifest 信息:');
    console.log(info.manifest);
  }

  if (info.serviceWorker) {
    console.log('\n⚙️ Service Worker 信息:');
    console.log(info.serviceWorker);
  }

  if (info.recommendations.length > 0) {
    console.log('\n💡 建议:');
    info.recommendations.forEach((rec) => console.log(`  ${rec}`));
  }

  console.groupEnd();

  return info;
};

// 辅助函数
function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function checkBrowserPWASupport(_userAgent: string): boolean {
  // 简化的PWA支持检查
  return !!(
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function getCurrentDisplayMode(): string {
  if (window.matchMedia('(display-mode: standalone)').matches)
    return 'standalone';
  if (window.matchMedia('(display-mode: minimal-ui)').matches)
    return 'minimal-ui';
  if (window.matchMedia('(display-mode: fullscreen)').matches)
    return 'fullscreen';
  return 'browser';
}

function getManifestInfo() {
  const manifestLink = document.querySelector(
    'link[rel="manifest"]',
  ) as HTMLLinkElement;
  if (!manifestLink) return null;

  return {
    href: manifestLink.href,
    exists: true,
  };
}

function getServiceWorkerInfo() {
  if (!('serviceWorker' in navigator)) return null;

  return {
    supported: true,
    controller: !!navigator.serviceWorker.controller,
    ready: navigator.serviceWorker.ready,
  };
}

// 在开发环境下暴露到全局对象，方便控制台调用
if (process.env.NODE_ENV === 'development') {
  (window as any).PWADebug = {
    check: checkPWAConditions,
    diagnose: diagnosePWA,
    force: forcePWAInstallPrompt,
    reset: resetPWAState,
  };

  console.log('🛠️ PWA调试工具已加载! 使用 PWADebug.diagnose() 开始诊断');
}
