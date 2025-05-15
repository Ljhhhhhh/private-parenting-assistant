import React, { useRef, useState } from 'react';
import { DownOutline } from 'antd-mobile-icons';
import { useChatContext } from '../contexts/ChatContext';
import { useOutsideClick } from '../hooks/useOutsideClick';

/**
 * 会话选择器组件
 */
const SessionSelector: React.FC = () => {
  const { 
    chatId, 
    sessions, 
    handleNewSession, 
    handleSwitchSession 
  } = useChatContext();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 使用自定义hook处理点击外部关闭下拉菜单
  useOutsideClick(dropdownRef, showDropdown, () => setShowDropdown(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="mr-1">智能问答</span>
        <DownOutline fontSize={12} />
      </div>

      {showDropdown && (
        <div className="absolute left-0 z-10 p-2 mt-2 bg-white rounded-lg shadow-lg w-44">
          <div
            className={`p-2 rounded-md cursor-pointer ${
              !chatId ? 'bg-primary-50 text-primary-600' : ''
            }`}
            onClick={() => {
              handleNewSession();
              setShowDropdown(false);
            }}
          >
            新对话
          </div>
          {sessions.map((session) => (
            <div
              key={session}
              className={`p-2 rounded-md cursor-pointer ${
                chatId === session ? 'bg-primary-50 text-primary-600' : ''
              }`}
              onClick={() => {
                handleSwitchSession(session);
                setShowDropdown(false);
              }}
            >
              会话 {session.toString().substring(0, 8)}...
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionSelector;
