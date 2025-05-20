import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Toast } from '@/components/ui';
import type { FormInstance } from '@/components/ui';
import { useUserStore } from '@/stores/user';
import { Icon } from '@iconify/react';

const ResetPassword: React.FC = () => {
  const formRef = useRef<FormInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [toast, setToast] = useState<{
    type: 'success' | 'fail' | 'loading' | 'info';
    content: string;
    duration?: number;
  } | null>(null);
  const navigate = useNavigate();
  const { sendResetPasswordCode, resetPassword } = useUserStore();

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
    
    return () => {
      const container = document.getElementById('wave-container');
      if (container) container.innerHTML = '';
    };
  }, []);

  // 验证码倒计时
  const handleSendCode = async () => {
    try {
      // 验证邮箱字段
      const email = formRef.current?.getFieldValue('email');
      if (!email) {
        setToast({ type: 'fail', content: '请先输入邮箱' });
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      if (!emailRegex.test(email)) {
        setToast({ type: 'fail', content: '邮箱格式不正确' });
        return;
      }

      setCodeLoading(true);
      await sendResetPasswordCode(email);
      setToast({ type: 'success', content: '验证码已发送' });
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setToast({ type: 'fail', content: err?.message || '发送失败' });
    } finally {
      setCodeLoading(false);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      // 表单提交前进行验证
      await formRef.current?.validateFields();

      setLoading(true);
      await resetPassword(
        values.email,
        values.newPassword,
        values.verificationCode,
      );
      setToast({ type: 'success', content: '重置成功，请登录' });
      setTimeout(() => {
        navigate('/login');
      }, 300);
    } catch (err: any) {
      setToast({ type: 'fail', content: err?.message || '重置失败' });
    } finally {
      setLoading(false);
    }
  };

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
            className="w-20 h-20 rounded-full bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] flex items-center justify-center mb-4 shadow-lg"
          >
            <Icon 
              icon="mdi:lock-reset" 
              width="40" 
              height="40" 
              color="white" 
            />
          </div>
          <h1 className="text-2xl font-bold text-[#333333] mb-1">重置密码</h1>
          <p className="text-[#666666] text-center max-w-xs">
            别担心，我们会帮您找回账号访问权限
          </p>
        </div>
        
        {/* 重置密码表单 */}
        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 shadow-xl border border-white/50">
          <h2 className="text-xl font-semibold text-[#333333] mb-6">找回密码</h2>

          <Form form={formRef} layout="vertical" onFinish={handleFinish}>
            {/* 邮箱输入 */}
            <div>
              <label className="block text-[#555] text-base mb-2 font-medium">
                邮箱
              </label>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '邮箱格式不正确' },
                ]}
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A90E2] z-10">
                    <Icon icon="mdi:email-outline" width="24" height="24" />
                  </div>
                  <Input
                    placeholder="请输入邮箱"
                    className="rounded-[12px] h-[52px] pl-12 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300"
                    clearable
                    type="email"
                  />
                </div>
              </Form.Item>
            </div>

            {/* 验证码输入 */}
            <div>
              <label className="block text-[#555] text-base mb-2 font-medium">
                验证码
              </label>
              <Form.Item
                name="verificationCode"
                rules={[
                  { required: true, message: '请输入验证码' },
                  { len: 6, message: '验证码为6位数字' },
                ]}
              >
                <div className="relative flex">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A90E2] z-10">
                    <Icon icon="mdi:shield-check-outline" width="24" height="24" />
                  </div>
                  <Input
                    placeholder="请输入验证码"
                    className="rounded-[12px] h-[52px] pl-12 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300 flex-1"
                    clearable
                    type="number"
                    maxLength={6}
                  />
                  <Button
                    className="ml-2 rounded-[12px] min-w-[120px] bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] text-white h-[52px] border-none"
                    onClick={handleSendCode}
                    loading={codeLoading}
                    disabled={countdown > 0}
                    type="button"
                  >
                    {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
                  </Button>
                </div>
              </Form.Item>
            </div>

            {/* 新密码输入 */}
            <div>
              <label className="block text-[#555] text-base mb-2 font-medium">
                新密码
              </label>
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
                    message: '密码需8位以上，含大小写字母和数字',
                  },
                ]}
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A90E2] z-10">
                    <Icon icon="mdi:lock-outline" width="24" height="24" />
                  </div>
                  <Input
                    placeholder="请输入新密码"
                    className="rounded-[12px] h-[52px] pl-12 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300"
                    clearable
                    type="password"
                  />
                </div>
              </Form.Item>
            </div>

            {/* 重置按钮 */}
            <Button
              block
              type="submit"
              loading={loading}
              className="h-[56px] rounded-[16px] text-white text-base font-medium bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] border-none shadow-lg shadow-[#4A90E2]/20 hover:shadow-xl hover:shadow-[#4A90E2]/30 transition-all duration-300 flex items-center justify-center mt-8"
              onClick={() => {
                // 触发表单验证，确保在按钮点击时进行验证
                formRef.current?.validateFields().catch(() => {
                  // 验证失败时显示提示
                  setToast({ type: 'fail', content: '请完成所有必填项' });
                });
              }}
            >
              重置密码
              <Icon icon="mdi:arrow-right" width="20" height="20" className="ml-1" />
            </Button>
          </Form>

          {/* 返回登录链接 */}
          <div className="flex justify-center mt-8 text-[14px]">
            <Link
              to="/login"
              className="text-[#4A90E2] font-medium flex items-center"
            >
              <Icon icon="mdi:arrow-left" width="16" height="16" className="mr-1" />
              返回登录
            </Link>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          content={toast.content}
          duration={toast.duration || 2000}
          onClose={() => setToast(null)}
        />
      )}

      {/* CSS动画样式 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes wave {
            0% {
              transform: translateX(-50%) translateY(0) scaleY(1);
            }
            50% {
              transform: translateX(-25%) translateY(-10px) scaleY(0.9);
            }
            100% {
              transform: translateX(0) translateY(0) scaleY(1);
            }
          }
          
          .wave {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 200%;
            height: 100%;
            background: linear-gradient(to bottom, transparent, rgba(74, 144, 226, 0.2));
            border-radius: 50% 50% 0 0 / 100% 100% 0 0;
            animation: wave 15s infinite linear;
            transform-origin: center bottom;
          }
          
          .wave:nth-child(2) {
            height: 80%;
            background: linear-gradient(to bottom, transparent, rgba(248, 187, 208, 0.2));
            animation-duration: 18s;
          }
          
          .wave:nth-child(3) {
            height: 60%;
            background: linear-gradient(to bottom, transparent, rgba(255, 152, 0, 0.1));
            animation-duration: 20s;
          }
          `
        }}
      />
    </div>
  );
};

export default ResetPassword;
