/**
 * Service Worker 工具函数
 * 用于管理PWA缓存策略、更新机制和离线功能
 */

interface CacheStats {
  totalCaches: number;
  totalEntries: number;
  totalSize: number;
  lastUpdated: string;
}

interface UpdateInfo {
  available: boolean;
  waiting: boolean;
  installing: boolean;
}

// 缓存名称常量
export const CACHE_NAMES = {
  API: 'api-cache',
  CHAT: 'chat-cache',
  RECORDS: 'records-cache',
  IMAGES: 'images-cache',
  FONTS: 'fonts-cache',
  CDN: 'cdn-cache',
  DOCS: 'docs-cache',
  STATIC: 'static-cache',
} as const;

/**
 * 检查 Service Worker 是否支持
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * 检查是否在PWA模式下运行
 */
export function isPWAMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * 注册 Service Worker 更新监听器
 */
export function setupUpdateListener(
  onUpdateAvailable?: () => void,
  onUpdateError?: (error: Error) => void,
): () => void {
  if (!isServiceWorkerSupported()) {
    console.warn('Service Worker 不被支持');
    return () => {};
  }

  let refreshing = false;

  // 监听控制器变化（新的 SW 激活时）
  const handleControllerChange = () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener(
    'controllerchange',
    handleControllerChange,
  );

  // 监听新的 SW 安装
  navigator.serviceWorker.ready
    .then((registration) => {
      const handleUpdateFound = () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // 新的 SW 已安装并等待激活
            onUpdateAvailable?.();
          }
        });
      };

      registration.addEventListener('updatefound', handleUpdateFound);

      // 检查是否已有等待的更新
      if (registration.waiting) {
        onUpdateAvailable?.();
      }
    })
    .catch(onUpdateError);

  // 返回清理函数
  return () => {
    navigator.serviceWorker.removeEventListener(
      'controllerchange',
      handleControllerChange,
    );
  };
}

/**
 * 手动触发 Service Worker 更新
 */
export async function triggerSWUpdate(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    throw new Error('Service Worker 不被支持');
  }

  const registration = await navigator.serviceWorker.ready;

  if (registration.waiting) {
    // 有等待的 SW，发送消息让其接管
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    // 手动检查更新
    await registration.update();
  }
}

/**
 * 获取Service Worker更新状态
 */
export async function getUpdateInfo(): Promise<UpdateInfo> {
  if (!isServiceWorkerSupported()) {
    return { available: false, waiting: false, installing: false };
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    return {
      available: !!registration.waiting,
      waiting: !!registration.waiting,
      installing: !!registration.installing,
    };
  } catch (error) {
    console.error('获取更新信息失败:', error);
    return { available: false, waiting: false, installing: false };
  }
}

/**
 * 获取缓存统计信息
 */
export async function getCacheStats(): Promise<CacheStats> {
  if (!('caches' in window)) {
    throw new Error('Cache API 不被支持');
  }

  try {
    const cacheNames = await caches.keys();
    let totalEntries = 0;
    let totalSize = 0;
    let lastUpdated = new Date(0).toISOString();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      totalEntries += keys.length;

      // 估算缓存大小（粗略计算）
      for (const request of keys) {
        try {
          const response = await cache.match(request);
          if (response) {
            const size = parseInt(
              response.headers.get('content-length') || '0',
              10,
            );
            totalSize += size || 1024; // 默认1KB如果无法获取大小

            // 更新最后修改时间
            const lastModified = response.headers.get('last-modified');
            if (
              lastModified &&
              new Date(lastModified) > new Date(lastUpdated)
            ) {
              lastUpdated = lastModified;
            }
          }
        } catch (_error) {
          // 忽略单个缓存项的错误
          continue;
        }
      }
    }

    return {
      totalCaches: cacheNames.length,
      totalEntries,
      totalSize,
      lastUpdated: lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    throw error;
  }
}

/**
 * 清理过期缓存
 */
export async function cleanupExpiredCaches(): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    const currentCaches = Object.values(CACHE_NAMES);

    // 删除不在当前缓存名称列表中的缓存
    const deletePromises = cacheNames
      .filter(
        (cacheName) =>
          !currentCaches.some((current) => cacheName.includes(current)),
      )
      .map((cacheName) => caches.delete(cacheName));

    await Promise.all(deletePromises);
    console.log('过期缓存清理完成');
  } catch (error) {
    console.error('清理过期缓存失败:', error);
  }
}

/**
 * 预缓存重要资源
 */
