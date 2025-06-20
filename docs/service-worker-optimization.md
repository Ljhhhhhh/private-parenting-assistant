# Service Worker 配置与缓存策略优化文档

## 概述

本文档记录了萌芽育儿应用的 Service Worker 配置优化，包括缓存策略、更新机制、离线功能等核心 PWA 特性的实现。

## 优化目标

### 1. 核心目标

- **离线可用性**：确保核心功能在离线状态下可用
- **快速加载**：通过智能缓存策略提升应用加载速度
- **用户体验**：平滑的更新体验，最小化用户感知的中断
- **移动优化**：针对移动网络环境优化缓存和更新策略

### 2. 设计原则

- **渐进增强**：基础功能优先，高级功能渐进加载
- **智能缓存**：根据资源类型和使用频率制定不同缓存策略
- **性能优先**：优化缓存命中率和资源加载速度
- **用户友好**：提供清晰的状态提示和操作引导

## 缓存策略详解

### 1. API 缓存策略

#### 1.1 通用 API 缓存 (NetworkFirst)

```typescript
{
  urlPattern: ({ url }) => url.pathname.startsWith('/api'),
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5, // 移动网络友好
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 24 * 60 * 60, // 24小时
      purgeOnQuotaError: true,
    }
  }
}
```

**特点：**

- 优先尝试网络请求
- 网络超时 5 秒后使用缓存
- 适合需要最新数据但允许离线的场景

#### 1.2 聊天记录缓存 (CacheFirst)

```typescript
{
  urlPattern: ({ url }) =>
    url.pathname.includes('/api/chat') ||
    url.pathname.includes('/api/conversation'),
  handler: 'CacheFirst',
  options: {
    cacheName: 'chat-cache',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
    }
  }
}
```

**特点：**

- 优先使用缓存，减少等待时间
- 历史对话数据变化较少，适合缓存优先
- 7 天缓存期，平衡存储空间和用户体验

#### 1.3 记录数据缓存 (NetworkFirst)

```typescript
{
  urlPattern: ({ url }) =>
    url.pathname.includes('/api/records') ||
    url.pathname.includes('/api/children'),
  handler: 'NetworkFirst',
  options: {
    cacheName: 'records-cache',
    networkTimeoutSeconds: 3,
    expiration: {
      maxEntries: 300,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
    }
  }
}
```

**特点：**

- 重要的育儿记录数据，需要最新状态
- 30 天长期缓存，支持长期离线查看
- 3 秒网络超时，快速降级到缓存

### 2. 静态资源缓存策略

#### 2.1 图片资源缓存 (CacheFirst)

```typescript
{
  urlPattern: ({ url, request }) =>
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i),
  handler: 'CacheFirst',
  options: {
    cacheName: 'images-cache',
    expiration: {
      maxEntries: 500,
      maxAgeSeconds: 60 * 24 * 60 * 60, // 60天
    }
  }
}
```

**特点：**

- 宝宝照片等媒体文件，一旦缓存很少变化
- 60 天长期缓存，减少重复下载
- 最多缓存 500 个文件，控制存储空间

#### 2.2 字体资源缓存 (CacheFirst)

```typescript
{
  urlPattern: ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com' ||
    url.pathname.match(/\.(woff|woff2|ttf|eot)$/i),
  handler: 'CacheFirst',
  options: {
    cacheName: 'fonts-cache',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
    }
  }
}
```

**特点：**

- 字体文件变化极少，适合长期缓存
- 1 年缓存期，最大化性能收益
- 支持 Google Fonts 等外部字体服务

#### 2.3 文档资源缓存 (StaleWhileRevalidate)

```typescript
{
  urlPattern: ({ url }) =>
    url.pathname.includes('/docs/') ||
    url.pathname.includes('/knowledge/'),
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'docs-cache',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
    }
  }
}
```

**特点：**

- 育儿知识等文档内容，后台更新策略
- 立即返回缓存，后台更新最新内容
- 平衡内容新鲜度和响应速度

## 高级优化特性

### 1. 智能缓存键策略

```typescript
plugins: [
  {
    cacheKeyWillBeUsed: async ({ request }) => {
      // 移除时间戳参数，提高缓存命中率
      const url = new URL(request.url);
      url.searchParams.delete('_t');
      url.searchParams.delete('timestamp');
      return url.toString();
    },
  },
];
```

