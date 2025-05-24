# ConversationSidebar 组件

## 📝 概述

ConversationSidebar 是会话管理侧边栏组件，已从 mock 数据升级为使用真实 API 接口。

## ✨ 主要特性

- ✅ **真实 API 集成**: 使用 `getConversations` 接口获取会话数据
- ✅ **智能搜索**: 支持按标题和消息内容搜索
- ✅ **归档管理**: 区分正常对话和已归档对话
- ✅ **加载状态**: 优雅的加载动画和错误处理
- ✅ **实时刷新**: 支持手动刷新和自动更新
- ✅ **响应式设计**: 适配不同屏幕尺寸

## 🔧 API 升级对比

### 旧版本 (Mock 数据)

```typescript
// 硬编码的 mock 数据
const mockConversations: MockConversation[] = [
  {
    id: 1,
    title: '宝宝发烧护理',
    preview: '宝宝今天有点发烧...',
    timestamp: '2024-01-15 10:30',
    isArchived: false,
  },
];
```

### 新版本 (真实 API)

```typescript
// 使用 useConversations Hook
const {
  conversations,
  loading,
  error,
  searchQuery,
  showArchived,
  setSearchQuery,
  toggleArchived,
  filterConversations,
  refreshConversations,
} = useConversations({
  childId,
  includeArchived: false,
  autoLoad: true,
});
```

## 📖 使用方法

```typescript
import { ConversationSidebar } from './components/ConversationSidebar';

function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const childId = 1; // 当前选中的孩子ID

  return (
    <div>
      <ConversationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentConversationId={currentConversationId}
        onConversationSelect={setCurrentConversationId}
        childId={childId}
      />
    </div>
  );
}
```

## 📊 状态管理

### 加载状态

- 🔄 **loading**: 显示旋转加载图标
- ❌ **error**: 显示错误信息和重试按钮
- ✅ **success**: 显示会话列表

### 交互状态

- 🔍 **搜索**: 实时过滤会话列表
- 📦 **归档**: 切换显示归档/正常对话
- 🎯 **选中**: 高亮当前选中的对话

## 🎨 UI 改进

### 状态指示器

```typescript
{
  /* 加载状态 */
}
{
  loading && (
    <div className="text-center py-8">
      <Icon icon="ph:spinner" className="animate-spin" />
      <p>加载中...</p>
    </div>
  );
}

{
  /* 错误状态 */
}
{
  error && (
    <div className="text-center py-8">
      <Icon icon="ph:warning-circle" />
      <p>{error.message}</p>
      <button onClick={handleRetry}>重试</button>
    </div>
  );
}
```

### 增强信息显示

- 📊 **消息数量**: 显示每个会话的消息数
- 🕒 **时间格式化**: 使用 `date-fns` 人性化时间显示
- 🔖 **归档标识**: 清晰标记已归档对话
- 📈 **统计信息**: 底部显示对话总数和筛选状态

## 🔌 API 集成

### 依赖的 API

```typescript
// 来自 @/api/chat.ts
export const getConversations = (params?: ConversationQueryParams) => {
  return request.get<ConversationResponseDto[]>('/chat/conversations', params);
};
```

### 查询参数

```typescript
interface ConversationQueryParams {
  childId?: number; // 筛选特定孩子的会话
  includeArchived?: boolean; // 是否包含已归档会话
  limit?: number; // 返回的最大记录数
  offset?: number; // 分页偏移量
}
```

### 响应数据

```typescript
interface ConversationResponseDto {
  id: number; // 会话ID
  userId: number; // 用户ID
  childId?: number; // 关联的孩子ID
  title?: string; // 会话标题
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  isArchived: boolean; // 是否归档
  messageCount: number; // 消息数量
  latestMessage?: ChatHistoryDto; // 最新一条消息
}
```

## 🚀 性能优化

### 数据获取优化

- ⚡ **自动加载**: 组件挂载时自动获取数据
- 🔄 **智能刷新**: 归档状态变化时重新加载
- 💾 **缓存策略**: 避免重复请求相同数据

### 用户体验优化

- 🎯 **即时搜索**: 搜索输入无延迟过滤
- 🔍 **高亮匹配**: 搜索结果高亮显示
- 📱 **响应式**: 适配手机和桌面端

## 🐛 错误处理

### 网络错误

```typescript
try {
  const response = await getConversations(queryParams);
  setConversations(response);
} catch (err) {
  setError(err instanceof Error ? err : new Error('加载会话列表失败'));
  setConversations([]); // 错误时显示空列表
}
```

### 用户友好提示

- 🚫 **无网络**: "网络连接异常，请检查网络设置"
- ⏰ **超时**: "请求超时，请稍后重试"
- 🔧 **服务器错误**: "服务器繁忙，请稍后重试"

## 🧪 测试用例

### 数据加载测试

- ✅ 正常加载会话列表
- ✅ 处理空列表情况
- ✅ 处理网络错误
- ✅ 处理 API 错误响应

### 交互测试

- ✅ 搜索功能正常工作
- ✅ 归档切换正常工作
- ✅ 会话选择正常工作
- ✅ 刷新功能正常工作

## 📝 迁移指南

如果你正在从旧版本升级，请注意以下变化：

### 1. 移除 Mock 数据

```diff
- const mockConversations: MockConversation[] = [...];
+ // 使用 useConversations Hook
```

### 2. 更新接口调用

```diff
- // 直接操作本地状态
- setSearchQuery(query);
+ // 通过 Hook 提供的方法
+ const { setSearchQuery } = useConversations();
```

### 3. 处理异步状态

```diff
+ // 添加加载和错误处理
+ {loading && <LoadingSpinner />}
+ {error && <ErrorMessage error={error} onRetry={handleRetry} />}
```

## 🎯 最佳实践

1. **错误边界**: 始终提供错误处理和重试机制
2. **加载状态**: 让用户了解数据加载进度
3. **空状态**: 为空列表提供友好的引导
4. **性能**: 避免不必要的 API 调用
5. **可访问性**: 确保键盘导航和屏幕阅读器支持
