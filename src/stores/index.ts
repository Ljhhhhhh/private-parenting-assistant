import { useUserStore } from './user';
import { useChildrenStore } from './children';
import { useAppStore } from './app';
import { storeOrchestrator } from './storeOrchestrator';

// 导出所有store
export { useUserStore, useChildrenStore, useAppStore };

// 导出store协调器
export { storeOrchestrator };

// 导出store协调器的类型（如果需要的话）
export type { StoreOrchestrator } from './storeOrchestrator';
