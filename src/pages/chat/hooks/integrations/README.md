# 🌐 聊天 API 集成 Hook

## 📝 概述

`useChatAPI` Hook 封装了聊天 API 调用逻辑，使用 `@/api/chat.ts` 中已有的接口，为业务组件提供统一的 API 接口。

## ✨ 主要特性

- ✅ **复用现有 API**: 使用 `@/api/chat.ts` 中的 `chat` 接口
- ✅ **流式支持**: 支持流式和同步两种消息发送方式
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **错误处理**: 统一的错误处理和包装
- ✅ **调试友好**: 详细的日志输出

## 🔧 API 接口

### SendMessageParams

```typescript
interface SendMessageParams {
  content: string; // 消息内容
  childId?: number | null; // 关联的孩子ID（可选）
  onStream?: (chunk: string) => void; // 流式响应回调（可选）
}
```

### ChatAPIHook

```typescript
interface ChatAPIHook {
  sendMessage: (params: SendMessageParams) => Promise<string>;
  sendMessageSync: (
    params: Omit<SendMessageParams, 'onStream'>,
  ) => Promise<string>;
}
```

## 📖 使用方法

### 基础用法

```typescript
import { useChatAPI } from '../hooks/integrations/useChatAPI';

function ChatComponent() {
  const { sendMessage, sendMessageSync } = useChatAPI();

  // 流式发送消息
  const handleStreamMessage = async () => {
    try {
      const response = await sendMessage({
        content: '宝宝发烧怎么办？',
        childId: 1,
        onStream: (chunk) => {
          console.log('接收到数据块:', chunk);
          // 处理流式数据
        },
      });
      console.log('完整响应:', response);
    } catch (error) {
      console.error('发送失败:', error);
    }
  };

  // 同步发送消息
  const handleSyncMessage = async () => {
    try {
      const response = await sendMessageSync({
        content: '宝宝睡眠时间不规律怎么办？',
        childId: 1,
      });
      console.log('同步响应:', response);
    } catch (error) {
      console.error('发送失败:', error);
    }
  };

  return (
    <div>
      <button onClick={handleStreamMessage}>流式发送</button>
      <button onClick={handleSyncMessage}>同步发送</button>
    </div>
  );
}
```

### 与聊天编排器集成

```typescript
import { useChatOrchestrator } from '../core/useChatOrchestrator';
import { useChatAPI } from '../integrations/useChatAPI';

function ChatContainer() {
  const { sendMessage: sendMessageAPI } = useChatAPI();

  const chatOrchestrator = useChatOrchestrator({
    onMessageSent: (message) => console.log('消息发送:', message),
    onMessageReceived: (message) => console.log('消息接收:', message),
    onError: (error) => console.error('聊天错误:', error),
  });

  const handleSend = async (content: string) => {
    await chatOrchestrator.sendMessage(content, (messageContent, onStream) => {
      return sendMessageAPI({
        content: messageContent,
        childId: 1,
        onStream,
      });
    });
  };

  return <div>{/* 聊天界面 */}</div>;
}
```

## 🔄 重构说明

### 从自定义请求到复用 API

**重构前（自定义 fetch 请求）:**

```typescript
// 直接使用 fetch API
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody),
});

// 手动处理流式响应
const reader = response.body.getReader();
const decoder = new TextDecoder();
// ... 复杂的流式处理逻辑
```

**重构后（复用现有 API）:**

```typescript
// 使用已有的 chat 接口
const response = await chat(requestData, onStream);
// 流式处理由 request.stream 自动处理
```

### 类型映射

| 参数     | Hook 接口  | API 接口   | 说明                                      |
| -------- | ---------- | ---------- | ----------------------------------------- |
| 消息内容 | `content`  | `message`  | Hook 统一使用 content，内部转换为 message |
| 孩子 ID  | `childId`  | `childId`  | 直接传递                                  |
| 流式回调 | `onStream` | `onStream` | 直接传递给 chat 接口                      |

### 响应数据

```typescript
// ChatStreamResponseDto 结构
interface ChatStreamResponseDto {
  type: 'content' | 'done' | 'error';
  content?: string; // AI回复内容片段
  chatId?: number; // 聊天记录ID（type为done时）
  error?: string; // 错误信息（type为error时）
}
```

## 🐛 错误处理

### 错误类型

1. **网络错误**: 请求失败、超时等
2. **API 错误**: 服务器返回错误状态
3. **数据错误**: 响应格式不正确

### 错误处理策略

```typescript
try {
  const response = await sendMessage(params);
  // 处理成功响应
} catch (error) {
  if (error instanceof Error) {
    // 已知错误类型
    console.error('错误信息:', error.message);
  } else {
    // 未知错误
    console.error('未知错误:', error);
  }
}
```

## 🔍 调试信息

Hook 提供详细的调试日志：

```typescript
// 发送消息时
console.debug('🌐 API发送消息:', { content, childId, hasStream: !!onStream });

// 响应完成时
console.debug('✅ API响应完成:', { chatId, type, childId });

// 错误时
console.error('❌ API请求失败:', error);
```

## 🚀 最佳实践

1. **错误处理**: 始终使用 try-catch 包装 API 调用
2. **流式处理**: 对于长文本回复，优先使用流式方式
3. **类型安全**: 利用 TypeScript 类型检查避免参数错误
4. **日志记录**: 在生产环境中适当调整日志级别
5. **性能优化**: 避免频繁的 API 调用，考虑防抖处理

## 📚 相关文档

- [chat.ts API 文档](../../../../api/chat.ts)
- [useChatOrchestrator Hook 文档](../core/useChatOrchestrator.ts)
- [聊天模块架构总览](../../README.md)
