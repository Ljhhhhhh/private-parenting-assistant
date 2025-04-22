import React, { useRef, useState } from 'react';
import { Space } from 'antd-mobile';
import { 
  MoreOutline, 
  SetOutline, 
  DeleteOutline, 
  UserAddOutline 
} from 'antd-mobile-icons';
import { useChatContext } from '../contexts/ChatContext';
import { useOutsideClick } from '../hooks/useOutsideClick';

/**
 * 更多选项菜单组件
 */
const MoreOptionsMenu: React.FC = () => {
  const { sessionId, handleDeleteSession, handleCreateChild } = useChatContext();
  
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 使用自定义hook处理点击外部关闭菜单
  useOutsideClick(menuRef, showMenu, () => setShowMenu(false));

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="p-1 ml-2 cursor-pointer"
        onClick={() => setShowMenu(!showMenu)}
      >
        <MoreOutline fontSize={24} />
      </div>

      {showMenu && (
        <div className="absolute right-0 z-10 w-48 p-2 mt-2 bg-white rounded-lg shadow-lg">
          <Space direction="vertical" block>
            <div
              className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100"
              onClick={() => {
                // 打开设置
                setShowMenu(false);
              }}
            >
              <SetOutline className="mr-2" />
              <span>设置</span>
            </div>
            <div
              className={`p-2 flex items-center cursor-pointer hover:bg-gray-100 rounded-md ${
                !sessionId ? 'text-gray-300' : ''
              }`}
              onClick={() => {
                if (sessionId) {
                  handleDeleteSession();
                  setShowMenu(false);
                }
              }}
            >
              <DeleteOutline className="mr-2" />
              <span>删除会话</span>
            </div>
            <div
              className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100"
              onClick={() => {
                handleCreateChild();
                setShowMenu(false);
              }}
            >
              <UserAddOutline className="mr-2" />
              <span>添加宝宝档案</span>
            </div>
          </Space>
        </div>
      )}
    </div>
  );
};

export default MoreOptionsMenu;
