import { getPluginsList } from './build/plugins';
import { include, exclude } from './build/optimize';
import { type UserConfigExport, type ConfigEnv, loadEnv } from 'vite';
import {
  root,
  alias,
  wrapperEnv,
  pathResolve,
  __APP_INFO__,
} from './build/utils';

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  // 加载环境变量，确保能正确加载对应模式的环境变量文件
  // 例如：development 模式加载 .env.development，production 模式加载 .env.production
  const env = loadEnv(mode, root, '');
  const viteEnv = wrapperEnv(env);

  const { VITE_CDN, VITE_PORT, VITE_PUBLIC_PATH } = viteEnv;

  // 在构建时输出当前模式和加载的环境变量信息
  console.log(`🚀 当前模式: ${mode}`);
  console.log(`📦 构建命令: ${command}`);
  console.log(`🌍 环境变量加载完成:`, {
    VITE_CDN,
    VITE_PORT,
    VITE_PUBLIC_PATH,
    // 只显示部分环境变量，避免敏感信息泄露
  });

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias,
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: '0.0.0.0',
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {},
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
    },
    plugins: getPluginsList(VITE_CDN),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude,
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: 'es2015',
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      // 将环境变量注入到客户端代码中
      __VITE_ENV__: JSON.stringify(viteEnv),
    },
  };
};
