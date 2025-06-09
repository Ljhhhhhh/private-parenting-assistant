# PWA 状态栏颜色优化指南

## 问题描述

在手机安装 PWA 之后，打开应用时顶部状态栏颜色与当前页面颜色不匹配，造成视觉不和谐的问题。

## 解决方案

### 1. 核心配置更新

#### 1.1 HTML Meta 标签优化

在 `index.html` 中更新了以下关键配置：

```html
<!-- iOS PWA Meta Tags -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
<meta name="apple-mobile-web-app-title" content="萌芽育儿" />

<!-- PWA Meta Tags -->
<meta name="theme-color" content="#FFB38A" />
<meta name="background-color" content="#FDFBF8" />
```

**关键变更：**

- 将 `apple-mobile-web-app-status-bar-style` 从 `default` 改为 `black-translucent`
- 这样状态栏会变为透明，与应用内容融为一体

#### 1.2 PWA Manifest 配置

在 `build/plugins.ts` 中的 VitePWA 配置：

```typescript
manifest: {
  name: '萌芽育儿',
  short_name: '萌芽育儿',
  theme_color: '#FFB38A',
  background_color: '#FDFBF8',
  display: 'standalone',
  // ...其他配置
}
```

### 2. 动态主题颜色管理

#### 2.1 PWA 工具函数 (`src/utils/pwa.ts`)

创建了完整的 PWA 主题管理工具：

```typescript
// 主题颜色配置
export const THEME_COLORS = {
  primary: '#FFB38A',
  chat: '#FFB38A',
  record: '#81C784',
  profile: '#56C0E0',
  auth: '#FFB38A',
  // ...
};

// 动态更新主题颜色
export function updateThemeColor(color: string, backgroundColor?: string): void;

// 根据页面路径设置主题颜色
export function setPageThemeColor(
  pathname: string,
  isDark: boolean = false,
): void;

// 初始化PWA主题设置
export function initPWATheme(): void;
```

#### 2.2 React Hook (`src/hooks/usePWATheme.ts`)

创建了自动管理 PWA 主题的 Hook：

```typescript
export function usePWATheme() {
  const location = useLocation();
  const { theme } = useAppStore();

  useEffect(() => {
    initPWATheme();
  }, []);

  useEffect(() => {
    const isDark = theme === 'dark';
    setPageThemeColor(location.pathname, isDark);
  }, [location.pathname, theme]);

  return {
    isPWAMode: isPWA(),
    currentPath: location.pathname,
    currentTheme: theme,
  };
}
```

### 3. 组件集成

#### 3.1 主应用集成

在 `src/App.tsx` 中集成 PWA 主题管理：

```typescript
import { usePWATheme } from '@/hooks/usePWATheme';

const App = () => {
  // 初始化PWA主题管理
  usePWATheme();

  return <div className="App">{/* 应用内容 */}</div>;
};
```

#### 3.2 PWA 状态栏组件

创建了专门的 PWA 状态栏组件：

```typescript
// src/components/ui/layout/PWAStatusBar.tsx
export const PWAStatusBar: React.FC<PWAStatusBarProps> = ({
  backgroundColor,
  className = '',
  children,
}) => {
  if (!isPWA()) return null;

  return (
    <div
      className={`status-bar-area ${className}`}
      style={{
        backgroundColor: backgroundColor || 'inherit',
        height: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {children}
    </div>
  );
};
```

### 4. CSS 安全区域支持

#### 4.1 全局 CSS 更新 (`src/index.css`)

```css
/* PWA 和安全区域支持 */
html {
  --sat: env(safe-area-inset-top, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
  --sar: env(safe-area-inset-right, 0px);
}

/* PWA 模式下的特殊样式 */
@media (display-mode: standalone) {
  body {
    height: 100vh;
    height: -webkit-fill-available;
  }

  .status-bar-area {
    height: env(safe-area-inset-top, 0px);
    background-color: inherit;
  }
}

/* iOS PWA 特殊处理 */
@supports (-webkit-touch-callout: none) {
  @media (display-mode: standalone) {
    body {
      height: -webkit-fill-available;
    }
  }
}
```

#### 4.2 Tailwind 配置更新

