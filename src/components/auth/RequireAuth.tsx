import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/user';
import { DotLoading } from '@/components/ui';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * 需要认证的路由组件包装器
 * 如果用户未登录，会重定向到登录页面
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);
  const checkAuth = useUserStore((s) => s.checkAuth);
  const isLoading = useUserStore((s) => s.isLoading);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // 如果用户状态未知且未正在加载
    if (!isAuthenticated && !isLoading && !hasChecked) {
      checkAuth().finally(() => {
        setHasChecked(true);
      });
    }
  }, [isAuthenticated, isLoading, checkAuth, hasChecked]);

  // 正在检查用户状态
  if (isLoading || (!isAuthenticated && !hasChecked)) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <DotLoading color="primary" />
      </div>
    );
  }

  // 未认证，重定向到登录页
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已认证，渲染子组件
  return <>{children}</>;
};

export default RequireAuth;
