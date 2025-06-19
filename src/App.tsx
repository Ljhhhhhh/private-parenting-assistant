import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SafeArea, DotLoading } from '@/components/ui';
import RequireAuth from '@/components/auth/RequireAuth';
import { usePWATheme } from '@/hooks/usePWATheme';
import { useServiceWorkerStatus } from '@/hooks/useServiceWorker';
import { initServiceWorkerOptimizations } from '@/utils/serviceWorker';
import { usePWAInstall } from '@/hooks/usePWAInstall';

// 在开发环境下导入PWA调试工具
if (process.env.NODE_ENV === 'development') {
  import('@/utils/pwaDebugHelper');
}

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Agreement = lazy(() => import('./pages/auth/Agreement'));
const ChildrenList = lazy(() => import('./pages/children/ChildrenList'));
const AddChild = lazy(() => import('./pages/children/AddChild'));
const EditChild = lazy(() => import('./pages/children/EditChild'));

// 主应用页面（需要登录后才能访问）
const Home = lazy(() => import('./pages/home/Home'));
const Chat = lazy(() => import('./pages/chat/Chat'));
const RecordHistory = lazy(() => import('./pages/record/Index'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const PrivacyPolicy = lazy(() => import('./pages/profile/PrivacyPolicy'));
const UserAgreement = lazy(() => import('./pages/UserAgreement'));
const Feedback = lazy(() => import('./pages/profile/Feedback'));

// 加载状态组件
const Loading = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <DotLoading color="primary" />
  </div>
);

const App = () => {
  // 初始化PWA主题管理
  usePWATheme();

  // 初始化PWA安装监听器（全局监听beforeinstallprompt事件）
  usePWAInstall();

  // Service Worker状态监控
  const swStatus = useServiceWorkerStatus();

  // 初始化Service Worker优化
  useEffect(() => {
    if (swStatus.isSupported) {
      initServiceWorkerOptimizations().catch((error) => {
        console.error('Service Worker优化初始化失败:', error);
      });
    }
  }, [swStatus.isSupported]);

  // 在控制台输出PWA状态信息（仅开发模式）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 PWA状态:', {
        支持SW: swStatus.isSupported,
        PWA模式: swStatus.isPWA,
        在线状态: swStatus.isOnline,
        有更新: swStatus.hasUpdate,
      });
    }
  }, [swStatus]);

  return (
    <div className="App">
      <SafeArea position="top" />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/agreement" element={<Agreement />} />

          {/* 受保护路由 */}
          <Route
            path="/children"
            element={
              <RequireAuth>
                <ChildrenList />
              </RequireAuth>
            }
          />
          <Route
            path="/children/add"
            element={
              <RequireAuth>
                <AddChild />
              </RequireAuth>
            }
          />
          <Route
            path="/children/edit/:id"
            element={
              <RequireAuth>
                <EditChild />
              </RequireAuth>
            }
          />

          {/* 主页 */}
          <Route
            path="/home"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />

          {/* 聊天页面 */}
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <Chat />
              </RequireAuth>
            }
          />

          {/* 历史记录页面 */}
          <Route
            path="/records"
            element={
              <RequireAuth>
                <RecordHistory />
              </RequireAuth>
            }
          />

          {/* 个人中心页面 */}
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* 隐私政策页面 */}
          <Route
            path="/privacy-policy"
            element={
              <RequireAuth>
                <PrivacyPolicy />
              </RequireAuth>
            }
          />

          {/* 用户协议页面 */}
          <Route
            path="/user-agreement"
            element={
              <RequireAuth>
                <UserAgreement />
              </RequireAuth>
            }
          />

          {/* 建议与反馈页面 */}
          <Route
            path="/feedback"
            element={
              <RequireAuth>
                <Feedback />
              </RequireAuth>
            }
          />

          {/* 重定向 */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
      <SafeArea position="bottom" />
    </div>
  );
};

export default App;
