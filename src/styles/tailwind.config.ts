/**
 * 育儿助手 Tailwind 配置建议
 *
 * 这个文件包含推荐的 Tailwind 配置，请将这些配置合并到项目根目录的 tailwind.config.js 中
 */

import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const tailwindConfig: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A90E2',
          dark: '#3A7BC8',
          light: '#7AADEE',
        },
        secondary: {
          DEFAULT: '#F8BBD0',
          dark: '#E091B1',
          light: '#FFDCE8',
        },
        accent: {
          DEFAULT: '#FF9800',
          dark: '#E08600',
          light: '#FFBB52',
        },
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#FF5252',
        info: '#2196F3',
        gray: {
          900: '#333333', // 主要文本
          800: '#666666', // 次要文本
          700: '#999999', // 辅助文本
          300: '#CCCCCC', // 分割线、边框
          200: '#E8E8E8',
          100: '#F5F7FA', // 背景灰
          50: '#FAFAFA',
        },
      },
      borderRadius: {
        input: '8px',
        btn: '12px',
        card: '16px',
        tag: '12px',
        dialog: '20px',
      },
      boxShadow: {
        card: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        dialog: '0px 4px 16px rgba(0, 0, 0, 0.12)',
        float: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      },
      fontSize: {
        h1: ['24px', '32px'],
        h2: ['20px', '28px'],
        h3: ['18px', '24px'],
        base: ['16px', '24px'],
        sm: ['14px', '20px'],
        xs: ['12px', '16px'],
        tiny: ['10px', '14px'],
      },
      spacing: {
        xs: '4px', // 超小间距：4px
        sm: '8px', // 小间距：8px
        md: '16px', // 中间距：16px
        lg: '24px', // 大间距：24px
        xl: '32px', // 超大间距：32px
        '2xl': '40px', // 页面间距：40px
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translate(-50%, -60%)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -33%)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // 安全区域相关
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  // 变体扩展
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active', 'checked'],
      borderColor: ['checked', 'focus'],
      textColor: ['disabled'],
    },
  },
  // 预设CSS变量，便于组件中直接使用
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ':root': {
          '--color-primary': '#4A90E2',
          '--color-primary-dark': '#3A7BC8',
          '--color-primary-light': '#7AADEE',
          '--color-secondary': '#F8BBD0',
          '--color-accent': '#FF9800',
          '--color-success': '#4CAF50',
          '--color-warning': '#FFC107',
          '--color-error': '#FF5252',
          '--color-info': '#2196F3',
        },
      });
    }),
  ],
};

export default tailwindConfig;
