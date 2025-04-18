import React from 'react';
import { Bubble } from '@chatui/core';
import { Ellipsis } from 'antd-mobile';
import { ChatMessage } from '../types/chat.types';

interface MessageItemProps {
  message: ChatMessage;
}

/**
 * 渲染单个消息内容
 */
const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { content, position } = message;

  // 如果是AI回复，添加引用源和模型信息
  if (position === 'left' && content.data) {
    return (
      <div>
        <Bubble content={content.text} />

        {/* 如果有引用源，显示引用源 */}
        {content.data.sources && content.data.sources.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            <div className="mb-1 font-medium">参考资料：</div>
            <ul className="pl-4 list-disc">
              {content.data.sources.map((source: string, index: number) => (
                <li key={index}>
                  <Ellipsis direction="end" content={source} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // 普通消息
  return <Bubble content={content.text} />;
};

export default MessageItem;
