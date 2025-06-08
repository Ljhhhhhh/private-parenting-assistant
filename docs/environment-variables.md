# 环境变量配置说明

## 概述

本项目使用 Vite 的环境变量系统来管理不同环境下的配置。环境变量文件会根据当前的构建模式自动加载。

## 环境变量文件

项目支持以下环境变量文件：

- `.env` - 所有环境下都会加载的基础配置
- `.env.local` - 本地环境配置（会被 git 忽略）
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

## 加载优先级

环境变量的加载优先级（从高到低）：

1. `.env.[mode].local`
2. `.env.local`
3. `.env.[mode]`
4. `.env`

## 支持的环境变量

### 必需的环境变量

| 变量名              | 类型   | 默认值                  | 说明           |
| ------------------- | ------ | ----------------------- | -------------- |
| `VITE_PORT`         | number | 5173                    | 开发服务器端口 |
| `VITE_PUBLIC_PATH`  | string | ''                      | 应用的基础路径 |
| `VITE_API_BASE_URL` | string | 'http://localhost:3010' | API 基础地址   |

### 可选的环境变量

| 变量名                | 类型    | 默认值  | 说明              |
| --------------------- | ------- | ------- | ----------------- |
| `VITE_CDN`            | boolean | false   | 是否启用 CDN 模式 |
| `VITE_ROUTER_HISTORY` | string  | ''      | 路由历史模式      |
| `VITE_HIDE_HOME`      | string  | 'false' | 是否隐藏首页      |
| `VITE_COMPRESSION`    | string  | 'none'  | 构建压缩格式      |

## 使用方法

### 1. 创建环境变量文件

在项目根目录创建对应的环境变量文件：

```bash
# 开发环境
touch .env.development

# 生产环境
touch .env.production
```

### 2. 配置环境变量

在 `.env.production` 文件中添加生产环境配置：

```env
# API 配置
VITE_API_BASE_URL=https://api.example.com

# 构建配置
VITE_PUBLIC_PATH=/app/
VITE_CDN=true
VITE_COMPRESSION=gzip

# 其他配置
VITE_HIDE_HOME=false
```

### 3. 构建命令

```bash
# 构建生产环境（会自动加载 .env.production）
pnpm build

# 构建开发环境（会自动加载 .env.development）
pnpm build:dev

# 测试环境变量加载
pnpm test:env
```

### 4. 在代码中使用

```typescript
// 在 TypeScript/JavaScript 代码中使用
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isProduction = import.meta.env.MODE === 'production';

// 类型安全的环境变量访问
declare const __VITE_ENV__: ViteEnv;
console.log(__VITE_ENV__.VITE_API_BASE_URL);
```

## 注意事项

1. **安全性**：只有以 `VITE_` 开头的环境变量才会被暴露给客户端代码
2. **类型安全**：所有环境变量都在 `types/global.d.ts` 中定义了类型
3. **默认值**：在 `build/utils.ts` 中为所有环境变量设置了合理的默认值
4. **构建时注入**：环境变量会在构建时被注入到代码中，不是运行时读取

## 故障排除

### 环境变量未生效

1. 检查环境变量名是否以 `VITE_` 开头
2. 确认环境变量文件名是否正确
3. 运行 `pnpm test:env` 检查环境变量加载情况
4. 检查构建命令是否指定了正确的模式

### 类型错误

1. 确保在 `types/global.d.ts` 中定义了对应的类型
2. 在 `build/utils.ts` 中添加默认值处理逻辑

## 示例配置

### .env.development

```env
VITE_API_BASE_URL=http://localhost:3010
VITE_PORT=5173
VITE_CDN=false
```

### .env.production

```env
VITE_API_BASE_URL=https://api.production.com
VITE_PUBLIC_PATH=/parenting-assistant/
VITE_CDN=true
VITE_COMPRESSION=gzip
```
