import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Toast } from '@/components/ui';
import type { FormInstance } from '@/components/ui';
import { useUserStore } from '@/stores/user';

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

  // 验证码倒计时
  const handleSendCode = async () => {
    const email = formRef.current?.getFieldValue('email');
    if (!email) {
      setToast({ type: 'fail', content: '请先输入邮箱' });
      return;
    }
    setCodeLoading(true);
    try {
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
    setLoading(true);
    try {
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-md p-6 mt-12">
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#333] mb-6 text-center">
          重置密码
        </h1>
        <Form
          form={formRef}
          layout="vertical"
          onFinish={handleFinish}
          footer={
            <Button
              block
              className="rounded-[12px] h-12 text-base font-medium"
              loading={loading}
              type="submit"
              variant="primary"
            >
              重置密码
            </Button>
          }
        >
          <Form.Item
            label={
              <span className="text-[#666] text-base font-medium">邮箱</span>
            }
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input
              placeholder="请输入邮箱"
              className="rounded-[8px] h-12 px-4 text-base bg-background"
              clearable
              type="email"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-[#666] text-base font-medium">验证码</span>
            }
            rules={[
              { required: true, message: '请输入验证码' },
              { len: 6, message: '验证码为6位数字' },
            ]}
            extra={
              <Button
                className="rounded-[8px] px-3 text-sm h-8"
                onClick={handleSendCode}
                loading={codeLoading}
                disabled={countdown > 0}
                type="button"
                variant="secondary"
              >
                {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
              </Button>
            }
          >
            <Input
              placeholder="请输入邮箱验证码"
              className="rounded-[8px] h-12 px-4 text-base bg-background"
              clearable
              type="number"
              maxLength={6}
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-[#666] text-base font-medium">新密码</span>
            }
            rules={[
              { required: true, message: '请输入新密码' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
                message: '密码需8位以上，含大小写字母和数字',
              },
            ]}
          >
            <Input
              placeholder="请输入新密码（8位以上，含大小写字母和数字）"
              className="rounded-[8px] h-12 px-4 text-base bg-background"
              clearable
              type="password"
            />
          </Form.Item>
        </Form>
        <div className="flex justify-end mt-4 text-[14px] text-[#4A90E2]">
          <Link to="/login">返回登录</Link>
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
    </div>
  );
};

export default ResetPassword;
