# 🔄 会话切换方案迁移指南

## 📋 迁移概述

本指南介绍如何从基于路由参数的会话切换方案迁移到基于状态管理的方案。新方案提供更流畅的用户体验，避免 URL 频繁变化，并支持会话历史记录等高级功能。

## 🎯 迁移目标

### 旧方案的问题

- ✗ URL 频繁变化，影响用户体验
- ✗ 浏览器历史记录混乱
- ✗ 无法支持会话历史功能
- ✗ 路由状态与组件状态耦合

### 新方案的优势

- ✅ 流畅的会话切换体验
- ✅ 支持会话历史记录
- ✅ 状态管理更清晰
- ✅ 更好的性能表现
- ✅ 保持 URL 简洁

## 🔧 迁移步骤

### 1. 替换 Hook 导入

**旧代码：**

```typescript
import { useRouterParams } from '../hooks/useRouterParams';

const { currentConversationId, navigateToConversation, navigateToNewChat } =
  useRouterParams();
```

**新代码：**

```typescript
import { useConversationState } from '../hooks/useConversationState';

const conversationState = useConversationState({
  initialConversationId: null,
  enableHistory: true,
  maxHistorySize: 10,
  onConversationChange: (conversationId) => {
    console.log('🗂️ 会话切换:', conversationId);
  },
});
```

### 2. 更新会话选择逻辑

**旧代码：**

```typescript
const handleConversationSelect = useCallback(
  (conversationId: number | null) => {
    if (conversationId) {
      navigateToConversation(conversationId);
    } else {
      navigateToNewChat();
    }
    setIsSidebarOpen(false);
  },
  [navigateToConversation, navigateToNewChat],
);
```

**新代码：**

```typescript
const handleConversationSelect = useCallback(
  (conversationId: number | null) => {
    console.debug('🗂️ 用户选择会话:', conversationId);
    conversationState.selectConversation(conversationId);
    setIsSidebarOpen(false);
  },
  [conversationState],
);
```

### 3. 更新新建会话逻辑

**旧代码：**

```typescript
const handleNewConversation = useCallback(() => {
  navigateToNewChat();
  setIsSidebarOpen(false);
}, [navigateToNewChat]);
```

**新代码：**

```typescript
const handleNewConversation = useCallback(() => {
  console.debug('🆕 用户创建新会话');
  conversationState.createNewConversation();
  setIsSidebarOpen(false);
}, [conversationState]);
```

### 4. 更新组件属性传递

**旧代码：**

```typescript
<ConversationSidebar
  currentConversationId={currentConversationId}
  onConversationSelect={handleConversationSelect}
  // ...其他属性
/>

<ChatContainer
  initialConversationId={currentConversationId || undefined}
  // ...其他属性
/>
```

**新代码：**

```typescript
<ConversationSidebar
  currentConversationId={conversationState.currentConversationId}
  onConversationSelect={handleConversationSelect}
  // ...其他属性
/>

<ChatContainer
  initialConversationId={conversationState.currentConversationId || undefined}
  key={conversationState.currentConversationId || 'new'} // 🆕 强制重新渲染
  // ...其他属性
/>
```

## 🆕 新增功能

### 1. 会话历史记录

```typescript
// 返回上一个会话
const handleGoBack = () => {
  conversationState.goToPreviousConversation();
};

// 检查是否有历史记录
if (conversationState.previousConversationId) {
  // 显示返回按钮
}

// 查看历史记录
console.log('会话历史:', conversationState.conversationHistory);
```

### 2. 会话切换状态指示器

```typescript
// 显示切换状态
{
  conversationState.isSwitching && (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-sm text-blue-700">正在切换会话...</span>
      </div>
    </div>
  );
}
```

### 3. 会话管理操作

```typescript
// 清除历史记录
conversationState.clearHistory();

// 从历史记录中移除特定会话
conversationState.removeFromHistory(conversationId);
```

## 📊 API 对比

### useRouterParams (旧)

```typescript
interface RouterParams {
  currentConversationId: number | null;
  navigateToConversation: (id: number) => void;
  navigateToNewChat: () => void;
}
```

### useConversationState (新)

```typescript
interface UseConversationStateReturn {
  // 状态
  currentConversationId: number | null;
  previousConversationId: number | null;
  conversationHistory: number[];
  isSwitching: boolean;

  // 操作方法
  selectConversation: (conversationId: number | null) => void;
  createNewConversation: () => void;
  goToPreviousConversation: () => void;
  clearHistory: () => void;
  removeFromHistory: (conversationId: number) => void;
  getPresetQuestion: () => string | null; // 兼容性方法
}
```

## 🔧 配置选项

### 基础配置

```typescript
const conversationState = useConversationState({
  initialConversationId: null, // 初始会话ID
  enableHistory: true, // 启用历史记录
  maxHistorySize: 10, // 最大历史记录数量
  onConversationChange: (id) => {
    // 状态变化回调
    console.log('会话切换到:', id);
  },
});
```

### 高级配置

```typescript
const conversationState = useConversationState({
  initialConversationId: props.conversationId,
  enableHistory: true,
  maxHistorySize: 20,
  onConversationChange: (conversationId) => {
    // 会话切换时的自定义逻辑
    if (conversationId) {
      // 加载会话数据
      loadConversationData(conversationId);
    } else {
      // 清空相关状态
      clearChatState();
    }
  },
});
```

## 🧪 测试验证

### 功能测试清单

