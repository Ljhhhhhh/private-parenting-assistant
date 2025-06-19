import { useState, useEffect, useCallback } from 'react';
import {
  isServiceWorkerSupported,
  isPWAMode,
  setupUpdateListener,
  setupNetworkListeners,
  triggerSWUpdate,
  getUpdateInfo,
  getCacheStats,
  getOfflineStatus,
  initServiceWorkerOptimizations,
  getCachePerformanceMetrics,
  type CacheStats,
  type UpdateInfo,
} from '@/utils/serviceWorker';

interface ServiceWorkerState {
  isSupported: boolean;
  isPWA: boolean;
  isOnline: boolean;
  isServiceWorkerActive: boolean;
  updateInfo: UpdateInfo;
  cacheStats: CacheStats | null;
  performanceMetrics: {
    hitRate: number;
    totalRequests: number;
    cacheHits: number;
    averageResponseTime: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

interface ServiceWorkerActions {
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
  refreshCacheStats: () => Promise<void>;
  initOptimizations: () => Promise<void>;
  getPerformanceMetrics: () => Promise<void>;
}

/**
 * Service Worker 管理 Hook
 * 提供完整的PWA功能管理，包括更新、缓存、离线状态等
 */
export function useServiceWorker(): ServiceWorkerState & ServiceWorkerActions {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isPWA: false,
    isOnline: navigator.onLine,
    isServiceWorkerActive: false,
    updateInfo: { available: false, waiting: false, installing: false },
    cacheStats: null,
    performanceMetrics: null,
    isLoading: true,
    error: null,
  });

  // 初始化状态
  useEffect(() => {
    const initializeState = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const offlineStatus = getOfflineStatus();
        const updateInfo = await getUpdateInfo();

        setState((prev) => ({
          ...prev,
          isSupported: isServiceWorkerSupported(),
          isPWA: isPWAMode(),
          isOnline: offlineStatus.isOnline,
          isServiceWorkerActive: offlineStatus.isServiceWorkerActive,
          updateInfo,
          isLoading: false,
        }));

        // 异步加载缓存统计和性能指标
        loadCacheStats();
        loadPerformanceMetrics();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : '初始化失败',
          isLoading: false,
        }));
      }
    };

    initializeState();
  }, []);

  // 设置更新监听器
  useEffect(() => {
    if (!state.isSupported) return;

    const cleanup = setupUpdateListener(
      () => {
        // 有新版本可用
        setState((prev) => ({
          ...prev,
          updateInfo: { ...prev.updateInfo, available: true, waiting: true },
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: `更新检查失败: ${error.message}`,
        }));
      },
    );

    return cleanup;
  }, [state.isSupported]);

  // 设置网络状态监听器
  useEffect(() => {
    const cleanup = setupNetworkListeners(
      () => {
        setState((prev) => ({ ...prev, isOnline: true }));
      },
      () => {
        setState((prev) => ({ ...prev, isOnline: false }));
      },
    );

    return cleanup;
  }, []);

  // 加载缓存统计
  const loadCacheStats = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const stats = await getCacheStats();
      setState((prev) => ({ ...prev, cacheStats: stats }));
    } catch (error) {
      console.error('获取缓存统计失败:', error);
    }
  }, [state.isSupported]);

  // 加载性能指标
  const loadPerformanceMetrics = useCallback(async () => {
    try {
      const metrics = await getCachePerformanceMetrics();
      setState((prev) => ({ ...prev, performanceMetrics: metrics }));
    } catch (error) {
      console.error('获取性能指标失败:', error);
    }
  }, []);

  // 检查更新
  const checkForUpdates = useCallback(async () => {
    if (!state.isSupported) {
      throw new Error('Service Worker 不被支持');
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const updateInfo = await getUpdateInfo();
      setState((prev) => ({
        ...prev,
        updateInfo,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '检查更新失败',
        isLoading: false,
      }));
    }
  }, [state.isSupported]);

  // 应用更新
  const applyUpdate = useCallback(async () => {
    if (!state.isSupported) {
      throw new Error('Service Worker 不被支持');
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await triggerSWUpdate();

      // 更新成功后，页面将重新加载
      // 这里不需要手动更新状态
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '应用更新失败',
        isLoading: false,
      }));
    }
  }, [state.isSupported]);

  // 刷新缓存统计
  const refreshCacheStats = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await loadCacheStats();
    setState((prev) => ({ ...prev, isLoading: false }));
  }, [loadCacheStats]);

  // 初始化优化
  const initOptimizations = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      await initServiceWorkerOptimizations();

      // 重新加载统计信息
      await loadCacheStats();

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : '初始化优化失败',
        isLoading: false,
      }));
    }
  }, [state.isSupported, loadCacheStats]);

  // 获取性能指标
  const getPerformanceMetrics = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await loadPerformanceMetrics();
    setState((prev) => ({ ...prev, isLoading: false }));
  }, [loadPerformanceMetrics]);

  return {
    ...state,
    checkForUpdates,
    applyUpdate,
    refreshCacheStats,
    initOptimizations,
    getPerformanceMetrics,
  };
}

/**
 * 轻量级Service Worker状态Hook
 * 只提供基本的状态信息，不包含操作方法
 */
export function useServiceWorkerStatus() {
  const [status, setStatus] = useState({
    isSupported: isServiceWorkerSupported(),
    isPWA: isPWAMode(),
    isOnline: navigator.onLine,
    hasUpdate: false,
  });

  useEffect(() => {
    // 检查更新状态
    if (status.isSupported) {
      getUpdateInfo().then((updateInfo) => {
        setStatus((prev) => ({
          ...prev,
          hasUpdate: updateInfo.available,
        }));
      });
    }

    // 网络状态监听
    const cleanup = setupNetworkListeners(
      () => setStatus((prev) => ({ ...prev, isOnline: true })),
      () => setStatus((prev) => ({ ...prev, isOnline: false })),
    );

    return cleanup;
  }, [status.isSupported]);

  return status;
}

/**
 * 缓存管理Hook
 * 专门用于缓存相关的操作
 */
export function useCacheManager() {
  const [cacheState, setCacheState] = useState<{
    stats: CacheStats | null;
    isLoading: boolean;
    error: string | null;
  }>({
    stats: null,
    isLoading: false,
    error: null,
  });

  const refreshStats = useCallback(async () => {
    if (!('caches' in window)) {
      setCacheState((prev) => ({
        ...prev,
        error: 'Cache API 不被支持',
      }));
      return;
    }

    try {
      setCacheState((prev) => ({ ...prev, isLoading: true, error: null }));

      const stats = await getCacheStats();

      setCacheState({
        stats,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setCacheState({
        stats: null,
        isLoading: false,
        error: error instanceof Error ? error.message : '获取缓存统计失败',
      });
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    ...cacheState,
    refreshStats,
  };
}

// 导出类型
export type { ServiceWorkerState, ServiceWorkerActions };
