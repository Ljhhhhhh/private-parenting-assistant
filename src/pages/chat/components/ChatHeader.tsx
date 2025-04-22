import React from 'react';
import SessionSelector from './SessionSelector';
import ChildSelector from './ChildSelector';
import MoreOptionsMenu from './MoreOptionsMenu';

/**
 * 聊天页面头部组件
 */
const ChatHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3">
      <SessionSelector />
      <div className="flex items-center">
        <ChildSelector />
        <MoreOptionsMenu />
      </div>
    </div>
  );
};

export default ChatHeader;
