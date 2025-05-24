/**
 * 🌐 聊天API集成Hook
 *
 * @description
 * 封装聊天API调用逻辑，处理请求和流式响应
 * 提供统一的API接口给业务组件使用
 *
 * @author Chat Team
 * @since 1.0.0
 */

import { useCallback } from 'react';

// ========== 类型定义 ==========

export interface SendMessageParams {
  content: string;
  childId?: number | null;
  onStream?: (chunk: string) => void;
}

export interface ChatAPIHook {
  sendMessage: (params: SendMessageParams) => Promise<string>;
}

// ========== Hook实现 ==========

export const useChatAPI = (): ChatAPIHook => {
  /**
   * 发送消息并处理流式响应
   */
  const sendMessage = useCallback(
    async (params: SendMessageParams): Promise<string> => {
      const { content, childId, onStream } = params;

      console.debug('🌐 API发送消息:', { content, childId });

      try {
        // 构建请求体
        const requestBody = {
          content: content.trim(),
          childId: childId || undefined,
          stream: true, // 启用流式响应
        };

        // 发送请求
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(
            `API请求失败: ${response.status} ${response.statusText}`,
          );
        }

        if (!response.body) {
          throw new Error('响应体为空');
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // 解码数据块
            const chunk = decoder.decode(value, { stream: true });
            console.debug('🌊 接收数据块:', chunk.length, '字节');

            // 处理流式数据
            if (onStream) {
              onStream(chunk);
            }

            // 累积完整内容
            fullContent += chunk;
          }
        } finally {
          reader.releaseLock();
        }

        console.debug('✅ API响应完成:', {
          contentLength: fullContent.length,
          childId,
        });

        return fullContent;
      } catch (error) {
        console.error('❌ API请求失败:', error);

        // 包装错误信息
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error('发送消息失败，请稍后重试');
        }
      }
    },
    [],
  );

  return {
    sendMessage,
  };
};
