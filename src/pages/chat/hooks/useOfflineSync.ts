import { useState, useEffect, useCallback } from 'react';
import { useConversationStore } from './useConversationStore';
import { useMessageStore } from './useMessageStore';
import type { ConversationResponseDto } from '../types/chat';

interface OfflineAction {
  id: string;
  type:
    | 'create_conversation'
    | 'update_conversation'
    | 'delete_conversation'
    | 'send_message';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineSyncState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  isSyncing: boolean;
  lastSyncTime: number | null;
}

/**
 * 离线支持和数据同步Hook
 * 提供离线状态检测、数据缓存、自动同步等功能
 */
export const useOfflineSync = () => {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    pendingActions: [],
    isSyncing: false,
    lastSyncTime: null,
  });

  const conversationStore = useConversationStore();
  const messageStore = useMessageStore();

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      // 网络恢复时自动同步
      syncPendingActions();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 从localStorage加载待同步的操作
  useEffect(() => {
    const savedActions = localStorage.getItem('offline_pending_actions');
    if (savedActions) {
      try {
        const actions = JSON.parse(savedActions);
        setState((prev) => ({ ...prev, pendingActions: actions }));
      } catch (error) {
        console.error('加载离线操作失败:', error);
        localStorage.removeItem('offline_pending_actions');
      }
    }

    const lastSync = localStorage.getItem('last_sync_time');
    if (lastSync) {
      setState((prev) => ({ ...prev, lastSyncTime: parseInt(lastSync) }));
    }
  }, []);

  // 保存待同步操作到localStorage
  const savePendingActions = useCallback((actions: OfflineAction[]) => {
    localStorage.setItem('offline_pending_actions', JSON.stringify(actions));
  }, []);

  // 添加离线操作
  const addOfflineAction = useCallback(
    (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
      const newAction: OfflineAction = {
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      setState((prev) => {
        const newActions = [...prev.pendingActions, newAction];
        savePendingActions(newActions);
        return { ...prev, pendingActions: newActions };
      });

      return newAction.id;
    },
    [savePendingActions],
  );

  // 移除已完成的操作
  const removeOfflineAction = useCallback(
    (actionId: string) => {
      setState((prev) => {
        const newActions = prev.pendingActions.filter(
          (action) => action.id !== actionId,
        );
        savePendingActions(newActions);
        return { ...prev, pendingActions: newActions };
      });
    },
    [savePendingActions],
  );

  // 同步单个操作
  const syncAction = useCallback(
    async (action: OfflineAction): Promise<boolean> => {
      try {
        switch (action.type) {
          case 'create_conversation':
            await conversationStore.createConversation(
              action.data.childId,
              action.data.title,
            );
            break;

          case 'update_conversation':
            await conversationStore.updateConversation(
              action.data.id,
              action.data.updates,
            );
            break;

          case 'delete_conversation':
            await conversationStore.deleteConversation(action.data.id);
            break;

          case 'send_message': {
            // 使用外部函数发送消息
            const { sendMessageToConversation } = await import(
              './useMessageStore'
            );
            await sendMessageToConversation(
              action.data.conversationId,
              action.data.message,
            );
            break;
          }

          default:
            console.warn('未知的离线操作类型:', action.type);
            return false;
        }

        return true;
      } catch (error) {
        console.error('同步操作失败:', action.type, error);
        return false;
      }
    },
    [conversationStore, messageStore],
  );

  // 同步所有待处理的操作
  const syncPendingActions = useCallback(async () => {
    if (
      !state.isOnline ||
      state.isSyncing ||
      state.pendingActions.length === 0
    ) {
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true }));

    const maxRetries = 3;
    const actionsToSync = [...state.pendingActions];
    const failedActions: OfflineAction[] = [];

    for (const action of actionsToSync) {
      const success = await syncAction(action);

      if (success) {
        removeOfflineAction(action.id);
      } else {
        // 增加重试次数
        const updatedAction = {
          ...action,
          retryCount: action.retryCount + 1,
        };

        if (updatedAction.retryCount < maxRetries) {
          failedActions.push(updatedAction);
        } else {
          // 超过最大重试次数，移除操作
          console.error('操作同步失败，已达到最大重试次数:', action);
          removeOfflineAction(action.id);
        }
      }
    }

    // 更新失败的操作
    if (failedActions.length > 0) {
      setState((prev) => {
        const newActions = prev.pendingActions.map((action) => {
          const failedAction = failedActions.find((fa) => fa.id === action.id);
          return failedAction || action;
        });
        savePendingActions(newActions);
        return { ...prev, pendingActions: newActions };
      });
    }

    // 更新最后同步时间
    const now = Date.now();
    localStorage.setItem('last_sync_time', now.toString());

    setState((prev) => ({
      ...prev,
      isSyncing: false,
      lastSyncTime: now,
    }));
  }, [
    state.isOnline,
    state.isSyncing,
    state.pendingActions,
    syncAction,
    removeOfflineAction,
    savePendingActions,
  ]);

  // 手动触发同步
  const manualSync = useCallback(async () => {
    if (state.isOnline) {
      await syncPendingActions();
    }
  }, [state.isOnline, syncPendingActions]);

  // 清除所有离线数据
  const clearOfflineData = useCallback(() => {
    setState((prev) => ({ ...prev, pendingActions: [] }));
    localStorage.removeItem('offline_pending_actions');
    localStorage.removeItem('last_sync_time');
  }, []);

  // 离线创建会话
  const createConversationOffline = useCallback(
    (childId: number, title?: string) => {
      if (state.isOnline) {
        return conversationStore.createConversation(childId, title);
      }

      // 离线模式：添加到待同步队列
      addOfflineAction({
        type: 'create_conversation',
        data: { childId, title },
      });

      // 创建临时会话对象
      const tempConversation: ConversationResponseDto = {
        id: -Date.now(), // 使用负数作为临时ID
        userId: 0, // 临时用户ID
        childId,
        title: title || '新对话',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
        messageCount: 0,
      };

      // 添加到本地状态
      conversationStore.selectConversation(tempConversation.id);

      return Promise.resolve(tempConversation);
    },
    [state.isOnline, conversationStore, addOfflineAction],
  );

  // 离线发送消息
  const sendMessageOffline = useCallback(
    async (conversationId: number, message: string) => {
      if (state.isOnline) {
        const { sendMessageToConversation } = await import('./useMessageStore');
        return sendMessageToConversation(conversationId, message);
      }

      // 离线模式：添加到待同步队列
      addOfflineAction({
        type: 'send_message',
        data: { conversationId, message },
      });

      // 创建临时消息并添加到待发送列表
      const tempId = `temp_${Date.now()}`;
      messageStore.addPendingMessage(tempId, message);

      return Promise.resolve();
    },
    [state.isOnline, messageStore, addOfflineAction],
  );

  // 获取同步状态信息
  const getSyncStatus = useCallback(() => {
    const now = Date.now();
    const lastSyncAgo = state.lastSyncTime ? now - state.lastSyncTime : null;

    return {
      isOnline: state.isOnline,
      isSyncing: state.isSyncing,
      pendingCount: state.pendingActions.length,
      lastSyncTime: state.lastSyncTime,
      lastSyncAgo,
      needsSync: state.pendingActions.length > 0,
    };
  }, [state]);

  return {
    // 状态
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    pendingActions: state.pendingActions,

    // 操作方法
    syncPendingActions,
    manualSync,
    clearOfflineData,
    createConversationOffline,
    sendMessageOffline,

    // 工具方法
    getSyncStatus,
    addOfflineAction,
    removeOfflineAction,
  };
};

/**
 * 网络状态Hook
 * 简化的网络状态检测
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * 数据缓存Hook
 * 提供本地数据缓存功能
 */
export const useDataCache = <T>(key: string, defaultValue: T) => {
  const [data, setData] = useState<T>(() => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const updateCache = useCallback(
    (newData: T) => {
      setData(newData);
      localStorage.setItem(`cache_${key}`, JSON.stringify(newData));
    },
    [key],
  );

  const clearCache = useCallback(() => {
    setData(defaultValue);
    localStorage.removeItem(`cache_${key}`);
  }, [key, defaultValue]);

  return [data, updateCache, clearCache] as const;
};
