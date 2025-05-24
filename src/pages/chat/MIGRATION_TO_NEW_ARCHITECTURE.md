# 🔄 聊天模块新架构迁移指南

## 📝 概述

本文档说明了从旧的 `useStreamingMessage` 架构迁移到新的核心 Hook 架构的完整过程。

## ✅ 已完成的迁移

### 1. ChatContainer.tsx 架构升级

**旧架构：**

```typescript
import { useStreamingChat } from '../hooks/useStreamingMessage';

const streamingChat = useStreamingChat();
```

**新架构：**

```typescript
import { useChatOrchestrator } from '../hooks/core/useChatOrchestrator';
import { useChatAPI } from '../hooks/integrations/useChatAPI';

const chatOrchestrator = useChatOrchestrator({
  onMessageSent: (message) => console.log('📤 消息发送:', message.content),
  onMessageReceived: (message) => console.log('📥 消息接收:', message.content),
  onError: (error) => console.error('💥 聊天错误:', error),
  onStreamingStart: () => console.log('🌊 开始流式接收'),
  onStreamingComplete: (content) =>
    console.log('✅ 流式接收完成:', content.length, '字符'),
});

const { sendMessage: sendMessageAPI } = useChatAPI();
```

### 2. 主要变更点

#### 2.1 状态属性映射

| 旧属性                                  | 新属性                                     | 说明         |
| --------------------------------------- | ------------------------------------------ | ------------ |
| `streamingChat.messages`                | `chatOrchestrator.messages`                | 消息列表     |
| `streamingChat.isStreaming`             | `chatOrchestrator.isStreaming`             | 流式状态     |
| `streamingChat.sendMessage()`           | `chatOrchestrator.sendMessage()`           | 发送消息     |
| `streamingChat.updateMessageFeedback()` | `chatOrchestrator.updateMessageFeedback()` | 更新反馈     |
| ❌ 不存在                               | `chatOrchestrator.error`                   | 错误状态     |
| ❌ 不存在                               | `chatOrchestrator.currentStreamingContent` | 当前流式内容 |

#### 2.2 消息类型变更

**旧类型：**

```typescript
interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
  chatHistoryId?: string; // 旧架构支持
}
```

**新类型：**

```typescript
interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
  isStreaming?: boolean; // 新增：流式状态
  error?: string; // 新增：错误信息
  // ❌ 移除：chatHistoryId (暂不支持)
}
```

#### 2.3 发送消息接口变更

**旧方式：**

```typescript
await streamingChat.sendMessage(content, (messageContent, onStream) => {
  return sendMessage(messageContent, onStream);
});
```

**新方式：**

```typescript
await chatOrchestrator.sendMessage(content, (messageContent, onStream) => {
  // 优先使用新的 API 方式
  if (sendMessageAPI) {
    return sendMessageAPI({
      content: messageContent,
      childId: childId || null,
      onStream,
    });
  } else {
    // 兼容旧的发送方式
    return sendMessage(messageContent, onStream);
  }
});
```

### 3. 新增功能

#### 3.1 错误处理增强

```typescript
{
  /* 错误状态显示 */
}
{
  chatOrchestrator.error && (
    <div className="bg-red-50 border-b border-red-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-red-700">
          {chatOrchestrator.error.message || '发送消息失败'}
        </span>
        <div className="flex items-center space-x-2">
          <button onClick={chatOrchestrator.retryLastMessage}>重试</button>
          <button onClick={chatOrchestrator.clearError}>忽略</button>
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 流式状态指示器

```typescript
{
  /* 流式状态指示器 */
}
{
  chatOrchestrator.isStreaming && (
    <div className="bg-blue-50 border-t border-blue-200 px-4 py-2">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-sm text-blue-700">AI正在思考中...</span>
        <div className="text-xs text-blue-500">
          已接收 {chatOrchestrator.currentStreamingContent.length} 字符
        </div>
      </div>
    </div>
  );
}
```

### 4. 兼容性处理

#### 4.1 历史消息加载

```typescript
// 🔄 迁移说明：setMessageList 现在通过编排器管理
// 由于编排器暂时没有直接的 setMessages 方法，
// 我们可以考虑在编排器中添加这个功能，或者通过其他方式初始化
console.debug('📚 加载历史消息:', historyMessages.length);
```

#### 4.2 消息反馈处理

```typescript
<MessageFeedback
  messageId={message.id}
  chatHistoryId={undefined} // 新架构暂不支持 chatHistoryId
  initialFeedback={message.feedback}
  onFeedbackChange={(feedback) => {
    handleMessageFeedback(message.id, feedback);
  }}
/>
```

## 🚧 待完成的迁移

### 1. 历史消息初始化

需要在 `useChatOrchestrator` 中添加 `setMessages` 方法或类似功能，以支持从 API 加载的历史消息初始化。

### 2. chatHistoryId 支持

如果需要支持消息的 `chatHistoryId`，需要在新的 `ChatMessage` 类型中添加此属性。

### 3. 其他组件迁移

继续迁移其他使用 `useStreamingMessage` 的组件。

## 🎯 迁移收益

### 1. 架构改进

- ✅ **职责分离**: 流式处理、消息管理、业务编排分离
- ✅ **类型安全**: 更完善的 TypeScript 类型定义
- ✅ **错误处理**: 统一的错误处理机制
- ✅ **状态管理**: 更清晰的状态管理逻辑

### 2. 开发体验

- ✅ **调试友好**: 详细的日志和状态跟踪
- ✅ **可扩展性**: 模块化设计便于功能扩展
- ✅ **可测试性**: 独立的 Hook 便于单元测试
- ✅ **文档完善**: 完整的类型定义和注释

### 3. 用户体验

- ✅ **错误提示**: 更友好的错误提示和重试机制
- ✅ **状态反馈**: 实时的流式处理状态显示
- ✅ **性能优化**: 更精确的状态更新和渲染控制

## 📚 相关文档

- [useChatOrchestrator Hook 文档](./hooks/core/useChatOrchestrator.ts)
- [useStreamProcessor Hook 文档](./hooks/core/useStreamProcessor.ts)
- [useMessageManager Hook 文档](./hooks/core/useMessageManager.ts)
- [聊天组件架构总览](./README.md)

## 🤝 问题反馈

如果在迁移过程中遇到问题，请：

1. 检查控制台日志，新架构提供了详细的调试信息
2. 确认 Hook 的使用方式符合新的接口定义
3. 参考本文档的示例代码
4. 如有疑问，请联系开发团队
