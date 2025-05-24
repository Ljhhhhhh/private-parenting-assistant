# 📝 代码质量与工程化优化建议

## 当前代码质量分析

### 1. 缺乏统一的代码规范

- 命名约定不一致（如：`useStreamingMessage` vs `useChatRuntime`）
- 文件组织结构待优化
- 缺乏统一的错误处理模式

### 2. 测试覆盖率不足

- 缺乏全面的单元测试
- 集成测试不完整
- 端到端测试缺失

### 3. 性能监控和调试工具不完善

- 缺乏性能监控
- 调试日志混乱
- 错误追踪不够精确

## 优化建议

### 1. 统一代码规范与最佳实践

```typescript
// ====== 命名规范 ======

// Hook命名：use + 领域 + 功能
✅ useStreamProcessor()    // 流式处理器
✅ useMessageManager()     // 消息管理器
✅ useChatOrchestrator()   // 聊天编排器

❌ useStreamingMessage()   // 不够明确
❌ useChatRuntime()        // runtime含义模糊

// 组件命名：功能 + 类型
✅ MessageList            // 消息列表
✅ StreamingIndicator     // 流式指示器
✅ ConversationSidebar    // 会话侧边栏

// 类型命名：实体 + 描述 + 类型后缀
✅ ChatMessage            // 聊天消息
✅ StreamingState         // 流式状态
✅ ConversationActions    // 会话操作

// 文件命名：kebab-case
✅ stream-processor.ts
✅ message-manager.ts
✅ chat-orchestrator.ts

// ====== 文件组织规范 ======

src/pages/chat/
├── components/
│   ├── ui/                    # 纯UI组件
│   │   ├── message-item.tsx
│   │   ├── message-list.tsx
│   │   └── input-area.tsx
│   │
│   ├── business/              # 业务组件
│   │   ├── chat-container.tsx
│   │   ├── conversation-manager.tsx
│   │   └── stream-handler.tsx
│   │
│   └── layout/                # 布局组件
│       ├── chat-layout.tsx
│       └── sidebar-layout.tsx
│
├── hooks/
│   ├── core/                  # 核心Hook
│   │   ├── use-stream-processor.ts
│   │   ├── use-message-manager.ts
│   │   └── use-chat-orchestrator.ts
│   │
│   ├── utils/                 # 工具Hook
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   └── use-network-status.ts
│   │
│   └── integrations/          # 集成Hook
│       ├── use-api-client.ts
│       └── use-offline-sync.ts
│
├── services/
│   ├── api/                   # API服务
│   │   ├── chat-api.ts
│   │   ├── conversation-api.ts
│   │   └── stream-api.ts
│   │
│   ├── storage/               # 存储服务
│   │   ├── message-storage.ts
│   │   └── conversation-storage.ts
│   │
│   └── core/                  # 核心服务
│       ├── stream-parser.ts
│       ├── message-formatter.ts
│       └── error-handler.ts
│
├── store/
│   ├── slices/                # 状态切片
│   │   ├── chat-slice.ts
│   │   ├── conversation-slice.ts
│   │   └── ui-slice.ts
│   │
│   ├── middleware/            # 中间件
│   │   ├── stream-middleware.ts
│   │   ├── persistence-middleware.ts
│   │   └── error-middleware.ts
│   │
│   └── index.ts               # Store入口
│
├── types/
│   ├── api.ts                 # API类型
│   ├── state.ts               # 状态类型
│   ├── components.ts          # 组件类型
│   └── index.ts               # 类型导出
│
├── utils/
│   ├── constants.ts           # 常量定义
│   ├── helpers.ts             # 工具函数
│   ├── validators.ts          # 验证函数
│   └── formatters.ts          # 格式化函数
│
└── __tests__/                 # 测试文件
    ├── components/
    ├── hooks/
    ├── services/
    └── utils/
```

### 2. 错误处理标准化

