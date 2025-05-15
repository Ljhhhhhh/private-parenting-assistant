import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Toast,
  NavBar,
  DotLoading,
  AutoCenter,
  Image,
  SafeArea,
  Dialog,
  Result,
} from 'antd-mobile';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const { sendResetPasswordCode } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);

  // 处理倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      await sendResetPasswordCode(values.email);
      setEmail(values.email);
      setEmailSent(true);
      setCountdown(60);
      Toast.show({
        icon: 'success',
        content: '验证码已发送',
      });
    } catch (error) {
      console.error('发送验证码失败:', error);
      Dialog.alert({
        content: '发送验证码失败，请检查邮箱是否正确或网络连接',
        confirmText: '确定',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavBar
        className="border-b border-gray-200"
        onBack={() => navigate('/login')}
      >
        忘记密码
      </NavBar>
      <SafeArea position="top" />

      <div className="flex flex-col flex-1 justify-center p-6">
        {emailSent ? (
          <div className="animate-fade-in">
            <Result
              status="success"
              title="验证码已发送"
              description={
                <div className="mt-2 text-center text-gray-500">
                  <p>我们已将验证码发送至：</p>
                  <p className="mt-1 font-medium">{email}</p>
                  <p className="mt-4">请前往重置密码页面输入验证码和新密码。</p>
                  <p className="mt-2">
                    如果没有收到验证码，请检查垃圾邮件文件夹或重新获取。
                  </p>
                </div>
              }
            />
            <div className="flex justify-center mt-8 space-x-4">
              <Button
                color="primary"
                onClick={() => navigate('/reset-password')}
              >
                去重置密码
              </Button>
              <Button
                color="primary"
                fill="outline"
                onClick={() => navigate('/login')}
              >
                返回登录
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 animate-fade-in">
              <AutoCenter>
                <Image
                  src="/logo.svg"
                  width={120}
                  height={120}
                  fit="contain"
                  style={{ borderRadius: 20 }}
                  placeholder=""
                  alt="育儿助手"
                  fallback={
                    <div className="w-[120px] h-[120px] bg-gray-200 rounded-[20px] flex items-center justify-center text-gray-500">
                      育儿助手
                    </div>
                  }
                />
              </AutoCenter>
              <h1 className="mt-4 text-2xl font-bold text-center text-primary-600">
                忘记密码
              </h1>
              <p className="mt-2 text-center text-gray-500">
                请输入您的邮箱，我们将发送重置密码的链接
              </p>
            </div>

            <Form
              layout="vertical"
              onFinish={onFinish}
              form={form}
              footer={
                <Button
                  block
                  type="submit"
                  color="primary"
                  size="large"
                  loading={loading}
                  disabled={loading}
                  className="mt-8 rounded-lg"
                >
                  {loading ? <DotLoading color="white" /> : '发送重置链接'}
                </Button>
              }
              className="animate-slide-up"
            >
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  placeholder="请输入邮箱"
                  clearable
                  autoComplete="email"
                />
              </Form.Item>
            </Form>

            <div className="mt-6 text-sm text-center animate-fade-in">
              <span className="text-gray-500">想起密码了？</span>{' '}
              <Link to="/login" className="font-medium text-primary-600">
                返回登录
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="p-4 text-xs text-center text-gray-400 animate-fade-in">
        <p>如需帮助，请联系客服支持</p>
      </div>
      <SafeArea position="bottom" />
    </div>
  );
};

export default ForgotPasswordPage;
