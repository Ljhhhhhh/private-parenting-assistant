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
} from './pages/auth';
import ProtectedRoute from './components/auth/AntProtectedRoute';
import Navbar from './components/layout/AntNavbar';
import TabBar from './components/layout/TabBar';
import Dashboard from './pages/Dashboard.tsx';
import ChatPage from './pages/chat/ChatPage';
import ChatHistoryPage from './pages/chat/ChatHistoryPage';
import ChatSettingsPage from './pages/chat/ChatSettingsPage';
import ProfilePage from './pages/profile/ProfilePage';

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
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div className="flex flex-col h-screen bg-white">
                      <Navbar />
                      <div className="flex-1 p-4 pb-16">
                        <Dashboard />
                      </div>
                      <TabBar />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <div className="flex flex-col h-screen bg-white">
                      <ChatPage />
                      <TabBar />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <ProtectedRoute>
                    <div className="flex flex-col h-screen bg-white">
                      <ChatPage />
                      <TabBar />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat-history"
                element={
                  <ProtectedRoute>
                    <div className="flex flex-col h-screen bg-white">
                      <ChatHistoryPage />
                      <TabBar />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat-settings"
                element={
                  <ProtectedRoute>
                    <ChatSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div className="flex flex-col h-screen bg-white">
                      <ProfilePage />
                      <TabBar />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </MessageProvider>
    </ConfigProvider>
  );
};

export default App;
