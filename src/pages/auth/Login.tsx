import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useUserStore } from '@/stores/user';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] bg-white rounded-card shadow-card p-6 mt-12"
      >
        <h1 className="mb-6 font-semibold text-center text-text-primary text-h1">
          登录
        </h1>
        <div className="mb-4">
          <label className="block mb-2 text-base font-medium text-text-primary">
            邮箱
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入邮箱"
            clearable
          />
        </div>
        <div className="mb-2">
          <label className="block mb-2 text-base font-medium text-text-primary">
            密码
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            clearable
          />
        </div>
        {error && (
          <div className="mb-2 text-sm text-center text-error">{error}</div>
        )}
        <Button
          block
          type="submit"
          loading={loading}
          variant="primary"
          className="mt-4"
        >
          登录
        </Button>
        <div className="flex justify-between mt-4 text-base text-primary">
          <Link to="/register">注册账号</Link>
          <Link to="/reset-password">忘记密码？</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
