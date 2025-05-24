/**
 * 流式响应解析器
 * 专门处理OpenAI格式的流式聊天响应
 */

interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
}

interface StreamParseResult {
  content: string;
  isComplete: boolean;
  messageId?: string;
  model?: string;
}

/**
 * 解析单个流式数据块
 * @param chunkData 原始数据块字符串
 * @returns 解析结果，如果解析失败返回null
 */
export const parseStreamChunk = (
  chunkData: string,
): StreamParseResult | null => {
  try {
    // 临时调试日志 - 生产环境应移除
    if (process.env.NODE_ENV === 'development') {
      console.debug('📥 接收到数据块:', JSON.stringify(chunkData));
    }

    // 首先检查是否是标准的 "data: " 格式
    if (chunkData.startsWith('data:')) {
      // 移除 "data: " 前缀
      const jsonData = chunkData.replace(/^data:\s*/, '').trim();

      // 跳过空数据和特殊标记
      if (!jsonData) {
        console.debug('🚫 跳过空数据');
        return null;
      }
      if (jsonData === '[DONE]') {
        console.debug('🏁 检测到流结束标记 [DONE]');
        // 返回一个明确的完成信号，但不包含内容
        return {
          content: '',
          isComplete: true,
          messageId: undefined,
          model: undefined,
        };
      }

      // 尝试解析JSON
      try {
        const chunk: StreamChunk = JSON.parse(jsonData);
        // console.debug('✅ JSON解析成功:', chunk); // 减少默认日志量

        // 提取内容
        const choice = chunk.choices?.[0];
        if (!choice) {
          // console.debug('⚠️ 无有效选择项'); // 减少默认日志量
          return null;
        }

        // OpenAI流有时只包含role，或者content为null，这通常不是实际要显示的内容
        if (choice.delta?.role && !choice.delta?.content) {
          console.debug('ℹ️ 跳过仅包含role的块:', choice.delta);
          return null;
        }

        // content 可能为 null 或 undefined
        const content = choice.delta?.content || '';
        const isComplete = choice.finish_reason !== null;

        if (content || isComplete) {
          // 只在有实际内容或完成时才返回
          // console.debug('📤 提取内容:', { content, isComplete }); // 减少默认日志量
          return {
            content,
            isComplete,
            messageId: chunk.id,
            model: chunk.model,
          };
        }
        // console.debug('🤔 无实际内容且未完成的块'); // 减少默认日志量
        return null;
      } catch (jsonError) {
        // JSON解析失败，可能是格式错误
        console.warn('❌ JSON解析失败:', { jsonData, error: jsonError });
        // 尝试提取是否有[DONE]字样，防止被截断的[DONE]无法识别
        if (jsonData.includes('[DONE]')) {
          console.warn('⚠️ 包含[DONE]但JSON解析失败，可能被截断，视为完成');
          return { content: '', isComplete: true };
        }
        return null;
      }
    } else {
      // 不是标准格式，可能是纯文本内容或错误格式
      const trimmedText = chunkData.trim();

      // 跳过空内容
      if (!trimmedText || trimmedText.length < 1) {
        // console.debug('🚫 跳过空文本'); // 减少默认日志量
        return null;
      }

      // 如果非data: 开头，但包含 [DONE] 字符串，也认为是结束标记
      if (trimmedText === '[DONE]') {
        console.debug('🏁 检测到非标准格式的流结束标记 [DONE]');
        return {
          content: '',
          isComplete: true,
          messageId: undefined,
          model: undefined,
        };
      }

      // 检查是否只包含控制字符
      if (trimmedText.charCodeAt(0) < 32 && trimmedText.length === 1) {
        // console.debug('🚫 跳过控制字符'); // 减少默认日志量
        return null;
      }

      // 检查是否看起来像是被意外分割的JSON
      // 进一步细化，只在确定是JSON一部分时才警告并跳过
      if (
        (trimmedText.startsWith('{') && !trimmedText.endsWith('}')) ||
        (trimmedText.startsWith('[') && !trimmedText.endsWith(']')) ||
        (trimmedText.includes('choices') &&
          trimmedText.includes('delta') &&
          !trimmedText.startsWith('{'))
      ) {
        console.warn('⚠️ 疑似JSON片段，但格式不完整或非标准:', trimmedText);
        return null;
      }

      // 如果文本不是以 { 开头，并且不包含常见的 JSON 结构特征，则认为是普通文本
      // 这有助于捕获API直接返回的错误信息文本
      if (
        !trimmedText.startsWith('{') &&
        !trimmedText.includes('"id":') &&
        !trimmedText.includes('"object":') &&
        !trimmedText.includes('"choices":')
      ) {
        console.debug('📝 检测到纯文本内容 (非data: 开头):', trimmedText);
        return {
          content: trimmedText,
          isComplete: false,
          messageId: undefined,
          model: undefined,
        };
      }

      console.warn('❓ 未知格式数据块，已跳过:', JSON.stringify(trimmedText));
      return null;
    }
  } catch (error) {
    console.warn('💥 解析流式数据块时发生严重错误:', chunkData, error);
    return null;
  }
};

