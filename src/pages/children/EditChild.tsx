import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from '@/components/ui';
import ChildForm, { ChildFormValues } from '@/components/children/ChildForm';
import { getAllChildren, updateChild } from '@/api/children';
import { ChildResponseDto } from '@/types/models';

const EditChild: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [child, setChild] = useState<ChildResponseDto | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'fail' | 'loading' | 'info';
    content: string;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChild = async () => {
      setInitLoading(true);
      try {
        const list = await getAllChildren();
        const found = list.find((c) => String(c.id) === id);
        if (found) setChild(found);
        else setToast({ type: 'fail', content: '未找到宝宝信息' });
      } catch {
        setToast({ type: 'fail', content: '获取宝宝信息失败' });
      } finally {
        setInitLoading(false);
      }
    };
    fetchChild();
  }, [id]);

  const handleSubmit = async (values: ChildFormValues) => {
    if (!child) return;
    setLoading(true);
    try {
      await updateChild(child.id, values);
      setToast({ type: 'success', content: '保存成功' });
      navigate('/children');
    } catch {
      setToast({ type: 'fail', content: '保存失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] px-4">
      <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-md p-6 mt-12">
        <h1 className="text-[24px] leading-[32px] font-semibold text-[#333] mb-6 text-center">
          编辑宝宝
        </h1>
        {initLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-primary rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : child ? (
          <ChildForm
            initialValues={child}
            loading={loading}
            onSubmit={handleSubmit}
            submitText="保存"
          />
        ) : (
          <div className="text-[#999] text-center py-8">未找到宝宝信息</div>
        )}
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

export default EditChild;
