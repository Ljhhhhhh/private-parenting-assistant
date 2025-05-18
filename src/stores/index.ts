import { useUserStore } from './user';
import { useChildrenStore } from './children';

// 导出所有store
export { useUserStore, useChildrenStore };

// 在开发环境下，将userStore暴露到window对象
// 这样request.ts中的刷新token逻辑可以访问到userStore
if (typeof window !== 'undefined') {
  (window as any).useUserStore = useUserStore;
}
