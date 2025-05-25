/**
 * 🌐 聊天API集成Hook
 *
 * @description
 * 封装聊天API调用逻辑，使用 @/api/chat.ts 中已有的接口
 * 提供统一的API接口给业务组件使用
 *
 * @author Chat Team
 * @since 1.0.0
 */

import { useCallback } from 'react';
import { chat } from '@/api/chat';
import type { ChatRequestDto } from '@/types/models';

// ========== 类型定义 ==========

export interface SendMessageParams {
  content: string;
  childId?: number | null;
  conversationId?: number | null;
  onStream?: (chunk: string) => void;
}

export interface ChatAPIHook {
  sendMessage: (params: SendMessageParams) => Promise<string>;
  sendMessageSync: (
    params: Omit<SendMessageParams, 'onStream'>,
  ) => Promise<string>;
}

// ========== Hook实现 ==========

export const useChatAPI = (): ChatAPIHook => {
  /**
   * 发送消息并处理流式响应
   */
  const sendMessage = useCallback(
    async (params: SendMessageParams): Promise<string> => {
      const { content, childId, conversationId, onStream } = params;

      console.debug('🌐 API发送消息:', {
        content,
        childId,
        conversationId,
        hasStream: !!onStream,
      });

      try {
        console.debug('🗂️ 使用会话API发送消息:', { conversationId });

        const requestData: ChatRequestDto = {
          message: content.trim(),
          childId: childId || undefined,
          conversationId: conversationId || undefined,
        };
        const response = await chat(requestData, onStream);

        console.debug('✅ 会话API响应完成:', {
          chatId: response.chatId,
          type: response.type,
          conversationId,
        });

        return response.content || '';
      } catch (error) {
        console.error('❌ API请求失败:', error);

        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error('发送消息失败，请稍后重试');
        }
      }
    },
    [],
  );

  /**
   * 发送消息并获取同步响应（不使用流式）
   */
  const sendMessageSync = useCallback(
    async (params: Omit<SendMessageParams, 'onStream'>): Promise<string> => {
      const { content, childId, conversationId } = params;

      console.debug('🌐 API发送同步消息:', {
        content,
        childId,
        conversationId,
      });

      try {
        console.debug('💬 发送同步消息');

        const requestData: ChatRequestDto = {
          message: content.trim(),
          childId: childId || undefined,
          conversationId: conversationId || undefined,
        };

        const response = await chat(requestData);

        console.debug('✅ 同步响应完成:', {
          chatId: response.chatId,
          type: response.type,
          childId,
        });

        return response.content || '';
      } catch (error) {
        console.error('❌ API同步请求失败:', error);

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
    sendMessageSync,
  };
};
