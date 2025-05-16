import React from 'react';
import { TabBar as AntTabBar, SafeArea } from 'antd-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppOutline,
  MessageOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons';

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const tabs = [
    {
      key: '/',
      title: '首页',
      icon: <AppOutline />,
    },
    {
      key: '/chat',
      title: '智能问答',
      icon: <MessageOutline />,
    },
    {
      key: '/records',
      title: '记录',
      icon: <UnorderedListOutline />,
    },
    {
      key: '/profile',
      title: '我的',
      icon: <UserOutline />,
    },
  ];

  const handleTabChange = (key: string) => {
    console.log(key, 'handleTabChange');
    navigate(key);
  };

  // 判断当前激活的标签
  const getActiveKey = () => {
    if (pathname === '/') return '/chat';
    if (pathname.startsWith('/chat')) return '/chat';
    if (pathname.startsWith('/children')) return '/';
    if (pathname.startsWith('/records')) return '/records';
    if (pathname.startsWith('/profile')) return '/profile';
    return pathname;
  };

  return (
    <div className="fixed right-0 bottom-0 left-0 bg-white border-t border-gray-200">
      <AntTabBar activeKey={getActiveKey()} onChange={handleTabChange}>
        {tabs.map((tab) => (
          <AntTabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
        ))}
      </AntTabBar>
      <SafeArea position="bottom" />
    </div>
  );
};

export default TabBar;
