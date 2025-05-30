import React from 'react';

interface ChatHeaderProps {
  title?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
  return (
    <div className="px-4 py-3 bg-white border-b border-[#E0E0E0]">
      <h1 className="text-lg font-medium text-[#333333]">
        {title || '萌芽育儿助手'}
      </h1>
    </div>
  );
};