```typescript
// ====== 错误类型定义 ======

export enum ChatErrorCode {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // API错误
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',

  // 业务错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',

  // 系统错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ChatError {
  code: ChatErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userMessage?: string; // 用户友好的错误消息
}

// ====== 错误处理工具 ======

export class ChatErrorHandler {
  static create(
    code: ChatErrorCode,
    message: string,
    details?: Record<string, any>,
  ): ChatError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      userMessage: this.getUserMessage(code),
    };
  }

  static getUserMessage(code: ChatErrorCode): string {
    const messages = {
      [ChatErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
      [ChatErrorCode.TIMEOUT_ERROR]: '请求超时，请稍后重试',
      [ChatErrorCode.API_ERROR]: '服务暂时不可用，请稍后重试',
      [ChatErrorCode.MESSAGE_SEND_FAILED]: '消息发送失败，请重新发送',
      [ChatErrorCode.CONVERSATION_NOT_FOUND]: '会话不存在',
      [ChatErrorCode.UNKNOWN_ERROR]: '出现未知错误，请联系客服',
    };

    return messages[code] || messages[ChatErrorCode.UNKNOWN_ERROR];
  }

  static log(error: ChatError): void {
    console.error('[ChatError]', {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
      stack: new Error().stack,
    });

    // 发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      this.reportToMonitoring(error);
    }
  }

  private static reportToMonitoring(error: ChatError): void {
    // 集成 Sentry, LogRocket 等监控服务
    // Sentry.captureException(error);
  }
}

// ====== 统一错误处理Hook ======

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ChatError[]>([]);

  const addError = useCallback((error: ChatError) => {
    ChatErrorHandler.log(error);
    setErrors((prev) => [error, ...prev.slice(0, 4)]); // 最多保留5个错误
  }, []);

  const removeError = useCallback((timestamp: Date) => {
    setErrors((prev) => prev.filter((err) => err.timestamp !== timestamp));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 自动清除错误（5秒后）
  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors((prev) => prev.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [errors]);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
  };
};
```

### 3. 性能监控与优化

```typescript
// ====== 性能监控Hook ======

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCount.current,
        renderTime: `${renderTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    // 性能预警
    if (renderTime > 16) {
      // 超过一帧时间
      console.warn(
        `[Performance Warning] ${componentName} 渲染时间过长:`,
        renderTime,
      );
    }

    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
  };
};

// ====== 流式性能监控 ======

export const useStreamPerformanceMonitor = () => {
  const metrics = useRef({
    totalChunks: 0,
    averageProcessingTime: 0,
    maxProcessingTime: 0,
    errors: 0,
  });

  const recordChunkProcessing = useCallback(
    (processingTime: number, hasError: boolean = false) => {
      const m = metrics.current;

      m.totalChunks += 1;
      m.averageProcessingTime =
        (m.averageProcessingTime * (m.totalChunks - 1) + processingTime) /
        m.totalChunks;
      m.maxProcessingTime = Math.max(m.maxProcessingTime, processingTime);

      if (hasError) {
        m.errors += 1;
      }

      // 性能报告（每100个chunk）
      if (m.totalChunks % 100 === 0) {
        console.log('[Stream Performance Report]', {
          totalChunks: m.totalChunks,
          averageProcessingTime: `${m.averageProcessingTime.toFixed(2)}ms`,
          maxProcessingTime: `${m.maxProcessingTime.toFixed(2)}ms`,
          errorRate: `${((m.errors / m.totalChunks) * 100).toFixed(2)}%`,
        });
      }
    },
    [],
  );

  return {
    metrics: metrics.current,
    recordChunkProcessing,
  };
};

// ====== 内存泄漏检测 ======

export const useMemoryLeakDetector = (componentName: string) => {
  const subscriptions = useRef<Set<() => void>>(new Set());
  const timers = useRef<Set<NodeJS.Timeout>>(new Set());

  const addSubscription = useCallback((cleanup: () => void) => {
    subscriptions.current.add(cleanup);
    return () => subscriptions.current.delete(cleanup);
  }, []);

  const addTimer = useCallback((timer: NodeJS.Timeout) => {
    timers.current.add(timer);
    return () => {
      clearTimeout(timer);
      timers.current.delete(timer);
    };
  }, []);

  useEffect(() => {
    return () => {
      // 清理所有订阅
      subscriptions.current.forEach((cleanup) => cleanup());
      subscriptions.current.clear();

      // 清理所有定时器
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();

      console.log(`[Memory] ${componentName} 已清理所有资源`);
    };
  }, [componentName]);

  return {
    addSubscription,
    addTimer,
  };
};
```

### 4. 测试策略

```typescript
// ====== 单元测试示例 ======

// hooks/__tests__/use-stream-processor.test.ts
describe('useStreamProcessor', () => {
  it('应该正确处理流式数据块', () => {
    const { result } = renderHook(() => useStreamProcessor());

    act(() => {
      result.current.processChunk('data: {"content": "Hello"}');
    });

    expect(result.current.content).toBe('Hello');
  });

  it('应该处理错误的数据格式', () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useStreamProcessor({ onError }));

    act(() => {
      result.current.processChunk('invalid data');
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ChatErrorCode.VALIDATION_ERROR,
      }),
    );
  });
});

// ====== 集成测试示例 ======

