import React, { useRef, useState } from 'react';
import { Button } from 'antd-mobile';
import { DownOutline } from 'antd-mobile-icons';
import { useChatContext } from '../contexts/ChatContext';
import { useOutsideClick } from '../hooks/useOutsideClick';
import { calculateAge } from '../utils/ageCalculator';

/**
 * 儿童选择器组件
 */
const ChildSelector: React.FC = () => {
  const {
    children,
    selectedChild,
    handleSelectChild,
    handleGoToChildrenList,
    handleCreateChild,
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
        {selectedChild ? (
          <span className="mr-1">{selectedChild.name}</span>
        ) : (
          <span className="mr-1 text-gray-400">选择宝宝</span>
        )}
        <DownOutline fontSize={12} />
      </div>

      {showDropdown && (
        <div className="absolute right-0 z-10 p-2 mt-2 bg-white rounded-lg shadow-lg w-60">
          {children.length > 0 ? (
            <>
              {children.map((child) => (
                <div
                  key={child.id}
                  className={`p-2 rounded-md flex items-center cursor-pointer ${
                    selectedChild?.id === child.id
                      ? 'bg-primary-50 text-primary-600'
                      : ''
                  }`}
                  onClick={() => {
                    handleSelectChild(child.id);
                    setShowDropdown(false);
                  }}
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-primary-100">
                    {child.gender === 'male' ? '👦' : '👧'}
                  </div>
                  <div>
                    <div className="font-medium">{child.name}</div>
                    <div className="text-xs text-gray-500">
                      {calculateAge(child.birthday)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <Button
                  block
                  size="small"
                  onClick={() => {
                    handleGoToChildrenList();
                    setShowDropdown(false);
                  }}
                >
                  管理宝宝档案
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <div className="mb-2 text-gray-500">还没有宝宝档案</div>
              <Button
                color="primary"
                size="small"
                onClick={() => {
                  handleCreateChild();
                  setShowDropdown(false);
                }}
              >
                创建宝宝档案
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChildSelector;
