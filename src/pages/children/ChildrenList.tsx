import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Toast, NavBar } from '@/components/ui';
import ChildCard from '@/components/children/ChildCard';
import { getAllChildren } from '@/api/children';
import { ChildResponseDto } from '@/types/models';
import { useChildrenStore } from '@/stores/children';

const ChildrenList: React.FC = () => {
  const [children, setChildren] = useState<ChildResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'fail' | 'loading' | 'info';
    content: string;
  } | null>(null);

  const navigate = useNavigate();
  const { currentChild, setCurrentChild } = useChildrenStore();

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await getAllChildren();
      setChildren(res);

      // 如果没有选中的儿童但有儿童列表，自动选择第一个
      if (res.length > 0 && !currentChild) {
        setCurrentChild(res[0]);
      }
    } catch (e) {
      console.error(e);
      setToast({ type: 'fail', content: '获取宝宝信息失败' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSelectChild = (child: ChildResponseDto) => {
    setCurrentChild(child);
    setToast({ type: 'success', content: `已选择 ${child.nickname}` });

    // 短暂延迟后跳转到首页
    setTimeout(() => {
      navigate('/home');
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar title="我的宝宝" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 pt-4 pb-20">
        <div className="flex flex-col w-full gap-4 mx-auto mb-8 max-w-content">
          {children.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex items-center justify-center w-24 h-24 mb-4 bg-gray-200 rounded-full">
                <span className="text-4xl text-gray-400">宝</span>
              </div>
              <div className="mb-4 text-center text-text-tertiary">
                暂无宝宝信息，请添加宝宝
              </div>
            </div>
          ) : (
            children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                isSelected={currentChild?.id === child.id}
                onSelect={() => handleSelectChild(child)}
                onEdit={() => navigate(`/children/edit/${child.id}`)}
              />
            ))
          )}
        </div>
        <Button
          variant="primary"
          gradient
          className="w-full h-12 mx-auto text-base font-medium rounded-btn max-w-content shadow-btn"
          onClick={() => navigate('/children/add')}
          loading={loading}
        >
          + 添加宝宝
        </Button>

        {/* 渲染Toast */}
        {toast && (
          <Toast
            type={toast.type}
            content={toast.content}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ChildrenList;
