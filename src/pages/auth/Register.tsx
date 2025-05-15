import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Toast,
  Space,
  DotLoading,
  AutoCenter,
  Image,
  SafeArea,
  Dialog,
  Checkbox,
} from 'antd-mobile';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';

const RegisterPage: React.FC = () => {
  const { register, isAuthenticated, isLoading, sendRegisterCode } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // 如果已经登录，直接跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
      await sendRegisterCode(email);
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

    if (!agreeTerms) {
      Dialog.alert({
        content: '请阅读并同意服务条款和隐私政策',
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
      await register(values.email, values.password, values.verificationCode);
      Toast.show({
        icon: 'success',
        content: '注册成功',
      });
      navigate('/');
    } catch (error) {
      console.error('注册失败:', error);
      Dialog.alert({
        content: '注册失败，请检查邮箱或验证码是否正确',
        confirmText: '确定',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAgreeChange = (checked: boolean) => {
    setAgreeTerms(checked);
  };

  // 如果正在检查认证状态，显示加载屏幕
  if (isLoading) {
    return <LoadingScreen tip="正在加载..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SafeArea position="top" />

      <div className="flex flex-col flex-1 justify-center p-6">
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
            AI 赋能育儿助手
          </h1>
          <p className="mt-2 text-center text-gray-500">
            创建账号，开启智能育儿之旅
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
              disabled={loading || !agreeTerms}
              className="mt-8 rounded-lg"
            >
              {loading ? <DotLoading color="white" /> : '注册'}
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
            <Input placeholder="请输入邮箱" clearable autoComplete="email" />
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
                  disabled={
                    codeSending || (countdown !== null && countdown > 0)
                  }
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
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度不能少于6位' },
            ]}
          >
            <Input
              placeholder="请输入密码"
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

          <div className="flex justify-between items-center mt-4">
            <Checkbox checked={agreeTerms} onChange={handleAgreeChange}>
              <span className="text-sm text-gray-600">我已阅读并同意</span>
            </Checkbox>
          </div>
        </Form>

        <div className="mt-2 text-xs text-center text-gray-500">
          <Space>
            <a href="#" className="text-primary-600">
              服务条款
            </a>
            <span>和</span>
            <a href="#" className="text-primary-600">
              隐私政策
            </a>
          </Space>
        </div>

        <div className="mt-6 text-sm text-center animate-fade-in">
          <span className="text-gray-500">已有账号？</span>{' '}
          <Link to="/login" className="font-medium text-primary-600">
            立即登录
          </Link>
        </div>
      </div>

      <div className="p-4 text-xs text-center text-gray-400 animate-fade-in">
        <p>注册即表示您同意我们的服务条款和隐私政策</p>
      </div>
      <SafeArea position="bottom" />
    </div>
  );
};

export default RegisterPage;
