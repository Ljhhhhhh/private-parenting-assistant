import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider } from 'antd-mobile';
import { AuthProvider } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/auth/index.ts';
import {
  CreateChildPage,
  ChildrenListPage,
  ChildDetailPage,
  EditChildPage,
} from './pages/children/index.ts';
import { RecordPage } from './pages/record/index.ts';
import { ChatPage } from './pages/chat/index.ts';
import ProtectedRoute from './components/auth/AntProtectedRoute';
import TabBar from './components/layout/TabBar';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <MessageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* 儿童档案相关路由 */}
              <Route
                path="/children"
                element={
                  <ProtectedRoute>
                    <ChildrenListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/children/create"
                element={
                  <ProtectedRoute>
                    <CreateChildPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/children/:id"
                element={
                  <ProtectedRoute>
                    <ChildDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/children/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditChildPage />
                  </ProtectedRoute>
                }
              />

              {/* 聊天页面 */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <div className="pb-12">
                      <ChatPage />
                      <TabBar />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/record"
                element={
                  <ProtectedRoute>
                    <div className="pb-12">
                      <RecordPage />
                      <TabBar />
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* 默认路由 */}
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </MessageProvider>
    </ConfigProvider>
  );
};

export default App;
