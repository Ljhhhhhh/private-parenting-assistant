import React from 'react';
import { useUserStore, useAppStore, storeOrchestrator } from '@/stores';

/**
 * 示例组件：展示新的store架构使用方式
 */
export const StoreExample: React.FC = () => {
  // 从不同的store获取状态
  const { user, isAuthenticated, isLoading } = useUserStore();
  const { theme, isInitialized, hasChildren } = useAppStore();

  // 使用store的方法
  const { login } = useUserStore();
  const { toggleTheme } = useAppStore();

  // 处理登录
  const handleLogin = async () => {
    try {
      const result = await login('test@example.com', 'password');
      if (result.success) {
        // 通过协调器处理登录成功后的操作
        await storeOrchestrator.handleLoginSuccess();
      }
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      await storeOrchestrator.handleLogout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 获取应用状态摘要
  const appSummary = storeOrchestrator.getAppStateSummary();

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-xl font-bold">Store 状态示例</h2>

      {/* 认证状态 */}
      <div className="mb-4">
        <h3 className="mb-2 font-semibold">认证状态</h3>
        <p>已登录: {isAuthenticated ? '是' : '否'}</p>
        <p>用户: {user ? `${user.email} (${user.id})` : '未登录'}</p>
        <p>加载中: {isLoading ? '是' : '否'}</p>
      </div>

      {/* 应用状态 */}
      <div className="mb-4">
        <h3 className="mb-2 font-semibold">应用状态</h3>
        <p>已初始化: {isInitialized ? '是' : '否'}</p>
        <p>有儿童: {hasChildren ? '是' : '否'}</p>
        <p>主题: {theme}</p>
      </div>

      {/* 应用状态摘要 */}
      <div className="mb-4">
        <h3 className="mb-2 font-semibold">状态摘要</h3>
        <pre className="p-2 text-xs bg-gray-100 rounded">
          {JSON.stringify(appSummary, null, 2)}
        </pre>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleLogin}
          disabled={isLoading || isAuthenticated}
          className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-300"
        >
          {isLoading ? '登录中...' : '测试登录'}
        </button>

        <button
          onClick={handleLogout}
          disabled={!isAuthenticated}
          className="px-4 py-2 text-white bg-red-500 rounded disabled:bg-gray-300"
        >
          登出
        </button>

        <button
          onClick={toggleTheme}
          className="px-4 py-2 text-white bg-purple-500 rounded"
        >
          切换主题 (当前: {theme})
        </button>
      </div>
    </div>
  );
};
