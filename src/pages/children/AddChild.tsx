import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '@/components/ui';
import ChildForm, { ChildFormValues } from '@/components/children/ChildForm';
import { createChild } from '@/api/children';

const AddChild: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'fail' | 'loading' | 'info';
    content: string;
    duration?: number;
  } | null>(null);
  const navigate = useNavigate();

  // 创建气泡效果
  useEffect(() => {
    const createBubbles = () => {
      const container = document.getElementById('bubble-container');
      if (!container) return;

      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          const bubble = document.createElement('div');
          bubble.className = 'bubble';

          // 随机尺寸
          const size = Math.floor(Math.random() * 60) + 20;
          bubble.style.width = size + 'px';
          bubble.style.height = size + 'px';

          // 随机水平位置
          bubble.style.left = Math.floor(Math.random() * 100) + '%';

          // 随机动画持续时间
          const duration = Math.floor(Math.random() * 8) + 8;
          bubble.style.animationDuration = duration + 's';

          container.appendChild(bubble);

          // 动画结束后移除元素
          setTimeout(() => {
            bubble.remove();
          }, duration * 1000);
        }, i * 1200);
      }
    };

    createBubbles();
    // 每30秒重新生成一批气泡
    const interval = setInterval(createBubbles, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values: ChildFormValues) => {
    setLoading(true);
    try {
      await createChild(values);
      setToast({ type: 'success', content: '添加成功', duration: 2000 });
      setTimeout(() => {
        navigate('/children');
      }, 500);
    } catch (err) {
      console.error(err);
      setToast({ type: 'fail', content: '添加失败，请重试', duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#E8F0FE] to-[#FFF0F5] relative overflow-hidden">
      {/* 气泡动画容器 */}
      <div
        id="bubble-container"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      />

      {/* 主内容卡片 */}
      <div className="relative z-10 mx-4 mt-12 w-full max-w-[420px]">
        {/* 表单卡片 - 使用半透明效果与背景协调 */}
        <div className="relative overflow-hidden rounded-[24px] backdrop-blur-md bg-white/80 shadow-lg border border-white/50">
          <div className="relative p-8">
            {/* 顶部装饰元素 */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-[#4A90E2]/20 to-[#F8BBD0]/30 blur-xl"></div>

            <h1 className="text-[28px] leading-[36px] font-semibold text-[#333] mb-8 text-center">
              添加宝宝信息
            </h1>

            <p className="text-[#555] text-base mb-8 text-center">
              填写宝宝基本信息，开始育儿之旅
            </p>

            <ChildForm
              loading={loading}
              onSubmit={handleSubmit}
              submitText="开启幸福育儿之旅"
            />
          </div>
        </div>

        {/* 温馨提示 */}
        <div className="mt-6 text-center text-[14px] text-[#666]">
          <p>填写真实信息有助于我们提供更精准的育儿建议</p>
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

      {/* CSS动画样式 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes bubble-rise {
            0% {
              transform: translateY(100vh) scale(0);
              opacity: 0;
            }
            20% {
              opacity: 0.6;
            }
            80% {
              opacity: 0.6;
            }
            100% {
              transform: translateY(-100px) scale(1);
              opacity: 0;
            }
          }
          
          .bubble {
            position: absolute;
            bottom: -100px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(74, 144, 226, 0.3));
            border-radius: 50%;
            animation: bubble-rise linear forwards;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(2px);
          }
          `,
        }}
      />
    </div>
  );
};

export default AddChild;
