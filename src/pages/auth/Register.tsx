import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Toast } from '@/components/ui';
import type { FormInstance } from '@/components/ui';
import { useUserStore } from '@/stores/user';
import { useChildrenStore } from '@/stores/children';

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
  const { register, sendRegisterCode } = useUserStore();
  const children = useChildrenStore((s) => s.children);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#E8F0FE] to-[#FFF0F5] relative overflow-hidden">
      {/* 气泡动画容器 */}
      <div
        id="bubble-container"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      />
      {/* 主内容卡片 */}
      <div className="relative z-10 mx-4 mt-12 ">
        {/* 表单卡片 - 使用半透明效果与背景协调 */}
        <div className="relative overflow-hidden rounded-[24px] backdrop-blur-md bg-white/80 shadow-lg border border-white/50">
          <div className="relative p-8">
            <h1 className="text-[28px] leading-[36px] font-semibold text-[#333] mb-8 text-center">
              欢迎加入 AI育儿助手
            </h1>

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
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                          fill="currentColor"
                        />
                      </svg>
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

              {/* 密码输入 */}
              <div>
                <label className="block text-[#555] text-base mb-2 font-medium">
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
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4A90E2] z-10">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <Input
                      placeholder="请输入密码"
                      className="rounded-[12px] h-[52px] pl-12 pr-4 text-base bg-white/70 border-[#E8F0FE] focus:border-[#4A90E2] focus:bg-white/90 transition-all duration-300"
                      clearable
                      type="password"
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
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                          fill="currentColor"
                        />
                      </svg>
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
                  <span className="text-[#555] text-sm">
                    我已阅读并同意
                    <Link
                      to="/agreement"
                      className="text-[#4A90E2] inline-block"
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
                className="h-[56px] rounded-[16px] text-white text-base font-medium bg-gradient-to-r from-[#4A90E2] to-[#7AADEE] border-none shadow-lg shadow-[#4A90E2]/20 hover:shadow-xl hover:shadow-[#4A90E2]/30 transition-all duration-300 flex items-center justify-center"
                onClick={() => {
                  // 触发表单验证，确保在按钮点击时进行验证
                  formRef.current?.validateFields().catch(() => {
                    // 验证失败时显示提示
                    setToast({ type: 'fail', content: '请完成所有必填项' });
                  });
                }}
              >
                开始育儿之旅
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
            </Form>

            {/* 已有账号提示 */}
            <div className="flex justify-center mt-8 text-[14px]">
              <span className="text-[#555]">已有账号？</span>
              <Link to="/login" className="text-[#4A90E2] font-medium ml-1">
                去登录
              </Link>
            </div>
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

export default Register;
