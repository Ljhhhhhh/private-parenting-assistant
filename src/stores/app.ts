import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { deviceDetect } from '@/utils';
import { getAllChildren, getChildById } from '@/api/children';
import { useChildrenStore } from './children';
import { useUserStore } from './user';

interface AppState {
  // 基础状态
  theme: 'light' | 'dark';
  deviceInfo: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasChildren: boolean;

  // Actions
  toggleTheme: () => void;
  setLoading: (status: boolean) => void;
  setAuthenticated: (status: boolean) => void;
  setInitialized: (status: boolean) => void;
  setHasChildren: (status: boolean) => void;
  refreshUserData: () => Promise<void>;
  initializeApp: () => Promise<void>;
  resetAppState: () => void;

  // 私有方法
  _selectCurrentChild: (childrenData: any[]) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      theme: 'light',
      deviceInfo: deviceDetect(),
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,
      hasChildren: false,

      // 切换主题
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });

        // 更新DOM
        document.documentElement.setAttribute('data-theme', newTheme);
      },

      // 设置加载状态
      setLoading: (status: boolean) => {
        set({ isLoading: status });
      },

      // 设置认证状态
      setAuthenticated: (status: boolean) => {
        set({ isAuthenticated: status });
      },

      // 设置初始化状态
      setInitialized: (status: boolean) => {
        set({ isInitialized: status });
      },

      // 设置是否有儿童
      setHasChildren: (status: boolean) => {
        set({ hasChildren: status });
      },

      // 刷新用户数据（主要是儿童数据）
      refreshUserData: async () => {
        const { setChildren, setCurrentChild } = useChildrenStore.getState();

        try {
          set({ isLoading: true });

          // 获取儿童列表
          const childrenData = await getAllChildren();
          setChildren(childrenData);

          // 检查是否有儿童信息
          if (childrenData.length === 0) {
            set({ hasChildren: false });
            setCurrentChild(null);
            return;
          }

          set({ hasChildren: true });

          // 处理当前儿童选择
          await get()._selectCurrentChild(childrenData);
        } catch (error) {
          console.error('刷新用户数据失败:', error);
          set({ hasChildren: false });
        } finally {
          set({ isLoading: false });
        }
      },

      // 私有方法：选择当前儿童
      _selectCurrentChild: async (childrenData: any[]) => {
        const { setCurrentChild } = useChildrenStore.getState();

        // 从localStorage获取上次选择的儿童ID
        const lastSelectedChildId = localStorage.getItem('selected-child-id');

        if (lastSelectedChildId) {
          try {
            const childId = parseInt(lastSelectedChildId, 10);
            // 检查是否在当前儿童列表中
            const existsInList = childrenData.some(
              (child) => child.id === childId,
            );

            if (existsInList) {
              const childData = await getChildById(childId);
              setCurrentChild(childData);
            } else {
              // 如果不在列表中，默认选择第一个儿童
              setCurrentChild(childrenData[0]);
              localStorage.setItem(
                'selected-child-id',
                childrenData[0].id.toString(),
              );
            }
          } catch (error) {
            // 如果获取失败，默认选择第一个儿童
            console.error('获取儿童信息失败:', error);
            setCurrentChild(childrenData[0]);
            localStorage.setItem(
              'selected-child-id',
              childrenData[0].id.toString(),
            );
          }
        } else {
          // 没有上次选择记录，默认选择第一个儿童
          setCurrentChild(childrenData[0]);
          localStorage.setItem(
            'selected-child-id',
            childrenData[0].id.toString(),
          );
        }
      },

      // 初始化应用
      initializeApp: async () => {
        try {
          set({ isLoading: true });

          // 1. 首先初始化用户认证状态
          const userStore = useUserStore.getState();
          const authResult = await userStore.initializeAuth();

          if (authResult.success) {
            // 认证成功，设置认证状态
            set({ isAuthenticated: true });

            // 2. 加载儿童数据
            try {
              await get().refreshUserData();
            } catch (error) {
              console.error('加载儿童数据失败:', error);
              // 即使儿童数据加载失败，也不影响认证状态
            }
          } else {
            // 认证失败
            set({ isAuthenticated: false, hasChildren: false });
          }

          set({ isInitialized: true });
        } catch (error) {
          console.error('初始化应用失败:', error);
          set({
            isAuthenticated: false,
            hasChildren: false,
            isInitialized: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // 重置应用状态
      resetAppState: () => {
        set({
          isLoading: false,
          isAuthenticated: false,
          isInitialized: false,
          hasChildren: false,
        });
      },
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        theme: state.theme,
        // 其他状态不需要持久化，在应用启动时重新初始化
      }),
    },
  ),
);

// 初始化主题设置
if (typeof window !== 'undefined') {
  const store = useAppStore.getState();
  document.documentElement.setAttribute('data-theme', store.theme);
}
