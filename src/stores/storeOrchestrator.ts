import { useUserStore } from './user';
import { useAppStore } from './app';
import { useChildrenStore } from './children';

/**
 * Store协调器
 * 负责处理不同store之间的状态同步和事件通信
 */
export class StoreOrchestrator {
  private static instance: StoreOrchestrator;
  private initialized = false;

  private constructor() {}

  static getInstance(): StoreOrchestrator {
    if (!StoreOrchestrator.instance) {
      StoreOrchestrator.instance = new StoreOrchestrator();
    }
    return StoreOrchestrator.instance;
  }

  /**
   * 初始化store协调器
   * 设置store之间的订阅关系
   */
  initialize() {
    if (this.initialized) return;

    // 订阅用户认证状态变化
    let previousAuthState = useUserStore.getState().isAuthenticated;

    useUserStore.subscribe((state) => {
      const currentAuthState = state.isAuthenticated;

      if (currentAuthState !== previousAuthState) {
        const appStore = useAppStore.getState();

        if (currentAuthState !== appStore.isAuthenticated) {
          appStore.setAuthenticated(currentAuthState);

          // 如果用户退出登录，清理相关数据
          if (!currentAuthState) {
            appStore.resetAppState();
            useChildrenStore.getState().clearChildren();
          }
        }

        previousAuthState = currentAuthState;
      }
    });

    this.initialized = true;
  }

  /**
   * 处理用户登录成功后的操作
   */
  async handleLoginSuccess() {
    const appStore = useAppStore.getState();

    try {
      // 设置认证状态
      appStore.setAuthenticated(true);

      // 刷新用户数据（儿童列表等）
      await appStore.refreshUserData();

      // 设置初始化完成
      appStore.setInitialized(true);
    } catch (error) {
      console.error('处理登录成功后的操作失败:', error);
    }
  }

  /**
   * 处理用户注册成功后的操作
   */
  async handleRegisterSuccess() {
    // 注册成功的处理逻辑与登录成功相同
    await this.handleLoginSuccess();
  }

  /**
   * 处理用户登出
   */
  async handleLogout() {
    const userStore = useUserStore.getState();
    const appStore = useAppStore.getState();
    const childrenStore = useChildrenStore.getState();

    try {
      // 调用退出登录API
      await userStore.logout();

      // 清理所有相关数据
      appStore.resetAppState();
      childrenStore.clearChildren();
    } catch (error) {
      console.error('处理登出失败:', error);
    }
  }

  /**
   * 获取当前应用状态摘要
   */
  getAppStateSummary() {
    const userStore = useUserStore.getState();
    const appStore = useAppStore.getState();
    const childrenStore = useChildrenStore.getState();

    return {
      isAuthenticated: userStore.isAuthenticated,
      isInitialized: appStore.isInitialized,
      hasChildren: appStore.hasChildren,
      currentChild: childrenStore.currentChild,
      user: userStore.user,
      theme: appStore.theme,
    };
  }
}

// 创建单例实例
export const storeOrchestrator = StoreOrchestrator.getInstance();

// 自动初始化
if (typeof window !== 'undefined') {
  storeOrchestrator.initialize();
}