### 2. 缓存容量管理

- **最大缓存大小**：50MB，适应移动设备存储限制
- **配额错误自动清理**：`purgeOnQuotaError: true`
- **LRU 清理策略**：自动清理最少使用的缓存项

### 3. 预缓存重要资源

```typescript
const importantUrls = [
  '/',
  '/chat',
  '/record',
  '/profile',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];
```

## 更新机制优化

### 1. 自动更新策略

- **registerType**: `autoUpdate` - 自动检测并应用更新
- **skipWaiting**: `true` - 立即激活新版本
- **clientsClaim**: `true` - 立即接管所有客户端

### 2. 用户体验优化

- **友好的更新提示**：使用 Dialog 组件显示更新内容
- **后台更新**：不中断用户当前操作
- **智能提醒**：避免频繁打扰用户

### 3. 错误处理

- **更新失败重试**：自动重试机制
- **降级策略**：更新失败时保持当前版本可用
- **用户反馈**：清晰的错误信息和操作指导

## 离线功能实现

### 1. 离线页面设计

- **位置**：`/public/offline.html`
- **功能**：显示离线状态，提供基本操作指导
- **样式**：符合应用设计风格，温暖友好

### 2. 离线功能特性

- **缓存状态检查**：显示本地缓存的数据量
- **网络状态监听**：自动检测网络恢复
- **功能指导**：告知用户离线模式下可用的功能

### 3. 网络恢复处理

```typescript
window.addEventListener('online', () => {
  window.location.href = '/';
});
```

## PWA 清单优化

### 1. 基础配置

```json
{
  "name": "萌芽育儿",
  "short_name": "萌芽育儿",
  "theme_color": "#4A90E2",
  "background_color": "#F5F7FA",
  "display": "standalone",
  "orientation": "portrait"
}
```

### 2. 图标配置

- **完整尺寸支持**：36x36 到 512x512
- **maskable 图标**：支持自适应图标
- **多用途图标**：`purpose: "any maskable"`

### 3. 快捷方式配置

```json
{
  "shortcuts": [
    {
      "name": "快速记录",
      "short_name": "记录",
      "url": "/record"
    },
    {
      "name": "智能问答",
      "short_name": "问答",
      "url": "/chat"
    }
  ]
}
```

## 性能监控

### 1. 缓存性能指标

- **缓存命中率**：监控各缓存策略的效果
- **响应时间**：跟踪资源加载速度
- **存储使用量**：监控缓存空间占用

### 2. 用户体验指标

- **首屏加载时间**：PWA 启动速度
- **离线可用性**：核心功能的离线覆盖率
- **更新体验**：更新流程的用户满意度

### 3. 开发调试

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('📱 PWA状态:', {
    支持SW: swStatus.isSupported,
    PWA模式: swStatus.isPWA,
    在线状态: swStatus.isOnline,
    有更新: swStatus.hasUpdate,
  });
}
```

## 部署注意事项

### 1. HTTPS 要求

- Service Worker 需要 HTTPS 环境
- 本地开发环境 localhost 除外

### 2. 缓存失效策略

- 静态资源文件名包含 hash
- API 响应设置合适的 Cache-Control 头
- 版本更新时清理过期缓存

### 3. 回退策略

- 提供 offline.html 作为离线回退页面
- 关键功能的客户端缓存备份
- 网络错误时的用户友好提示

## 最佳实践总结

### 1. 缓存策略选择

- **频繁变化的数据**：NetworkFirst
- **稳定的静态资源**：CacheFirst
- **需要后台更新的内容**：StaleWhileRevalidate

### 2. 用户体验原则

- **渐进增强**：基础功能优先保障
- **性能优先**：减少等待时间
- **透明反馈**：清晰的状态提示

### 3. 技术实现要点

- **错误处理**：完善的异常捕获和处理
- **内存管理**：合理的缓存大小和清理策略
- **兼容性**：考虑不同浏览器的支持情况

## 未来优化方向

### 1. 智能预缓存

- 基于用户行为预测需要缓存的资源
- 机器学习优化缓存策略

### 2. 增量更新

- 仅更新变化的部分，减少更新时间
- 差量补丁技术应用

### 3. 边缘计算

- CDN 层面的智能缓存
- 地理位置优化的资源分发

---

_此文档将随着功能迭代持续更新，确保与实际实现保持同步。_
