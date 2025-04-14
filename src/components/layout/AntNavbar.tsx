import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NavBar, Popover, Avatar } from 'antd-mobile';
import { UserOutline, CloseOutline, SetOutline } from 'antd-mobile-icons';

const AntNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const actions = [
    {
      key: 'profile',
      icon: <UserOutline />,
      text: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SetOutline />,
      text: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <CloseOutline />,
      text: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <NavBar
      style={{
        backgroundColor: '#fff',
        '--height': '45px',
        borderBottom: '1px solid #eee',
      }}
      right={
        <Popover.Menu actions={actions} placement="bottomRight" trigger="click">
          <Avatar
            style={{
              '--size': '32px',
              '--border-radius': '16px',
              backgroundColor: '#1677ff',
            }}
            src="https://images.unsplash.com/photo-1548532928-b34e3be62fc6?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
          ></Avatar>
        </Popover.Menu>
      }
    >
      Parenting Assistant
    </NavBar>
  );
};

export default AntNavbar;
