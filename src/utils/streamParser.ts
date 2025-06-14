/**
 * 流式响应解析器
 * 专门处理SSE格式的流式聊天响应
 */

import {
  preprocessChineseTilde,
  postprocessChineseTilde,
} from './chineseTildeProcessor';

// 更新SSE响应数据结构，conversationId可能是数字类型
interface ChatStreamResponseDto {
  type: 'content' | 'done';
  content?: string;
  chatId?: string;
  conversationId?: string | number;
}

// SSE消息结构
interface SSEMessage {
  event?: string;
  id?: string;
  data?: string;
}

interface StreamParseResult {
  content: string;
  isComplete: boolean;
  chatId?: string;
  conversationId?: string;
}

/**
 * 解析单个完整的SSE事件
 * @param eventData 单个完整的SSE事件数据
 * @returns 解析后的SSE消息对象
 */
const parseSSEEvent = (eventData: string): SSEMessage => {
  const lines = eventData.trim().split('\n');
  const message: SSEMessage = {};

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('event:')) {
      message.event = trimmedLine.replace(/^event:\s*/, '').trim();
    } else if (trimmedLine.startsWith('id:')) {
      message.id = trimmedLine.replace(/^id:\s*/, '').trim();
    } else if (trimmedLine.startsWith('data:')) {
      message.data = trimmedLine.replace(/^data:\s*/, '').trim();
    }
  }

  return message;
};

/**
 * 解析单个SSE事件并返回内容
 * @param eventData 单个完整的SSE事件数据
 * @returns 解析结果，如果解析失败返回null
 */
const parseSSEEventContent = (eventData: string): StreamParseResult | null => {
  try {
    if (!eventData || !eventData.trim()) {
      return null;
    }

    // 解析SSE格式消息
    const sseMessage = parseSSEEvent(eventData);

    // 检查是否有data字段
    if (!sseMessage.data) {
      console.debug('⚠️ SSE消息缺少data字段:', sseMessage);
      return null;
    }

    // 记录事件类型用于调试
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        '📨 SSE事件类型:',
        sseMessage.event,
        '数据:',
        sseMessage.data,
      );
    }

    // 尝试解析JSON数据
    try {
      const chunk: ChatStreamResponseDto = JSON.parse(sseMessage.data);

      // 根据事件类型和数据类型进行处理
      switch (sseMessage.event) {
        case 'content': {
          // 内容事件 - 检查数据类型是否匹配
          if (chunk.type === 'content') {
            let content = chunk.content || '';

            // 🔧 使用统一的预处理函数，避免中文波浪号被误识别为删除线
            if (content) {
              content = preprocessChineseTilde(content);
            }

            return {
              content,
              isComplete: false,
            };
          } else {
            console.warn('⚠️ content事件的数据类型不匹配:', chunk.type);
            return null;
          }
        }

        case 'done': {
          // 完成事件 - 检查数据类型是否匹配
          if (chunk.type === 'done') {
            console.debug('🏁 检测到流结束标记 event: done');
            return {
              content: '',
              isComplete: true,
              chatId: chunk.chatId,
              // 确保conversationId转换为字符串
              conversationId: chunk.conversationId?.toString(),
            };
          } else {
            console.warn('⚠️ done事件的数据类型不匹配:', chunk.type);
            return null;
          }
        }

        default: {
          // 未知事件类型，尝试根据数据类型处理（向后兼容）
          console.debug(
            '🤔 未知SSE事件类型，尝试根据数据类型处理:',
            sseMessage.event,
          );

          switch (chunk.type) {
            case 'content': {
              let content = chunk.content || '';
              if (content) {
                content = preprocessChineseTilde(content);
              }
              return {
                content,
                isComplete: false,
              };
            }

            case 'done': {
              console.debug('🏁 检测到流结束标记 type: done');
              return {
                content: '',
                isComplete: true,
                chatId: chunk.chatId,
                conversationId: chunk.conversationId?.toString(),
              };
            }

            default:
              console.warn('❓ 未知的数据类型:', chunk.type);
              return null;
          }
        }
      }
    } catch (jsonError) {
      console.warn('❌ JSON解析失败:', {
        data: sseMessage.data,
        event: sseMessage.event,
        error: jsonError,
      });
      return null;
    }
  } catch (error) {
    console.warn('💥 解析SSE事件时发生严重错误:', eventData, error);
    return null;
  }
};

/**
 * 流式消息累积器
 * 管理流式响应的状态和内容累积，处理不完整的SSE事件
 */
