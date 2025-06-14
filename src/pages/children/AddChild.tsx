import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '@/components/ui';
import { Icon } from '@iconify/react';
import ChildForm, { ChildFormValues } from '@/components/children/ChildForm';
import { createChild } from '@/api/children';
import { useAppStore } from '@/stores/app';

const AddChild: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'fail' | 'loading' | 'info';
    content: string;
    duration?: number;
  } | null>(null);
  const navigate = useNavigate();
  const appStore = useAppStore();

  const handleSubmit = async (values: ChildFormValues) => {
    setLoading(true);
    try {
      await createChild(values);
      await appStore.refreshUserData();
      setToast({
        type: 'success',
        content: '添加成功！开启美好的育儿时光 🎉',
        duration: 2000,
      });
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err) {
      console.error(err);
      setToast({ type: 'fail', content: '添加失败，请重试', duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 主内容区域 */}
      <div className="flex-1 px-4 pt-12 pb-safe">
        <div className="w-full max-w-[420px] mx-auto">
          {/* 标题区域 */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 font-semibold text-h1 text-text-primary">
              添加宝宝信息
            </h1>
            <p className="text-base leading-relaxed text-text-secondary">
              填写宝宝基本信息，开始记录成长时光
            </p>
          </div>

          {/* 提示信息 */}
          <div className="p-4 mb-6 border bg-primary/5 rounded-input border-primary/20">
            <div className="flex items-start gap-3">
              <Icon
                icon="material-symbols:info"
                className="text-primary text-lg mt-0.5 flex-shrink-0"
              />
              <div className="text-sm text-text-secondary">
                <p className="mb-1 font-medium text-text-primary">贴心提醒</p>
                <p>填写真实信息，为您和宝宝提供更精准的个性化建议</p>
              </div>
            </div>
          </div>

          {/* 表单 */}
          <ChildForm
            loading={loading}
            onSubmit={handleSubmit}
            submitText="🌟 开启育儿时光"
          />

          {/* 底部文案 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-tertiary">
              ✨ 每一个宝宝都是独一无二的珍宝
            </p>
          </div>
        </div>
      </div>

      {/* 渲染Toast */}
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

export default AddChild;
