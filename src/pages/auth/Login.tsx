import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Checkbox } from '@/components/ui';
import { useUserStore, storeOrchestrator } from '@/stores';

import { Icon } from '@iconify/react';
import logoImage from '@/assets/logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const login = useUserStore((s) => s.login);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('请输入邮箱');
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email))
      return setError('邮箱格式不正确');
    if (!password) return setError('请输入密码');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        await storeOrchestrator.handleLoginSuccess();
      }
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建动态波浪背景效果
  useEffect(() => {
    const createWaveEffect = () => {
      const container = document.getElementById('wave-container');
      if (!container) return;

      // 清除现有元素
      container.innerHTML = '';

      // 创建波浪元素
      for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = 'wave';
        wave.style.animationDelay = `${i * 0.5}s`;
        container.appendChild(wave);
      }
    };

    createWaveEffect();

    // Logo动画效果
    if (logoRef.current) {
      logoRef.current.classList.add('animate-float');
    }

    return () => {
      const container = document.getElementById('wave-container');
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-b from-[#FFF0E6] to-[#FFF0F5] px-4">
      {/* 波浪背景 */}
      <div
        id="wave-container"
        className="overflow-hidden absolute bottom-0 left-0 z-0 w-full h-40 pointer-events-none"
      />

      {/* 主内容区域 */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo和标题 */}
        <div className="flex flex-col items-center mb-8">
          <div
            ref={logoRef}
            className="flex overflow-hidden justify-center items-center mb-4 w-24 h-24"
          >
            <img
              src={logoImage}
              alt="萌芽育儿 Logo"
              className="object-cover w-full h-full"
            />
          </div>

          <h1 className="mb-1 font-semibold text-h1 text-primary-dark">
            萌芽育儿
          </h1>
          <p className="max-w-xs text-base text-center text-gray-600">
            萌芽育儿秒回应，带娃从此不抓瞎
          </p>
        </div>

        {/* 登录表单 */}
        <div className="p-6 bg-white border backdrop-blur-md rounded-dialog shadow-card border-gray-300/20">
          <h2 className="mb-6 font-semibold text-gray-700 text-h2">欢迎回来</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-600"
              >
                邮箱
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary">
                  <Icon icon="mdi:email-outline" width="20" height="20" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  clearable
                  className="w-full h-[48px] pl-12 pr-4 text-base-lg border border-gray-300 rounded-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-normal bg-white/70 focus:bg-white/90"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-600"
              >
                密码
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary">
                  <Icon icon="mdi:lock-outline" width="20" height="20" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  clearable
                  className="w-full h-[48px] pl-12 pr-4 text-base-lg border border-gray-300 rounded-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-normal bg-white/70 focus:bg-white/90"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">记住我</span>
              </div>
              <Link
                to="/reset-password"
                className="text-sm font-medium transition-colors text-text-link hover:text-primary-dark"
              >
                忘记密码？
              </Link>
            </div>

            {error && (
              <div className="p-3 text-sm bg-red-50 text-error rounded-input">
                {error}
              </div>
            )}

            <Button
              block
              type="submit"
              loading={loading}
              className="relative w-full h-[48px] px-4 py-2 text-white bg-gradient-to-r from-primary to-primary-light rounded-btn shadow-btn hover:shadow-xl hover:shadow-primary/30 transition-all duration-normal overflow-hidden group"
            >
              <span className="flex relative z-10 justify-center items-center font-medium text-base-lg">
                登录
                <Icon
                  icon="mdi:arrow-right"
                  className="ml-2 transition-transform duration-normal group-hover:translate-x-1"
                  width="18"
                  height="18"
                />
              </span>
              <div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r opacity-0 transition-opacity from-primary-dark to-primary group-hover:opacity-100 duration-normal"
                style={{ filter: 'blur(10px)', transform: 'scale(1.2)' }}
              ></div>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">还没有账号？</span>
            <Link
              to="/register"
              className="ml-1 text-sm font-medium transition-colors text-text-link hover:text-primary-dark"
            >
              立即注册
            </Link>
          </div>
        </div>

        {/* 底部特性介绍 */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="p-3 text-center backdrop-blur-sm bg-white/80 rounded-card shadow-card">
            <div className="flex justify-center items-center mx-auto mb-2 w-8 h-8 rounded-full bg-primary-light/20 text-primary">
              <Icon icon="mdi:lightbulb-outline" width="16" height="16" />
            </div>
            <p className="text-sm text-gray-700">个性化</p>
          </div>
          <div className="p-3 text-center backdrop-blur-sm bg-white/80 rounded-card shadow-card">
            <div className="flex justify-center items-center mx-auto mb-2 w-8 h-8 rounded-full bg-growth/20 text-growth">
              <Icon icon="mdi:chart-line" width="16" height="16" />
            </div>
            <p className="text-sm text-gray-700">秒回应</p>
          </div>
          <div className="p-3 text-center backdrop-blur-sm bg-white/80 rounded-card shadow-card">
            <div className="flex justify-center items-center mx-auto mb-2 w-8 h-8 rounded-full bg-orange-light/20 text-orange">
              <Icon icon="mdi:book-open-variant" width="16" height="16" />
            </div>
            <p className="text-sm text-gray-700">随时记</p>
          </div>
        </div>
      </div>

      {/* 全局样式 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          @keyframes wave {
            0% { transform: translateX(0) translateZ(0) scaleY(1); }
            50% { transform: translateX(-25%) translateZ(0) scaleY(0.8); }
            100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
          }
          
          .wave {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-31.8z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E");
            background-size: 50% 100%;
            background-repeat: repeat-x;
            animation: wave 15s linear infinite;
            transform-origin: bottom center;
          }
          
          .focused .wave {
            animation-play-state: paused;
          }
          
          #wave-container .wave:nth-child(2) {
            animation-duration: 18s;
            opacity: 0.25;
          }
          
          #wave-container .wave:nth-child(3) {
            animation-duration: 20s;
            opacity: 0.2;
          }
          `,
        }}
      />
    </div>
  );
};

export default Login;