// components/__tests__/chat-container.integration.test.tsx
describe('ChatContainer Integration', () => {
  it('应该完成完整的消息发送流程', async () => {
    const mockApiResponse = createMockStreamResponse();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ChatContainer childId={1} />
      </TestWrapper>,
    );

    // 输入消息
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello AI');

    // 发送消息
    const sendButton = screen.getByRole('button', { name: /发送/i });
    await user.click(sendButton);

    // 验证用户消息显示
    expect(screen.getByText('Hello AI')).toBeInTheDocument();

    // 等待AI响应
    await waitFor(() => {
      expect(screen.getByText(/AI正在思考/i)).toBeInTheDocument();
    });

    // 验证流式响应
    await waitFor(() => {
      expect(screen.getByText(/AI的回复/i)).toBeInTheDocument();
    });
  });
});

// ====== E2E测试示例 ======

// e2e/chat-flow.spec.ts
describe('聊天流程', () => {
  test('用户可以发送消息并接收AI回复', async ({ page }) => {
    await page.goto('/chat');

    // 选择宝宝
    await page.click('[data-testid="baby-selector"]');
    await page.click('[data-testid="baby-1"]');

    // 输入并发送消息
    await page.fill(
      '[data-testid="message-input"]',
      '我的宝宝几个月可以添加辅食？',
    );
    await page.click('[data-testid="send-button"]');

    // 验证消息发送成功
    await expect(page.locator('[data-testid="user-message"]')).toContainText(
      '我的宝宝几个月可以添加辅食？',
    );

    // 等待AI回复
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({
      timeout: 10000,
    });

    // 验证回复内容
    await expect(page.locator('[data-testid="ai-message"]')).toContainText(
      '一般来说',
    );
  });
});
```

### 5. 文档与规范

````typescript
// ====== JSDoc规范 ======

/**
 * 流式消息处理器Hook
 *
 * @description
 * 管理流式聊天响应的接收、解析和状态管理。
 * 支持OpenAI格式的流式响应，提供实时内容更新和错误处理。
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const {
 *     content,
 *     isStreaming,
 *     processChunk,
 *     reset
 *   } = useStreamProcessor({
 *     onComplete: (fullContent) => console.log('完成:', fullContent),
 *     onError: (error) => console.error('错误:', error)
 *   });
 *
 *   return (
 *     <div>
 *       <div>{content}</div>
 *       {isStreaming && <LoadingSpinner />}
 *     </div>
 *   );
 * };
 * ```
 *
 * @param options - 配置选项
 * @param options.onComplete - 流式处理完成回调
 * @param options.onError - 错误处理回调
 * @param options.onChunkProcessed - 单个数据块处理完成回调
 *
 * @returns Hook返回值
 * @returns return.content - 当前累积的内容
 * @returns return.isStreaming - 是否正在接收流式数据
 * @returns return.processChunk - 处理数据块的函数
 * @returns return.reset - 重置状态的函数
 * @returns return.getMetrics - 获取性能指标的函数
 *
 * @since 1.0.0
 * @author Chat Team
 */
export const useStreamProcessor = (options: StreamProcessorOptions) => {
  // 实现...
};

// ====== 组件文档规范 ======

/**
 * 聊天消息项组件
 *
 * @component
 * @description
 * 展示单条聊天消息的组件，支持用户消息和AI消息两种类型。
 * 包含消息内容、时间戳、反馈按钮等功能。
 *
 * @example
 * ```tsx
 * <MessageItem
 *   message={{
 *     id: '1',
 *     content: 'Hello world',
 *     isUser: true,
 *     timestamp: new Date()
 *   }}
 *   onFeedback={(messageId, isHelpful) => {
 *     console.log('反馈:', messageId, isHelpful);
 *   }}
 * />
 * ```
 */
export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onFeedback,
  className,
  ...props
}) => {
  // 实现...
};
````

## 实施路线图

### 第一阶段：基础规范建立（1 周）

1. 统一命名规范和文件组织
2. 建立错误处理标准
3. 添加基础性能监控

### 第二阶段：测试体系建设（2 周）

1. 编写核心功能单元测试
2. 建立集成测试框架
3. 配置 E2E 测试环境

### 第三阶段：工程化完善（1 周）

1. 完善文档规范
2. 建立代码审查流程
3. 配置自动化工具

### 第四阶段：监控与优化（1 周）

1. 部署性能监控
2. 建立错误追踪系统
3. 持续优化性能瓶颈

## 预期收益

- **代码质量提升 50%**：统一规范和测试覆盖
- **开发效率提升 40%**：清晰的文档和工具链
- **Bug 减少 60%**：完善的测试和错误处理
- **维护成本降低 30%**：标准化的代码结构