export class StreamAccumulator {
  private buffer: string = ''; // 缓冲区，存储不完整的SSE事件
  private fullContent: string = '';
  private chatId: string | null = null;
  private conversationId: string | null = null;
  private isComplete: boolean = false;

  /**
   * 处理新的数据块（可能包含多个事件或不完整的事件）
   * @param chunkData 原始数据块字符串
   * @returns 当前累积的完整内容，如果无有效内容返回null
   */
  processChunk(chunkData: string): string | null {
    if (!chunkData) {
      return null;
    }

    // 临时调试日志 - 生产环境应移除
    if (process.env.NODE_ENV === 'development') {
      console.debug('📥 接收到SSE数据块:', JSON.stringify(chunkData));
    }

    // 将新数据添加到缓冲区
    this.buffer += chunkData;

    // 按双换行符分割事件（SSE规范）
    const events = this.buffer.split('\n\n');

    // 最后一个可能是不完整的事件，保留在缓冲区中
    this.buffer = events.pop() || '';

    let hasNewContent = false;

    // 处理完整的事件
    for (const event of events) {
      if (event.trim()) {
        const parsed = parseSSEEventContent(event);

        if (parsed) {
          // 更新元数据
          if (parsed.chatId) {
            this.chatId = parsed.chatId;
          }
          if (parsed.conversationId) {
            this.conversationId = parsed.conversationId;
          }

          // 累积内容
          if (parsed.content) {
            this.fullContent += parsed.content;
            hasNewContent = true;
          }

          // 检查是否完成
          if (parsed.isComplete) {
            this.isComplete = true;
          }
        }
      }
    }

    return hasNewContent || this.isComplete ? this.fullContent : null;
  }

  /**
   * 获取当前累积的完整内容（恢复中文波浪号）
   */
  getFullContent(): string {
    return postprocessChineseTilde(this.fullContent);
  }

  /**
   * 获取聊天记录ID
   */
  getChatId(): string | null {
    return this.chatId;
  }

  /**
   * 获取会话ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }

  /**
   * 检查是否完成
   */
  getIsComplete(): boolean {
    return this.isComplete;
  }

  /**
   * 重置累积器
   */
  reset(): void {
    this.buffer = '';
    this.fullContent = '';
    this.chatId = null;
    this.conversationId = null;
    this.isComplete = false;
  }
}

/**
 * 解析单个流式数据块（向后兼容）
 * @deprecated  parseSSEEventContent 建议直接使用 StreamAccumulator
 */

/**
 * 处理多行流式数据
 * @param rawData 包含多行的原始数据
 * @param onChunk 处理每个有效内容块的回调
 * @returns 累积的完整内容
 */
export const processStreamData = (
  rawData: string,
  onChunk?: (content: string, isIncremental: boolean) => void,
): string => {
  const accumulator = new StreamAccumulator();
  const result = accumulator.processChunk(rawData);

  if (result !== null && onChunk) {
    // 传递恢复后的内容
    onChunk(postprocessChineseTilde(result), true);
  }

  return accumulator.getFullContent();
};

/**
 * 创建流式处理器Hook
 * @param onChunk 处理完整内容的回调
 * @param onComplete 流式响应完成的回调
 * @returns 处理函数
 */
export const createStreamProcessor = (
  onChunk?: (content: string) => void,
  onComplete?: (
    fullContent: string,
    chatId?: string,
    conversationId?: string,
  ) => void,
) => {
  const accumulator = new StreamAccumulator();

  return {
    /**
     * 处理原始数据块（可能包含多行）
     */
    processChunk: (rawChunkData: string) => {
      const result = accumulator.processChunk(rawChunkData);

      if (result !== null && onChunk) {
        // 传递恢复后的完整内容给回调
        onChunk(postprocessChineseTilde(result));
      }

      // 检查是否完成
      if (accumulator.getIsComplete()) {
        if (onComplete) {
          // 处理完成
          onComplete(
            accumulator.getFullContent(),
            accumulator.getChatId() || undefined,
            accumulator.getConversationId() || undefined,
          );
        }
      }
    },

    /**
     * 获取当前状态
     */
    getState: () => ({
      fullContent: accumulator.getFullContent(),
      chatId: accumulator.getChatId(),
      conversationId: accumulator.getConversationId(),
      isComplete: accumulator.getIsComplete(),
    }),

    /**
     * 重置处理器
     */
    reset: () => {
      accumulator.reset();
    },
  };
};