- [ ] 会话选择功能正常
- [ ] 新建会话功能正常
- [ ] 会话历史记录功能正常
- [ ] 返回上一个会话功能正常
- [ ] 会话切换状态指示器显示正常
- [ ] 预设问题兼容性正常
- [ ] 组件重新渲染正常

### 测试代码示例

```typescript
// 测试会话切换
const testConversationSwitch = () => {
  // 选择会话1
  conversationState.selectConversation(1);
  expect(conversationState.currentConversationId).toBe(1);

  // 选择会话2
  conversationState.selectConversation(2);
  expect(conversationState.currentConversationId).toBe(2);
  expect(conversationState.previousConversationId).toBe(1);

  // 返回上一个会话
  conversationState.goToPreviousConversation();
  expect(conversationState.currentConversationId).toBe(1);
};
```

## 🎨 UI 增强

### 新增 UI 组件

#### 1. 返回按钮

```typescript
{
  conversationState.previousConversationId && (
    <button
      onClick={conversationState.goToPreviousConversation}
      className="p-2 rounded-full hover:bg-[#FFF8F5] transition-colors group"
      aria-label="返回上一个会话"
      title="返回上一个会话"
    >
      <Icon
        icon="ph:arrow-left"
        width={20}
        height={20}
        className="text-[#FFB38A] group-hover:text-[#FF9966]"
      />
    </button>
  );
}
```

#### 2. 会话历史指示器

```typescript
{
  conversationState.conversationHistory.length > 0 && (
    <div className="text-xs text-[#999999] px-2 py-1">
      历史记录: {conversationState.conversationHistory.length} 个会话
    </div>
  );
}
```

## 🔄 向后兼容性

### 保持兼容的功能

1. **预设问题支持**: 通过`getPresetQuestion()`方法保持 URL 参数支持
2. **路由 Hook**: `useRouterParams`仍然可用，但建议迁移
3. **组件接口**: 现有组件接口保持不变

### 渐进式迁移

```typescript
// 阶段1: 同时支持两种方案
const useHybridConversationState = () => {
  const routerParams = useRouterParams();
  const conversationState = useConversationState({
    initialConversationId: routerParams.currentConversationId,
  });

  // 优先使用新方案，回退到旧方案
  return {
    ...conversationState,
    fallbackToRouter: routerParams,
  };
};

// 阶段2: 完全迁移到新方案
const conversationState = useConversationState();
```

## 📈 性能优化

### 优化点

1. **减少重新渲染**: 使用`key`属性强制重新渲染，避免状态污染
2. **状态缓存**: 会话历史记录自动去重和大小限制
3. **异步切换**: 支持切换状态指示器，提升用户体验

### 性能监控

```typescript
const conversationState = useConversationState({
  onConversationChange: (conversationId) => {
    // 性能监控
    performance.mark('conversation-switch-start');

    // 业务逻辑
    handleConversationChange(conversationId);

    performance.mark('conversation-switch-end');
    performance.measure(
      'conversation-switch',
      'conversation-switch-start',
      'conversation-switch-end',
    );
  },
});
```

## 🚀 最佳实践

### 1. 状态管理

```typescript
// ✅ 推荐：集中管理会话状态
const conversationState = useConversationState({
  enableHistory: true,
  maxHistorySize: 10,
});

// ❌ 避免：分散的状态管理
const [currentId, setCurrentId] = useState(null);
const [history, setHistory] = useState([]);
```

### 2. 错误处理

```typescript
const conversationState = useConversationState({
  onConversationChange: (conversationId) => {
    try {
      // 会话切换逻辑
      handleConversationSwitch(conversationId);
    } catch (error) {
      console.error('会话切换失败:', error);
      // 回退到安全状态
      conversationState.createNewConversation();
    }
  },
});
```

### 3. 用户体验

```typescript
// ✅ 提供视觉反馈
{
  conversationState.isSwitching && <LoadingIndicator />;
}

// ✅ 支持键盘导航
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && conversationState.previousConversationId) {
      conversationState.goToPreviousConversation();
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, [conversationState]);
```

## 🎯 迁移检查清单

### 代码迁移

- [ ] 替换`useRouterParams`为`useConversationState`
- [ ] 更新会话选择逻辑
- [ ] 更新新建会话逻辑
- [ ] 添加`key`属性到 ChatContainer
- [ ] 添加会话切换状态指示器

### 功能验证

- [ ] 会话切换功能正常
- [ ] 会话历史记录功能正常
- [ ] 预设问题兼容性正常
- [ ] 错误处理正常
- [ ] 性能表现良好

### 用户体验

- [ ] 切换动画流畅
- [ ] 状态指示器清晰
- [ ] 返回按钮可用
- [ ] 键盘导航支持

## 📚 相关文档

- [会话状态管理 Hook 文档](./src/pages/chat/hooks/useConversationState.ts)
- [会话自动创建功能指南](./CONVERSATION_CREATION_GUIDE.md)
- [聊天编排器文档](./src/pages/chat/hooks/core/useChatOrchestrator.ts)
- [调试指南](./DEBUGGING_GUIDE.md)

## 🎉 迁移完成

完成迁移后，您将获得：

- 🚀 **更流畅的用户体验**: 无 URL 跳转的会话切换
- 📚 **会话历史记录**: 支持返回上一个会话
- 🎯 **更好的状态管理**: 清晰的状态逻辑
- 🔧 **更强的扩展性**: 支持更多高级功能
- 📈 **更好的性能**: 减少不必要的重新渲染

迁移完成后，建议进行全面测试，确保所有功能正常工作。如有问题，可以参考调试指南或回退到旧方案。