export async function precacheImportantResources(
  urls: string[],
): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open(CACHE_NAMES.STATIC);

    // 批量添加到缓存
    await cache.addAll(urls.filter((url) => url && typeof url === 'string'));
    console.log('重要资源预缓存完成');
  } catch (error) {
    console.error('预缓存失败:', error);
  }
}

/**
 * 检查特定URL是否已缓存
 */
export async function isUrlCached(url: string): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const response = await cache.match(url);
      if (response) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('检查缓存状态失败:', error);
    return false;
  }
}

/**
 * 手动缓存URL
 */
export async function cacheUrl(
  url: string,
  cacheName: string = CACHE_NAMES.STATIC,
): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open(cacheName);
    await cache.add(url);
    console.log(`已缓存: ${url}`);
  } catch (error) {
    console.error(`缓存失败 ${url}:`, error);
  }
}

/**
 * 获取离线状态
 */
export function getOfflineStatus() {
  return {
    isOnline: navigator.onLine,
    isServiceWorkerActive:
      isServiceWorkerSupported() && navigator.serviceWorker.controller !== null,
    isPWA: isPWAMode(),
  };
}

/**
 * 设置网络状态监听器
 */
export function setupNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void,
): () => void {
  const handleOnline = () => {
    console.log('网络已连接');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('网络已断开');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * 智能缓存策略 - 根据内容类型选择缓存策略
 */
export function getCacheStrategy(url: string): {
  strategy: 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate';
  cacheName: string;
  maxAge: number;
} {
  const pathname = new URL(url, window.location.origin).pathname;

  // API 请求 - 网络优先
  if (pathname.startsWith('/api')) {
    if (pathname.includes('/chat') || pathname.includes('/conversation')) {
      return {
        strategy: 'CacheFirst',
        cacheName: CACHE_NAMES.CHAT,
        maxAge: 7 * 24 * 60 * 60, // 7天
      };
    }

    if (pathname.includes('/records') || pathname.includes('/children')) {
      return {
        strategy: 'NetworkFirst',
        cacheName: CACHE_NAMES.RECORDS,
        maxAge: 30 * 24 * 60 * 60, // 30天
      };
    }

    return {
      strategy: 'NetworkFirst',
      cacheName: CACHE_NAMES.API,
      maxAge: 24 * 60 * 60, // 24小时
    };
  }

  // 图片资源 - 缓存优先
  if (pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i)) {
    return {
      strategy: 'CacheFirst',
      cacheName: CACHE_NAMES.IMAGES,
      maxAge: 60 * 24 * 60 * 60, // 60天
    };
  }

  // 字体资源 - 缓存优先
  if (pathname.match(/\.(woff|woff2|ttf|eot)$/i)) {
    return {
      strategy: 'CacheFirst',
      cacheName: CACHE_NAMES.FONTS,
      maxAge: 365 * 24 * 60 * 60, // 1年
    };
  }

  // 文档资源 - 后台更新
  if (pathname.includes('/docs/') || pathname.includes('/knowledge/')) {
    return {
      strategy: 'StaleWhileRevalidate',
      cacheName: CACHE_NAMES.DOCS,
      maxAge: 7 * 24 * 60 * 60, // 7天
    };
  }

  // 默认策略
  return {
    strategy: 'NetworkFirst',
    cacheName: CACHE_NAMES.STATIC,
    maxAge: 24 * 60 * 60, // 24小时
  };
}

/**
 * 初始化Service Worker优化
 */
export async function initServiceWorkerOptimizations(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    console.warn('Service Worker 不被支持，跳过优化');
    return;
  }

  try {
    // 清理过期缓存
    await cleanupExpiredCaches();

    // 预缓存重要资源
    const importantUrls = [
      '/',
      '/chat',
      '/record',
      '/profile',
      '/offline.html',
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png',
    ];

    await precacheImportantResources(importantUrls);

    console.log('Service Worker 优化初始化完成');
  } catch (error) {
    console.error('Service Worker 优化初始化失败:', error);
  }
}

/**
 * 获取缓存性能指标
 */
export async function getCachePerformanceMetrics(): Promise<{
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
  averageResponseTime: number;
}> {
  // 这里可以集成实际的性能监控
  // 目前返回模拟数据
  return {
    hitRate: 0.85, // 85% 缓存命中率
    totalRequests: 1000,
    cacheHits: 850,
    averageResponseTime: 120, // 120ms 平均响应时间
  };
}

// 导出类型定义
export type { CacheStats, UpdateInfo };
