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
     * PWA 支持 - 优化版
     * 针对育儿助手的特殊需求进行深度优化
     * 考虑离线使用、弱网环境、移动端性能等因素
     */
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // 静态资源缓存模式
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,eot}',
          'icons/*.{png,svg}',
          'assets/**/*.{png,jpg,jpeg,svg,webp}',
        ],
        globIgnores: ['**/node_modules/**/*', '**/dev-dist/**/*'],
        // 最大缓存大小 - 50MB (育儿应用需要缓存更多媒体文件)
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,

        // 运行时缓存策略
        runtimeCaching: [
          // API 缓存 - 网络优先策略，支持离线访问
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200, 201, 204],
              },
              networkTimeoutSeconds: 5, // 增加到5秒，适应移动网络
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 24小时
                purgeOnQuotaError: true,
              },
              plugins: [
                {
                  // 自定义缓存键策略
                  cacheKeyWillBeUsed: async ({ request }) => {
                    // 移除查询参数中的时间戳，提高缓存命中率
                    const url = new URL(request.url);
                    url.searchParams.delete('_t');
                    url.searchParams.delete('timestamp');
                    return url.toString();
                  },
                },
              ],
            },
          },

          // 聊天记录缓存 - 优先使用缓存，减少等待时间
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/api/chat') ||
              url.pathname.includes('/api/conversation'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'chat-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
                purgeOnQuotaError: true,
              },
            },
          },

          // 记录数据缓存 - 重要的育儿记录数据
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/api/records') ||
              url.pathname.includes('/api/children'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'records-cache',
              cacheableResponse: {
                statuses: [0, 200, 201, 204],
              },
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
                purgeOnQuotaError: true,
              },
            },
          },

          // 图片资源缓存 - 宝宝照片等重要图片
          {
            urlPattern: ({ url, request }) =>
              request.destination === 'image' ||
              url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i),
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60天
                purgeOnQuotaError: true,
              },
            },
          },

          // 字体资源缓存
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://fonts.googleapis.com' ||
              url.origin === 'https://fonts.gstatic.com' ||
              url.pathname.match(/\.(woff|woff2|ttf|eot)$/i),
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
                purgeOnQuotaError: true,
              },
            },
          },

          // CDN 静态资源缓存
          {
            urlPattern: ({ url }) =>
              url.origin.includes('cdn') || url.origin.includes('static'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
                purgeOnQuotaError: true,
              },
            },
          },

          // 文档资源缓存（离线知识库）
          {
            urlPattern: ({ url }) =>
              url.pathname.includes('/docs/') ||
              url.pathname.includes('/knowledge/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'docs-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
                purgeOnQuotaError: true,
              },
            },
          },
        ],

        // 清理过期缓存
        cleanupOutdatedCaches: true,

        // 跳过等待，立即激活新的 Service Worker
        skipWaiting: true,

        // 立即接管所有客户端
        clientsClaim: true,

        // 离线页面配置（通过导航回退处理）
        // offlineFallback: '/offline.html', // 此选项可能不被支持，使用 navigateFallback 替代

        // 导航路由配置 - 支持 SPA 路由
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/, /^\/api\//],
      },

      // Manifest 配置 - 优化后的应用清单
      includeAssets: [
        'favicon.ico',
        'logo.svg',
        'logo2.svg',
        'boy-avatar.svg',
        'girl-avatar.svg',
        'icons/*.png',
        'assets/**/*.{png,jpg,svg}',
      ],
      manifest: {
        name: '萌芽育儿',
        short_name: '萌芽育儿',
        description: '专业贴心的育儿记录与问答助手，陪伴您的育儿之旅',
        theme_color: '#4A90E2', // 使用设计规范中的主色调
        background_color: '#F5F7FA', // 使用设计规范中的背景色
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'zh-CN',
        dir: 'ltr',
        categories: ['lifestyle', 'health', 'education', 'family'],

        // 启动屏幕配置（使用标准 manifest 属性）
        // splash_pages: null, // 非标准属性，移除

        // 图标配置 - 完整的图标集
        icons: [
          {
            src: '/icons/icon-36x36.png',
            sizes: '36x36',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],

        // 快捷方式配置
        shortcuts: [
          {
            name: '快速记录',
            short_name: '记录',
            description: '快速记录宝宝的日常活动',
            url: '/record',
            icons: [
              {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
              },
            ],
          },
          {
            name: '智能问答',
            short_name: '问答',
            description: '获取专业的育儿建议',
            url: '/chat',
            icons: [
              {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
              },
            ],
          },
        ],

        // 相关应用
        related_applications: [],
        prefer_related_applications: false,
      },

      // 开发选项
      devOptions: {
        enabled: true,
        type: 'module',
        /* 当开启此选项时，sw.js 文件将通过 http 而不是 filesystem 提供服务 */
        navigateFallback: 'index.html',
      },

      // 注册配置
      injectRegister: 'auto',
      strategies: 'generateSW',
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
