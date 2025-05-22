import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Toast } from '@/components/ui';
import type { FormInstance } from '@/components/ui';
import { useUserStore } from '@/stores/user';
import { useChildrenStore } from '@/stores/children';
import { Icon } from '@iconify/react';
import logoImage from '@/assets/logo.png';

const Register: React.FC = () => {
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
  const { sendRegisterCode, register } = useUserStore();
  const children = useChildrenStore((s) => s.children);

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
      await sendRegisterCode(email);
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
      await register(values.email, values.password, values.verificationCode);
      setToast({ type: 'success', content: '注册成功' });
      setTimeout(() => {
        if (children && children.length > 0) {
          navigate('/children');
        } else {
          navigate('/children/add');
        }
      }, 300);
    } catch (err: any) {
      setToast({ type: 'fail', content: err?.message || '注册失败' });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex overflow-hidden justify-center items-center mb-4 w-24 h-24">
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

        {/* 注册表单 */}
        <div className="p-6 bg-white border backdrop-blur-md rounded-dialog shadow-card border-gray-300/20">
          <h2 className="mb-6 font-semibold text-gray-700 text-h2">创建账户</h2>

          <Form form={formRef} layout="vertical" onFinish={handleFinish}>
            {/* 邮箱输入 */}
            <div>
              <label className="block mb-2 text-base font-medium text-gray-600">
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
                  <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary">
                    <Icon icon="mdi:email-outline" width="20" height="20" />
                  </div>
                  <Input
                    placeholder="请输入邮箱"
                    className="w-full h-[48px] pl-12 pr-4 text-base-lg border border-gray-300 rounded-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-normal bg-white/70 focus:bg-white/90"
                    clearable
                    type="email"
                  />
                </div>
              </Form.Item>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block mb-2 text-base font-medium text-gray-600">
                密码
              </label>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
                    message: '密码需8位以上，含大小写字母和数字',
                  },
                ]}
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary">
                    <Icon icon="mdi:lock-outline" width="20" height="20" />
                  </div>
                  <Input
                    placeholder="请输入密码"
                    className="w-full h-[48px] pl-12 pr-4 text-base-lg border border-gray-300 rounded-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-normal bg-white/70 focus:bg-white/90"
                    clearable
                    type="password"
                  />
                </div>
              </Form.Item>
            </div>

            {/* 验证码输入 */}
            <div>
              <label className="block mb-2 text-base font-medium text-gray-600">
                验证码
              </label>
              <Form.Item
                name="verificationCode"
                rules={[
                  { required: true, message: '请输入验证码' },
                  { len: 6, message: '验证码为6位数字' },
                ]}
              >
                <div className="flex relative">
                  <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-primary">
                    <Icon
                      icon="mdi:shield-check-outline"
                      width="20"
                      height="20"
                    />
                  </div>
                  <Input
                    placeholder="请输入验证码"
                    className="w-full h-[48px] pl-12 pr-4 text-base-lg border border-gray-300 rounded-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-normal bg-white/70 focus:bg-white/90 flex-1"
                    clearable
                    type="number"
                    maxLength={6}
                  />
                  <Button
                    className="ml-2 rounded-btn min-w-[120px] bg-gradient-to-r from-primary to-primary-light text-white h-[48px] border-none"
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

            {/* 协议同意 */}
            <Form.Item
              name="agreement"
              rules={[{ required: true, message: '请同意协议' }]}
              valuePropName="checked"
            >
              <div className="flex items-center mb-8">
                <Checkbox
                  onChange={(e) => {
                    // 处理复选框变化
                    formRef.current?.setFieldValue(
                      'agreement',
                      e.target.checked,
                    );
                  }}
                />
                <span className="ml-2 text-sm text-gray-600">
                  我已阅读并同意
                  <Link
                    to="/agreement"
                    className="inline-block ml-1 text-text-link"
                  >
                    《用户协议与隐私政策》
                  </Link>
                </span>
              </div>
            </Form.Item>

            {/* 注册按钮 */}
            <Button
              block
              type="submit"
              loading={loading}
              className="relative w-full h-[48px] px-4 py-2 text-white bg-gradient-to-r from-primary to-primary-light rounded-btn shadow-btn hover:shadow-xl hover:shadow-primary/30 transition-all duration-normal overflow-hidden group"
              onClick={() => {
                // 触发表单验证，确保在按钮点击时进行验证
                formRef.current?.validateFields().catch(() => {
                  // 验证失败时显示提示
                  setToast({ type: 'fail', content: '请完成所有必填项' });
                });
              }}
            >
              <span className="flex relative z-10 justify-center items-center font-medium text-base-lg">
                开始育儿之旅
                <Icon
                  icon="mdi:arrow-right"
                  width="18"
                  height="18"
                  className="ml-2 transition-transform duration-normal group-hover:translate-x-1"
                />
              </span>
              <div
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r opacity-0 transition-opacity from-primary-dark to-primary group-hover:opacity-100 duration-normal"
                style={{ filter: 'blur(10px)', transform: 'scale(1.2)' }}
              ></div>
            </Button>
          </Form>

          {/* 已有账号提示 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">已有账号？</span>
            <Link
              to="/login"
              className="ml-1 text-sm font-medium transition-colors text-text-link hover:text-primary-dark"
            >
              去登录
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
          `,
        }}
      />
    </div>
  );
};

export default Register;