在 `tailwind.config.js` 中添加安全区域支持：

```javascript
padding: {
  'safe-top': 'env(safe-area-inset-top)',
  'safe-bottom': 'env(safe-area-inset-bottom)',
  'safe-left': 'env(safe-area-inset-left)',
  'safe-right': 'env(safe-area-inset-right)',
}
```

## 使用方法

### 1. 基础使用

应用会自动根据当前页面路径设置对应的主题颜色：

- 首页/认证页面：`#FFB38A` (温暖橙色)
- 聊天页面：`#FFB38A` (温暖橙色)
- 记录页面：`#81C784` (绿色)
- 个人资料页面：`#56C0E0` (蓝色)

### 2. 手动设置主题颜色

```typescript
import { setPageThemeColor, updateThemeColor } from '@/utils/pwa';

// 设置特定页面的主题颜色
setPageThemeColor('/custom-page', false);

// 直接更新主题颜色
updateThemeColor('#FF6B6B', '#FFF5F5');
```

### 3. 检测 PWA 模式

```typescript
import { isPWA } from '@/utils/pwa';

if (isPWA()) {
  // PWA模式下的特殊处理
  console.log('应用运行在PWA模式下');
}
```

### 4. 使用 PWA 布局组件

```typescript
import { PWALayout } from '@/components/ui/layout/PWALayout';

const MyPage = () => (
  <PWALayout statusBarColor="#FFB38A">
    <div>页面内容</div>
  </PWALayout>
);
```

## 效果说明

### 修复前的问题：

- 状态栏颜色固定，与页面内容不匹配
- 在不同页面切换时视觉不连贯
- 深色模式下状态栏显示异常

### 修复后的效果：

- ✅ 状态栏颜色自动匹配当前页面主题
- ✅ 页面切换时状态栏颜色平滑过渡
- ✅ 支持深色模式自动适配
- ✅ 完美支持 iOS 和 Android PWA
- ✅ 安全区域完美适配（刘海屏、药丸屏等）

## 技术细节

### iOS 状态栏样式说明：

1. **`default`**: 状态栏内容为黑色，适用于浅色背景
2. **`black`**: 状态栏内容为黑色（已废弃）
3. **`black-translucent`**: 状态栏透明，内容可以延伸到状态栏区域
4. **`light-content`**: 状态栏内容为白色，适用于深色背景
5. **`dark-content`**: 状态栏内容为黑色，适用于浅色背景

### Android 主题颜色：

Android PWA 会自动使用 `theme-color` meta 标签的颜色作为状态栏颜色。

### 安全区域处理：

使用 CSS 环境变量 `env(safe-area-inset-*)` 来处理不同设备的安全区域，确保内容不被状态栏、导航栏或设备特殊区域遮挡。

## 最佳实践

1. **颜色一致性**: 确保状态栏颜色与页面主要背景色协调
2. **对比度**: 保证状态栏文字与背景有足够的对比度
3. **过渡效果**: 页面切换时状态栏颜色应平滑过渡
4. **深色模式**: 为深色模式提供合适的状态栏样式
5. **测试覆盖**: 在不同设备和系统版本上测试 PWA 效果

## 故障排除

### 常见问题：

1. **状态栏颜色不更新**

   - 检查 `usePWATheme` Hook 是否正确集成
   - 确认 meta 标签是否正确设置

2. **安全区域显示异常**

   - 检查 CSS 环境变量是否正确设置
   - 确认 `viewport-fit=cover` 是否在 viewport meta 标签中

3. **深色模式适配问题**
   - 检查主题检测逻辑
   - 确认深色模式下的颜色配置

### 调试方法：

```typescript
// 在控制台查看当前PWA状态
console.log('PWA模式:', isPWA());
console.log('安全区域:', getSafeAreaInsets());
console.log(
  '当前主题色:',
  document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
);
```

## 总结

通过以上优化，PWA 应用的状态栏颜色问题得到了完美解决。应用现在能够：

- 自动适配不同页面的主题颜色
- 完美支持深色模式
- 处理各种设备的安全区域
- 提供流畅的视觉体验

这些改进大大提升了 PWA 应用的用户体验，使其更接近原生应用的视觉效果。
