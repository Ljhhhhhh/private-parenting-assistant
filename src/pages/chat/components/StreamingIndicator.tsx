import React from 'react';

interface StreamingIndicatorProps {
  isStreaming: boolean;
  streamingContentLength: number;
}

export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  isStreaming,
  streamingContentLength,
}) => {
  if (!isStreaming) return null;

  return (
    <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-sm text-blue-700">正在思考中...</span>
        <div className="text-xs text-blue-500">
          已接收 {streamingContentLength} 字符
        </div>
      </div>
    </div>
  );
};