/**
 * 流式消息累积器
 * 管理流式响应的状态和内容累积
 */
export class StreamAccumulator {
  private fullContent: string = '';
  private messageId: string | null = null;
  private model: string | null = null;
  private isComplete: boolean = false;

  /**
   * 处理新的数据块
   * @param chunkData 原始数据块字符串
   * @returns 当前累积的完整内容，如果无有效内容返回null
   */
  processChunk(chunkData: string): string | null {
    const parsed = parseStreamChunk(chunkData);

    if (!parsed) {
      return null;
    }

    // 更新元数据
    if (parsed.messageId) {
      this.messageId = parsed.messageId;
    }
    if (parsed.model) {
      this.model = parsed.model;
    }

    // 累积内容
    if (parsed.content) {
      this.fullContent += parsed.content;
    }

    // 检查是否完成
    if (parsed.isComplete) {
      this.isComplete = true;
    }

    return this.fullContent;
  }

  /**
   * 获取当前累积的完整内容
   */
  getFullContent(): string {
    return this.fullContent;
  }

  /**
   * 获取消息ID
   */
  getMessageId(): string | null {
    return this.messageId;
  }

  /**
   * 获取模型信息
   */
  getModel(): string | null {
    return this.model;
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
    this.fullContent = '';
    this.messageId = null;
    this.model = null;
    this.isComplete = false;
  }
}

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
  const lines = rawData.split('\n');

  let lastContent = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const currentContent = accumulator.processChunk(trimmedLine);
    if (currentContent !== null && currentContent !== lastContent) {
      // 只传递新增的内容
      const incrementalContent = currentContent.slice(lastContent.length);
      if (incrementalContent) {
        onChunk?.(incrementalContent, true);
      }
      lastContent = currentContent;
    }
  }

  return accumulator.getFullContent();
};

/**
 * 创建流式处理器Hook
 * @param onChunk 处理增量内容的回调
 * @param onComplete 流式响应完成的回调
 * @returns 处理函数
 */
export const createStreamProcessor = (
  onChunk?: (content: string) => void,
  onComplete?: (fullContent: string, messageId?: string) => void,
) => {
  const accumulator = new StreamAccumulator();
  let lastContent = '';

  return {
    /**
     * 处理原始数据块（可能包含多行）
     */
    processChunk: (rawChunkData: string) => {
      // 按行分割原始数据
      const lines = rawChunkData.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue; // 跳过空行

        const currentContent = accumulator.processChunk(trimmedLine);

        if (currentContent !== null && currentContent !== lastContent) {
          // 只传递新增的内容
          const incrementalContent = currentContent.slice(lastContent.length);
          if (incrementalContent && onChunk) {
            onChunk(incrementalContent);
          }
          lastContent = currentContent;
        }

        // 检查是否完成
        if (accumulator.getIsComplete() && onComplete) {
          onComplete(
            accumulator.getFullContent(),
            accumulator.getMessageId() || undefined,
          );
          return; // 完成后退出循环
        }
      }
    },

    /**
     * 获取当前状态
     */
    getState: () => ({
      fullContent: accumulator.getFullContent(),
      messageId: accumulator.getMessageId(),
      model: accumulator.getModel(),
      isComplete: accumulator.getIsComplete(),
    }),

    /**
     * 重置处理器
     */
    reset: () => {
      accumulator.reset();
      lastContent = '';
    },
  };
};
