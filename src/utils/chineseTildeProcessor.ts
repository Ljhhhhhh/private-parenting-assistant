/**
 * 中文波浪号处理工具
 *
 * @description
 * 统一处理中文波浪号（～）被误识别为 Markdown 删除线的问题
 * 通过临时替换标记的方式，在数据传输和渲染过程中保护中文波浪号
 *
 * @author Chat Team
 * @since 1.0.0
 */

// 中文波浪号的临时替换标记
const CHINESE_TILDE_PLACEHOLDER = '__CHINESE_TILDE__';

/**
 * 预处理内容：将中文波浪号替换为临时标记
 *
 * @description
 * 在数据传输、解析或存储之前调用，避免中文波浪号被误识别为删除线
 *
 * @param content 原始内容
 * @returns 处理后的内容
 *
 * @example
 * ```typescript
 * const processed = preprocessChineseTilde('这是测试～内容～');
 * // 返回: '这是测试__CHINESE_TILDE__内容__CHINESE_TILDE__'
 * ```
 */
export const preprocessChineseTilde = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return content;
  }
  return content.replace(/～/g, CHINESE_TILDE_PLACEHOLDER);
};

/**
 * 后处理内容：将临时标记替换回中文波浪号
 *
 * @description
 * 在最终渲染或显示之前调用，恢复原始的中文波浪号字符
 *
 * @param content 包含临时标记的内容
 * @returns 恢复后的内容
 *
 * @example
 * ```typescript
 * const restored = postprocessChineseTilde('这是测试__CHINESE_TILDE__内容__CHINESE_TILDE__');
 * // 返回: '这是测试～内容～'
 * ```
 */
export const postprocessChineseTilde = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return content;
  }
  return content.replace(new RegExp(CHINESE_TILDE_PLACEHOLDER, 'g'), '～');
};

/**
 * 批量处理多个内容项
 *
 * @description
 * 用于批量处理数组中的多个内容项，如历史消息列表
 *
 * @param items 内容项数组
 * @param processor 处理函数（预处理或后处理）
 * @returns 处理后的数组
 *
 * @example
 * ```typescript
 * const processedMessages = batchProcess(messages, preprocessChineseTilde);
 * const restoredMessages = batchProcess(messages, postprocessChineseTilde);
 * ```
 */
export const batchProcess = <T extends { content?: string }>(
  items: T[],
  processor: (content: string) => string,
): T[] => {
  return items.map((item) => ({
    ...item,
    content: item.content ? processor(item.content) : item.content,
  }));
};

/**
 * 检查内容是否包含中文波浪号或临时标记
 *
 * @param content 要检查的内容
 * @returns 检查结果
 */
export const containsChineseTilde = (
  content: string,
): {
  hasOriginal: boolean;
  hasPlaceholder: boolean;
} => {
  if (!content || typeof content !== 'string') {
    return { hasOriginal: false, hasPlaceholder: false };
  }

  return {
    hasOriginal: content.includes('～'),
    hasPlaceholder: content.includes(CHINESE_TILDE_PLACEHOLDER),
  };
};

/**
 * 获取临时标记字符串（用于调试或测试）
 *
 * @returns 临时标记字符串
 */
export const getPlaceholder = (): string => {
  return CHINESE_TILDE_PLACEHOLDER;
};

/**
 * 验证处理结果的完整性
 *
 * @description
 * 用于验证预处理和后处理是否正确配对，确保没有遗漏的标记
 *
 * @param content 要验证的内容
 * @returns 验证结果
 */
export const validateProcessing = (
  content: string,
): {
  isValid: boolean;
  hasUnprocessedPlaceholders: boolean;
  placeholderCount: number;
} => {
  if (!content || typeof content !== 'string') {
    return {
      isValid: true,
      hasUnprocessedPlaceholders: false,
      placeholderCount: 0,
    };
  }

  const placeholderMatches = content.match(
    new RegExp(CHINESE_TILDE_PLACEHOLDER, 'g'),
  );
  const placeholderCount = placeholderMatches ? placeholderMatches.length : 0;
  const hasUnprocessedPlaceholders = placeholderCount > 0;

  return {
    isValid: !hasUnprocessedPlaceholders,
    hasUnprocessedPlaceholders,
    placeholderCount,
  };
};

// 导出常量供外部使用
export { CHINESE_TILDE_PLACEHOLDER as PLACEHOLDER };
