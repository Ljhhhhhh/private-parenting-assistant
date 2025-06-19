import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Checkbox } from '@/components/ui';
import { useUserStore, storeOrchestrator } from '@/stores';

import { Icon } from '@iconify/react';
import LogoImage from '@/assets/logo.svg?react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const login = useUserStore((s) => s.login);

  // 切换密码可见性
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
      console.log(err, '登录失败');
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-b from-[#FFF0E6] to-[#FFF0F5] px-4">
      {/* 主内容区域 */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo和标题 */}
        <div className="flex flex-col items-center mb-8">
          <div
            ref={logoRef}
            className="flex overflow-hidden justify-center items-center mb-4 w-20 h-20"
          >
            <LogoImage className="object-cover w-full h-full" />
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  clearable
                  className="w-full h-[48px] pl-12 pr-20 text-base-lg border border-gray-300 rounded-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-normal bg-white/70 focus:bg-white/90"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-6 top-1/2 z-10 -translate-y-1/2 p-1 text-gray-500 hover:text-primary transition-colors duration-200 focus:outline-none focus:text-primary"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  <Icon
                    icon={
                      showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'
                    }
                    width="24"
                    height="24"
                  />
                </button>
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
        {/* <div className="grid grid-cols-3 gap-4 mt-8">
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
        </div> */}
      </div>
    </div>
  );
};

export default Login;
