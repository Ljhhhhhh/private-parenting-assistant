import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SafeArea, DotLoading } from '@/components/ui';
import RequireAuth from '@/components/auth/RequireAuth';

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

// 加载状态组件
const Loading = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <DotLoading color="primary" />
  </div>
);

const App = () => (
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

        {/* 重定向 */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
    <SafeArea position="bottom" />
  </div>
);

export default App;
