import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '@/components/ui';
import ChildForm, { ChildFormValues } from '@/components/children/ChildForm';
import { createChild } from '@/api/children';

const AddChild: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'fail' | 'loading' | 'info';
    content: string;
  } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: ChildFormValues) => {
    setLoading(true);
    try {
      await createChild(values);
      setToast({ type: 'success', content: '添加成功' });
      navigate('/children');
    } catch (err) {
      console.error(err);
      setToast({ type: 'fail', content: '添加失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-md p-6 mt-12">
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#333] mb-6 text-center">
          添加宝宝
        </h1>
        <ChildForm
          loading={loading}
          onSubmit={handleSubmit}
          submitText="保存"
        />
      </div>

      {/* 渲染Toast */}
      {toast && (
        <Toast
          type={toast.type}
          content={toast.content}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AddChild;
