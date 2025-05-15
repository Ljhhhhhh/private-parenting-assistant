import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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

const ResetPasswordPage: React.FC = () => {
  const { resetPassword, sendResetPasswordCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [form] = Form.useForm();
  const [resetSuccess, setResetSuccess] = useState(false);
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
  
  // 从 URL 中获取邮箱参数
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      form.setFieldsValue({ email: emailParam });
    }
  }, [location.search, form]);

  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        Dialog.alert({
          content: '请输入邮箱地址',
          confirmText: '确定',
        });
        return;
      }

      setCodeSending(true);
      await sendResetPasswordCode(email);
      setCountdown(60);
      Toast.show({
        icon: 'success',
        content: '验证码已发送',
      });
    } catch (error) {
      console.error('发送验证码失败:', error);
      Dialog.alert({
        content: '发送验证码失败，请稍后重试',
        confirmText: '确定',
      });
    } finally {
      setCodeSending(false);
    }
  };

  const onFinish = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
    verificationCode: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      Dialog.alert({
        content: '两次输入的密码不一致',
        confirmText: '确定',
      });
      return;
    }

    if (!values.verificationCode) {
      Dialog.alert({
        content: '请输入验证码',
        confirmText: '确定',
      });
      return;
    }

    try {
      setLoading(true);
      await resetPassword(values.email, values.password, values.verificationCode);
      setResetSuccess(true);
      Toast.show({
        icon: 'success',
        content: '密码重置成功',
      });
    } catch (error) {
      console.error('密码重置失败:', error);
      Dialog.alert({
        content: '密码重置失败，请检查验证码是否正确或网络连接',
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
        重置密码
      </NavBar>
      <SafeArea position="top" />

      <div className="flex flex-col justify-center flex-1 p-6">
        {resetSuccess ? (
          <div className="animate-fade-in">
            <Result
              status="success"
              title="密码重置成功"
              description={
                <div className="mt-2 text-center text-gray-500">
                  <p>您的密码已成功重置，现在可以使用新密码登录了。</p>
                </div>
              }
            />
            <div className="flex justify-center mt-8">
              <Button color="primary" onClick={() => navigate('/login')}>
                去登录
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
                重置密码
              </h1>
              <p className="mt-2 text-center text-gray-500">请输入新密码</p>
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
                  {loading ? <DotLoading color="white" /> : '重置密码'}
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
                  disabled={!!email}
                />
              </Form.Item>

              <Form.Item
                name="verificationCode"
                label="验证码"
                rules={[{ required: true, message: '请输入验证码' }]}
                extra={
                  <div className="flex justify-end">
                    <Button
                      color="primary"
                      fill="none"
                      size="small"
                      loading={codeSending}
                      disabled={codeSending || (countdown !== null && countdown > 0)}
                      onClick={handleSendCode}
                    >
                      {countdown !== null && countdown > 0 ? (
                        <span className="text-gray-400">{countdown}秒后重试</span>
                      ) : (
                        '获取验证码'
                      )}
                    </Button>
                  </div>
                }
              >
                <Input
                  placeholder="请输入验证码"
                  clearable
                  autoComplete="one-time-code"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度不能少于6位' },
                ]}
              >
                <Input
                  placeholder="请输入新密码"
                  clearable
                  type="password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                rules={[
                  { required: true, message: '请再次输入密码' },
                  { min: 6, message: '密码长度不能少于6位' },
                ]}
              >
                <Input
                  placeholder="请再次输入密码"
                  clearable
                  type="password"
                  autoComplete="new-password"
                />
              </Form.Item>
            </Form>

            <div className="mt-6 text-sm text-center animate-fade-in">
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

export default ResetPasswordPage;
