import React from 'react';
import { TabBar as AntTabBar } from 'antd-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageOutline,
  HistogramOutline,
  UserOutline,
  AppOutline,
} from 'antd-mobile-icons';

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const tabs = [
    {
      key: '/',
      title: '首页',
      icon: () => <AppOutline />,
    },
    {
      key: '/chat',
      title: '聊天',
      icon: () => <MessageOutline />,
    },
    {
      key: '/chat-history',
      title: '记录',
      icon: () => <HistogramOutline />,
    },
    {
      key: '/profile',
      title: '我的',
      icon: () => <UserOutline />,
    },
  ];

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  return (
    <div
      className="tab-bar-container"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50px',
        borderTop: '1px solid #eee',
        backgroundColor: '#fff',
        zIndex: 100,
      }}
    >
      <AntTabBar activeKey={pathname} onChange={handleTabChange}>
        {tabs.map((tab) => (
          <AntTabBar.Item key={tab.key} icon={tab.icon()} title={tab.title} />
        ))}
      </AntTabBar>
    </div>
  );
};

export default TabBar;
