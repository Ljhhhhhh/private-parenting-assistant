import { cdn } from './cdn';
import { viteBuildInfo } from './info';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';
import removeNoMatch from 'vite-plugin-router-warn';
import { visualizer } from 'rollup-plugin-visualizer';
import removeConsole from 'vite-plugin-remove-console';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { VitePWA } from 'vite-plugin-pwa';

export function getPluginsList(VITE_CDN: boolean): PluginOption[] {
  const lifecycle = process.env.npm_lifecycle_event;
  return [
    react(),
    /**
     * 在页面上按住组合键时，鼠标在页面移动即会在 DOM 上出现遮罩层并显示相关信息，点击一下将自动打开 IDE 并将光标定位到元素对应的代码位置
     * Mac 默认组合键 Option + Shift
     * Windows 默认组合键 Alt + Shift
     * 更多用法看 https://inspector.fe-dev.cn/guide/start.html
     */
    codeInspectorPlugin({
      bundler: 'vite',
      hideConsole: true,
    }),
    viteBuildInfo(),
    /**
     * PWA 支持
     * 优雅美观的 PWA 功能，符合育儿助手的温暖设计理念
     */
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'logo.svg',
        'boy-avatar.svg',
        'girl-avatar.svg',
      ],
      manifest: {
        name: '温暖育儿助手',
        short_name: '育儿助手',
        description: '专业贴心的育儿记录与问答助手，陪伴您的育儿之旅',
        theme_color: '#FFB38A',
        background_color: '#FDFBF8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'zh-CN',
        categories: ['lifestyle', 'health', 'education'],
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://fonts.googleapis.com' ||
              url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
    /**
     * 开发环境下移除非必要的vue-router动态路由警告No match found for location with path
     * 非必要具体看 https://github.com/vuejs/router/issues/521 和 https://github.com/vuejs/router/issues/359
     * vite-plugin-router-warn只在开发环境下启用，只处理vue-router文件并且只在服务启动或重启时运行一次，性能消耗可忽略不计
     */
    removeNoMatch(),
    // svg组件化支持
    svgr(),
    VITE_CDN ? cdn : null,
    // 线上环境删除console
    removeConsole({ external: ['src/assets/iconfont/iconfont.js'] }),
    // 打包分析
    lifecycle === 'report'
      ? visualizer({ open: true, brotliSize: true, filename: 'report.html' })
      : (null as any),
  ];
}
