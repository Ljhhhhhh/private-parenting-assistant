import React, { useState } from 'react';
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
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      await forgotPassword(values.email);
      setEmail(values.email);
      setEmailSent(true);
      Toast.show({
        icon: 'success',
        content: '重置密码邮件已发送',
      });
    } catch (error) {
      console.error('密码找回失败:', error);
      Dialog.alert({
        content: '发送重置密码邮件失败，请检查邮箱是否正确或网络连接',
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

      <div className="flex-1 p-6 flex flex-col justify-center">
        {emailSent ? (
          <div className="animate-fade-in">
            <Result
              status="success"
              title="重置密码邮件已发送"
              description={
                <div className="text-center text-gray-500 mt-2">
                  <p>我们已将重置密码的链接发送至：</p>
                  <p className="font-medium mt-1">{email}</p>
                  <p className="mt-4">
                    请检查您的邮箱，并点击邮件中的链接重置密码。
                  </p>
                  <p className="mt-2">
                    如果没有收到邮件，请检查垠垃圾邮件文件夹。
                  </p>
                </div>
              }
            />
            <div className="mt-8 flex justify-center">
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
              <h1 className="text-2xl font-bold text-center mt-4 text-primary-600">
                忘记密码
              </h1>
              <p className="text-gray-500 text-center mt-2">
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

            <div className="mt-6 text-center text-sm animate-fade-in">
              <span className="text-gray-500">想起密码了？</span>{' '}
              <Link to="/login" className="text-primary-600 font-medium">
                返回登录
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="p-4 text-center text-xs text-gray-400 animate-fade-in">
        <p>如需帮助，请联系客服支持</p>
      </div>
      <SafeArea position="bottom" />
    </div>
  );
};

export default ForgotPasswordPage;
