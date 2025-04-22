import React from 'react';
import { Button, Space } from 'antd-mobile';
import { useChatContext } from '../contexts/ChatContext';

/**
 * 儿童提示组件
 */
const ChildPrompt: React.FC = () => {
  const { showChildPrompt, setShowChildPrompt, handleCreateChild } = useChatContext();

  if (!showChildPrompt) return null;

  return (
    <div className="fixed left-0 right-0 z-10 p-3 top-16 bg-yellow-50 animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-yellow-800">
            添加宝宝档案，获取更精准的育儿建议
          </div>
          <div className="mt-1 text-xs text-yellow-700">
            根据宝宝的年龄和性别，我们可以提供更有针对性的回答
          </div>
        </div>
        <Space>
          <Button size="mini" onClick={() => setShowChildPrompt(false)}>
            稍后再说
          </Button>
          <Button size="mini" color="primary" onClick={handleCreateChild}>
            立即添加
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ChildPrompt;
