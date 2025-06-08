#!/usr/bin/env node

/**
 * 测试环境变量加载脚本
 * 用于验证不同模式下环境变量是否正确加载
 */

import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

// 测试不同模式的环境变量加载
const modes = ['development', 'production'];

console.log('🧪 开始测试环境变量加载...\n');

modes.forEach((mode) => {
  console.log(`📋 测试模式: ${mode}`);
  console.log('─'.repeat(50));

  try {
    const env = loadEnv(mode, root, '');
    const viteEnvKeys = Object.keys(env).filter((key) =>
      key.startsWith('VITE_'),
    );

    if (viteEnvKeys.length === 0) {
      console.log(`⚠️  未找到 VITE_ 开头的环境变量`);
    } else {
      console.log(`✅ 找到 ${viteEnvKeys.length} 个环境变量:`);
      viteEnvKeys.forEach((key) => {
        console.log(`   ${key}: ${env[key]}`);
      });
    }
  } catch (error) {
    console.error(`❌ 加载环境变量失败:`, error.message);
  }

  console.log('');
});

console.log('🎉 环境变量测试完成!');
