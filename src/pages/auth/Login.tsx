import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Checkbox } from '@/components/ui';
import { useUserStore } from '@/stores/user';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useUserStore((s) => s.login);

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

      // 登录成功后直接跳转到首页
      // 现在login函数会自动处理儿童选择逻辑
      navigate('/home');
    } catch (err: any) {
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#E8F0FE] to-[#FFF0F5] relative overflow-hidden">
      {/* 气泡动画容器 - 与注册页保持一致 */}
      <div
        id="bubble-container"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      />

      <div className="relative z-10 mx-4 mt-12 w-full max-w-[360px]">
        <div className="relative overflow-hidden rounded-[24px] backdrop-blur-md bg-white/80 shadow-lg border border-white/50 p-8">
          <h1 className="text-[24px] leading-[32px] font-semibold text-[#333] mb-8 text-center">
            欢迎回到 AI育儿助手
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="text-[#555] text-base mb-2 font-medium">邮箱</div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A90E2] z-10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  clearable
                  className="rounded-[12px] h-[52px] pl-12 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[#555] text-base mb-2 font-medium">密码</div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A90E2] z-10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  clearable
                  className="rounded-[12px] h-[52px] pl-12 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="text-[#555] text-sm ml-2">记住我</span>
              </div>
              <Link
                to="/reset-password"
                className="text-[#4A90E2] text-sm font-medium"
              >
                忘记密码？
              </Link>
            </div>

            {error && (
              <div className="mb-4 text-sm text-center text-[#FF5252]">
                {error}
              </div>
            )}

            <Button
              block
              type="submit"
              loading={loading}
              className="h-[56px] rounded-[16px] text-white text-base font-medium bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] border-none shadow-lg shadow-[#4A90E2]/20 hover:shadow-xl hover:shadow-[#4A90E2]/30 transition-all duration-300 flex items-center justify-center"
            >
              登录
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="ml-1"
              >
                <path
                  d="M13 5l7 7-7 7M5 12h15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>

            <div className="flex justify-center mt-8 text-[14px]">
              <span className="text-[#555]">还没有账号？</span>
              <Link to="/register" className="text-[#4A90E2] font-medium ml-1">
                去注册
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* CSS动画样式 - 与注册页保持一致 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes bubble-rise {
            0% {
              transform: translateY(100vh) scale(0);
              opacity: 0;
            }
            20% {
              opacity: 0.6;
            }
            80% {
              opacity: 0.6;
            }
            100% {
              transform: translateY(-100px) scale(1);
              opacity: 0;
            }
          }
          
          .bubble {
            position: absolute;
            bottom: -100px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(74, 144, 226, 0.3));
            border-radius: 50%;
            animation: bubble-rise linear forwards;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(2px);
          }
        `,
        }}
      />
    </div>
  );
};

export default Login;
