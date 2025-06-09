/**
 * PWA 相关工具函数
 * 处理状态栏颜色、主题色动态更新等PWA体验优化
 */

// 主题颜色配置
export const THEME_COLORS = {
  // 主要页面颜色
  primary: '#FFB38A', // 主色调
  primaryGradient: '#FFC9A8', // 主色调渐变
  background: '#FDFBF8', // 背景色
  white: '#FFFFFF', // 白色

  // 功能页面颜色
  chat: '#FFB38A', // 聊天页面
  record: '#FFB38A', // 记录页面
  profile: '#FFB38A', // 个人资料页面
  auth: '#FFB38A', // 认证页面

  // 深色模式颜色
  dark: {
    primary: '#5d9fec',
    background: '#121212',
    surface: '#1e1e1e',
  },
} as const;

// 状态栏样式类型
export type StatusBarStyle =
  | 'default'
  | 'light-content'
  | 'dark-content'
  | 'black-translucent';

/**
 * 更新PWA主题颜色
 * @param color 主题颜色（十六进制）
 * @param backgroundColor 背景颜色（可选）
 */
export function updateThemeColor(
  color: string,
  backgroundColor?: string,
): void {
  // 更新theme-color meta标签
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', color);
  }

  // 更新background-color meta标签
  if (backgroundColor) {
    const backgroundColorMeta = document.querySelector(
      'meta[name="background-color"]',
    );
    if (backgroundColorMeta) {
      backgroundColorMeta.setAttribute('content', backgroundColor);
    }
  }

  // 更新Windows瓦片颜色
  const tileColorMeta = document.querySelector(
    'meta[name="msapplication-TileColor"]',
  );
  if (tileColorMeta) {
    tileColorMeta.setAttribute('content', color);
  }
}

/**
 * 更新iOS状态栏样式
 * @param style 状态栏样式
 */
export function updateStatusBarStyle(style: StatusBarStyle): void {
  const statusBarMeta = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );
  if (statusBarMeta) {
    statusBarMeta.setAttribute('content', style);
  }
}

/**
 * 根据页面路径设置对应的主题颜色
 * @param pathname 当前页面路径
 * @param isDark 是否为深色模式
 */
export function setPageThemeColor(
  pathname: string,
  isDark: boolean = false,
): void {
  let themeColor: string = THEME_COLORS.primary;
  let backgroundColor: string = THEME_COLORS.background;
  let statusBarStyle: StatusBarStyle = 'black-translucent';

  if (isDark) {
    themeColor = THEME_COLORS.dark.primary;
    backgroundColor = THEME_COLORS.dark.background;
    statusBarStyle = 'light-content';
  } else {
    // 根据页面路径设置不同的主题色
    if (pathname.startsWith('/chat')) {
      themeColor = THEME_COLORS.chat;
    } else if (pathname.startsWith('/record')) {
      themeColor = THEME_COLORS.record;
    } else if (pathname.startsWith('/profile')) {
      themeColor = THEME_COLORS.profile;
    } else if (pathname.startsWith('/auth')) {
      themeColor = THEME_COLORS.auth;
    }

    statusBarStyle = 'black-translucent';
  }

  // 更新主题颜色
  updateThemeColor(themeColor, backgroundColor);
  updateStatusBarStyle(statusBarStyle);
}

/**
 * 检测是否为PWA模式
 */
export function isPWA(): boolean {
  // 检查是否在standalone模式下运行
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // 检查iOS Safari的standalone模式
  const isIOSStandalone = (window.navigator as any).standalone === true;

  // 检查Android的TWA模式
  const isAndroidTWA = document.referrer.includes('android-app://');

  return isStandalone || isIOSStandalone || isAndroidTWA;
}

/**
 * 获取安全区域信息
 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
  };
}

/**
 * 设置状态栏透明度（仅iOS）
 * @param transparent 是否透明
 */
export function setStatusBarTransparent(transparent: boolean = true): void {
  if (isPWA()) {
    const style = transparent ? 'black-translucent' : 'default';
    updateStatusBarStyle(style);
  }
}

/**
 * 初始化PWA主题设置
 */
export function initPWATheme(): void {
  // 设置CSS变量用于安全区域
  const root = document.documentElement;
  root.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
  root.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');
  root.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)');
  root.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)');

  // 监听主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (e: MediaQueryListEvent) => {
    const currentPath = window.location.pathname;
    setPageThemeColor(currentPath, e.matches);
  };

  mediaQuery.addEventListener('change', handleThemeChange);

  // 初始设置
  const currentPath = window.location.pathname;
  const isDark = mediaQuery.matches;
  setPageThemeColor(currentPath, isDark);
}

/**
 * PWA安装相关工具
 */
export class PWAInstaller {
  private deferredPrompt: any = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // 检查是否已安装
    this.checkInstallStatus();

    // 监听安装事件
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
    });
  }

  private checkInstallStatus(): void {
    this.isInstalled = isPWA();
  }

  public async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA安装失败:', error);
      return false;
    }
  }

  public canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  public getInstallStatus(): boolean {
    return this.isInstalled;
  }
}

// 导出单例实例
export const pwaInstaller = new PWAInstaller();
