/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    extend: {
      colors: {
        // 主色调
        primary: {
          DEFAULT: '#4A90E2',
          dark: '#3A7BC8',
          light: '#7AADEE',
        },
        // 辅助色
        pink: {
          DEFAULT: '#F8BBD0',
          dark: '#E091B1',
          light: '#FFDCE8',
        },
        // 强调色
        orange: {
          DEFAULT: '#FF9800',
          dark: '#E08600',
          light: '#FFBB52',
        },
        // 功能色
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#FF5252',
        info: '#2196F3',
        // 语义色彩
        feed: '#4A90E2', // 喂养记录
        sleep: '#9C27B0', // 睡眠记录
        diaper: '#8D6E63', // 排便记录
        growth: '#4CAF50', // 成长测量
        photo: '#FF9800', // 照片记录
        // 灰阶与中性色 - 标准Tailwind命名（数字越小越浅，越大越深）
        gray: {
          50: '#FFFFFF', // 卡片背景
          100: '#F5F7FA', // 页面背景
          200: '#EEEEEE', // 浅色背景
          300: '#CCCCCC', // 分割线、边框
          400: '#AAAAAA', // 浅色文本
          500: '#999999', // 辅助文本
          600: '#666666', // 次要文本
          700: '#333333', // 主要文本
          800: '#222222', // 深色文本
          900: '#111111', // 最深文本
        },
        // 文本语义化颜色
        text: {
          primary: '#333333', // 主要文本
          secondary: '#666666', // 次要文本
          tertiary: '#999999', // 辅助文本
          white: '#FFFFFF', // 反色文本
          link: '#4A90E2', // 链接文本
          success: '#4CAF50', // 成功文本
          warning: '#FFC107', // 警告文本
          error: '#FF5252', // 错误文本
        },
        // 背景语义化颜色
        background: {
          DEFAULT: '#F5F7FA', // 页面背景
          card: '#FFFFFF', // 卡片背景
          active: '#F0F0F0', // 激活背景
          disabled: '#F5F5F5', // 禁用背景
        },
        // 渐变色（仅用于自定义class或插件）
        gradient: {
          primary: ['#4A90E2', '#7AADEE'],
          warm: ['#FF9800', '#FFBB52'],
          soft: ['#F8BBD0', '#FFDCE8'],
        },
      },
      fontFamily: {
        sans: ['AlibabaPuHuiTi', 'system-ui', 'sans-serif'],
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
