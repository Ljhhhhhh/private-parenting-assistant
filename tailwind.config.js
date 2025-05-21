/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    extend: {
      colors: {
        // 主色调
        primary: {
          DEFAULT: '#FFB38A',
          dark: '#FF9F73',
          light: '#FFC9A8',
        },
        // 辅助色
        pink: {
          DEFAULT: '#F8BBD0',
          dark: '#F6A8C3',
          light: '#FAD1E0',
        },
        // 强调色
        orange: {
          DEFAULT: '#FFDA63',
          dark: '#FFD040',
          light: '#FFE58C',
        },
        // 功能色
        success: '#66BB6A',
        warning: '#FFA726',
        error: '#EF5350',
        info: '#56C0E0',
        // 语义色彩
        feed: '#FFC9A8', // 喂养记录
        sleep: '#C5CAE9', // 睡眠记录
        diaper: '#BCAAA4', // 排便记录
        growth: '#81C784', // 成长测量
        photo: '#FFE58C', // 照片记录
        // 灰阶与中性色 - 标准Tailwind命名（数字越小越浅，越大越深）
        gray: {
          50: '#FFFFFF', // 纯白（卡片背景）
          100: '#FDFBF8', // 背景灰（页面背景 - 极浅暖白）
          200: '#F5F5F5', // 浅色背景
          300: '#E0E0E0', // 超浅灰（分割线、边框）
          400: '#CCCCCC', // 浅色文本
          500: '#999999', // 浅灰（辅助文本）
          600: '#666666', // 中灰（次要文本）
          700: '#333333', // 深灰（主要文本）
          800: '#222222', // 深色文本
          900: '#111111', // 最深文本
        },
        // 文本语义化颜色
        text: {
          primary: '#333333', // 主要文本
          secondary: '#666666', // 次要文本
          tertiary: '#999999', // 辅助文本
          white: '#FFFFFF', // 反色文本
          link: '#FF9F73', // 链接文本
          success: '#4CAF50', // 成功文本
          warning: '#FFC107', // 警告文本
          error: '#FF5252', // 错误文本
        },
        // 背景语义化颜色
        background: {
          DEFAULT: '#FDFBF8', // 页面背景（极浅暖白）
          card: '#FFFFFF', // 卡片背景
          active: '#F0F0F0', // 激活背景
          disabled: '#F5F5F5', // 禁用背景
        },
        // 渐变色（仅用于自定义class或插件）
        gradient: {
          primary: ['#FFB38A', '#FFC9A8'],
          warm: ['#FFDA63', '#FFE58C'],
          soft: ['#F8BBD0', '#FAD1E0'],
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      fontSize: {
        h1: ['24px', '32px'], // 大标题
        h2: ['20px', '28px'], // 标题
        h3: ['18px', '24px'], // 副标题
        'base-lg': ['16px', '24px'], // 正文大
        base: ['14px', '20px'], // 正文
        sm: ['12px', '16px'], // 辅助文字
        xs: ['10px', '14px'], // 微小文字
      },
      fontWeight: {
        thin: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      spacing: {
        0.5: '4px', // 超小间距
        2: '8px', // 小间距
        4: '16px', // 中间距
        6: '24px', // 大间距
        8: '32px', // 超大间距
        10: '40px', // 页面间距
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      borderRadius: {
        btn: '12px',
        card: '16px',
        input: '8px',
        tag: '12px',
        list: '20px',
        dialog: '20px',
        fab: '50%',
      },
      boxShadow: {
        card: '0px 2px 8px rgba(0,0,0,0.08)',
        btn: '0px 4px 8px rgba(0,0,0,0.2)',
        dialog: '0px 4px 16px rgba(0,0,0,0.12)',
      },
      maxWidth: {
        content: '600px',
        card: '360px',
      },
      zIndex: {
        dialog: '1000',
        toast: '1100',
        fab: '1200',
      },
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'fade-out': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s cubic-bezier(0.4,0,0.2,1)',
        'fade-out': 'fade-out 0.3s cubic-bezier(0.4,0,0.2,1)',
        pop: 'pop 0.15s cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  safelist: [
    // 背景色
    'bg-primary',
    'bg-primary-dark',
    'bg-primary-light',
    'bg-pink',
    'bg-pink-dark',
    'bg-pink-light',
    'bg-orange',
    'bg-orange-dark',
    'bg-orange-light',
    'bg-success',
    'bg-warning',
    'bg-error',
    'bg-info',
    'bg-gray-50',
    'bg-gray-100',
    'bg-gray-200',
    'bg-gray-300',
    'bg-gray-400',
    'bg-gray-500',
    'bg-gray-600',
    'bg-gray-700',
    'bg-gray-800',
    'bg-gray-900',
    'bg-background',
    'bg-background-card',
    'bg-background-active',
    'bg-background-disabled',
    // 文本颜色
    'text-primary',
    'text-text-primary',
    'text-text-secondary',
    'text-text-tertiary',
    'text-text-white',
    'text-text-link',
    'text-text-success',
    'text-text-warning',
    'text-text-error',
    'text-gray-50',
    'text-gray-100',
    'text-gray-200',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'text-gray-600',
    'text-gray-700',
    'text-gray-800',
    'text-gray-900',
    'text-success',
    'text-warning',
    'text-error',
    'text-info',
    // 深色模式
    'dark:bg-gray-900',
    'dark:bg-gray-800',
    'dark:text-gray-100',
    'dark:text-white',
  ],
};
