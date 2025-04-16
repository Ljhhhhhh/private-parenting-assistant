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
  Checkbox,
  Dialog,
} from 'antd-mobile';
// 不再需要图标导入
// import { LockOutline, UserOutline } from 'antd-mobile-icons';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/common/LoadingScreen';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [rememberPassword, setRememberPassword] = useState(() => {
    return localStorage.getItem('rememberPassword') === 'true';
  });

  // 如果已经登录，直接跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }

    // 如果记住密码，从localStorage中获取邮箱
    if (rememberPassword) {
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        form.setFieldsValue({ email: savedEmail });
      }
    }
  }, [isAuthenticated, navigate, rememberPassword, form]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);

      // 保存邮箱到localStorage（如果选择了记住密码）
      if (rememberPassword) {
        localStorage.setItem('userEmail', values.email);
        localStorage.setItem('rememberPassword', 'true');
      } else {
        localStorage.removeItem('userEmail');
        localStorage.setItem('rememberPassword', 'false');
      }

      await login(values.email, values.password);
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      Dialog.alert({
        content: '登录失败，请检查邮箱和密码是否正确',
        confirmText: '确定',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRememberChange = (checked: boolean) => {
    setRememberPassword(checked);
  };

  // 如果正在检查认证状态，显示加载屏幕
  if (isLoading) {
    return <LoadingScreen tip="正在加载..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* <NavBar className="border-b border-gray-200" back={null}>
        登录
      </NavBar> */}
      <SafeArea position="top" />

      <div className="flex flex-col justify-center flex-1 p-6">
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
          <p className="mt-2 text-center text-gray-500">科学育儿，轻松成长</p>
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
              {loading ? <DotLoading color="white" /> : '登录'}
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
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input
              placeholder="请输入密码"
              clearable
              type="password"
              autoComplete="current-password"
            />
          </Form.Item>

          <div className="flex items-center justify-between mt-2">
            <Checkbox
              checked={rememberPassword}
              onChange={handleRememberChange}
            >
              <span className="text-sm text-gray-600">记住账号</span>
            </Checkbox>
          </div>
        </Form>

        <div className="flex justify-between mt-6 text-sm animate-fade-in">
          <Link to="/forgot-password" className="text-primary-600">
            忘记密码?
          </Link>
          <Link to="/register" className="text-primary-600">
            注册新账号
          </Link>
        </div>
      </div>

      <div className="p-4 text-xs text-center text-gray-400 animate-fade-in">
        <p>登录即表示您同意我们的</p>
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
      <SafeArea position="bottom" />
    </div>
  );
};

export default LoginPage;
