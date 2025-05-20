import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Checkbox } from '@/components/ui';
import { useUserStore } from '@/stores/user';
import { Icon } from '@iconify/react';

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
      await login(email, password);
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-b from-[#E8F0FE] to-[#FFF0F5] px-4">
      {/* 波浪背景 */}
      <div
        id="wave-container"
        className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none z-0 h-40"
      />

      {/* 主内容区域 */}
      <div className="w-full max-w-md z-10 relative">
        {/* Logo和标题 */}
        <div className="flex flex-col items-center mb-8">
          <div
            ref={logoRef}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] flex items-center justify-center mb-4 shadow-lg"
          >
            <Icon 
              icon="mdi:baby-face-outline" 
              width="40" 
              height="40" 
              color="white" 
            />
          </div>
          <h1 className="text-2xl font-bold text-[#333333] mb-1">AI育儿助手</h1>
          <p className="text-[#666666] text-center max-w-xs">
            您的贴心育儿伙伴，随时随地获取专业指导
          </p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 shadow-xl border border-white/50">
          <h2 className="text-xl font-semibold text-[#333333] mb-6">欢迎回来</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#666666] mb-1"
              >
                邮箱
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A90E2] z-10">
                  <Icon icon="mdi:email-outline" width="20" height="20" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  clearable
                  className="w-full h-[52px] pl-12 pr-4 text-base border border-[#E8F0FE] rounded-[12px] focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all duration-200 bg-white/70 focus:bg-white/90"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#666666] mb-1"
              >
                密码
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A90E2] z-10">
                  <Icon icon="mdi:lock-outline" width="20" height="20" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  clearable
                  className="w-full h-[52px] pl-12 pr-4 text-base border border-[#E8F0FE] rounded-[12px] focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all duration-200 bg-white/70 focus:bg-white/90"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="text-[#4A90E2] focus:ring-[#4A90E2]"
                />
                <span className="ml-2 text-sm text-[#666666]">记住我</span>
              </div>
              <Link
                to="/reset-password"
                className="text-sm font-medium text-[#4A90E2] hover:text-[#3A7BC8] transition-colors"
              >
                忘记密码？
              </Link>
            </div>

            {error && (
              <div className="p-3 text-sm text-[#FF5252] bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <Button
              block
              type="submit"
              loading={loading}
              className="relative w-full h-[56px] px-4 py-2 text-white bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] rounded-[16px] shadow-lg shadow-[#4A90E2]/20 hover:shadow-xl hover:shadow-[#4A90E2]/30 transition-all duration-300 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center text-base font-medium">
                登录
                <Icon 
                  icon="mdi:arrow-right" 
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                  width="18" 
                  height="18" 
                />
              </span>
              <div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#3A7BC8] to-[#7AADEE] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ filter: 'blur(10px)', transform: 'scale(1.2)' }}
              ></div>
            </Button>
          </form>

          <div className="text-center mt-6">
            <span className="text-[#666666] text-sm">还没有账号？</span>
            <Link
              to="/register"
              className="ml-1 text-sm font-medium text-[#4A90E2] hover:text-[#3A7BC8] transition-colors"
            >
              立即注册
            </Link>
          </div>
        </div>

        {/* 底部特性介绍 */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 text-center shadow-md">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#4A90E2]">
              <Icon icon="mdi:lightbulb-outline" width="16" height="16" />
            </div>
            <p className="text-xs text-[#333333]">个性化建议</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 text-center shadow-md">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#4A90E2]">
              <Icon icon="mdi:chart-line" width="16" height="16" />
            </div>
            <p className="text-xs text-[#333333]">成长追踪</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 text-center shadow-md">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#4A90E2]">
              <Icon icon="mdi:book-open-variant" width="16" height="16" />
            </div>
            <p className="text-xs text-[#333333]">知识库</p>
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
