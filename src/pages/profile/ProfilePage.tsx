import React, { useState } from 'react';
import { NavBar, List, Button, Switch } from 'antd-mobile';
import { LeftOutline, RightOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showDialog } = useMessage();
  const [darkMode, setDarkMode] = useState(false);

  // 处理返回
  const handleBack = () => {
    navigate('/');
  };

  // 处理退出登录
  const handleLogout = () => {
    showDialog({
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      onConfirm: () => {
        logout();
        navigate('/login');
      },
    });
  };

  // 处理暗黑模式切换
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    // 在实际应用中，这里应该应用暗黑模式
    showDialog({
      content: `${checked ? '开启' : '关闭'}暗黑模式`,
      confirmText: '确定',
    });
  };

  return (
    <div
      className="profile-page"
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* 头部导航栏 */}
      <NavBar
        back={<LeftOutline />}
        onBack={handleBack}
        style={{
          backgroundColor: '#fff',
          '--height': '45px',
          borderBottom: '1px solid #eee',
        }}
      >
        个人资料
      </NavBar>

      {/* 用户信息 */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#1677ff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: 32,
            fontWeight: 'bold',
          }}
        >
          {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <div style={{ marginLeft: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
            {user?.full_name || '未设置姓名'}
          </h2>
          <p style={{ color: '#666', margin: 0 }}>{user?.email}</p>
        </div>
      </div>

      {/* 设置列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List header="账号设置">
          <List.Item
            onClick={() => navigate('/profile/edit')}
            arrow={<RightOutline />}
          >
            编辑个人资料
          </List.Item>
          <List.Item
            onClick={() => navigate('/change-password')}
            arrow={<RightOutline />}
          >
            修改密码
          </List.Item>
        </List>

        <List header="应用设置">
          <List.Item
            extra={
              <Switch checked={darkMode} onChange={handleDarkModeChange} />
            }
          >
            暗黑模式
          </List.Item>
          <List.Item
            onClick={() => navigate('/chat-settings')}
            arrow={<RightOutline />}
          >
            聊天设置
          </List.Item>
          <List.Item
            onClick={() => navigate('/notifications')}
            arrow={<RightOutline />}
          >
            通知设置
          </List.Item>
        </List>

        <List header="关于">
          <List.Item
            onClick={() => navigate('/about')}
            arrow={<RightOutline />}
          >
            关于我们
          </List.Item>
          <List.Item
            onClick={() => navigate('/privacy')}
            arrow={<RightOutline />}
          >
            隐私政策
          </List.Item>
          <List.Item
            onClick={() => navigate('/terms')}
            arrow={<RightOutline />}
          >
            服务条款
          </List.Item>
        </List>

        <div style={{ padding: 16 }}>
          <Button block color="danger" onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
