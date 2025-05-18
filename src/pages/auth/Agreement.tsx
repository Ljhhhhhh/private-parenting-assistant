import React from 'react';
import { NavBar } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

const Agreement: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar
        onBack={() => navigate(-1)}
        title="用户协议与隐私政策"
        className="bg-white shadow-sm text-[#333] text-lg font-semibold h-[56px] rounded-b-lg"
      />
      <div className="flex-1 overflow-y-auto p-6 bg-white rounded-t-2xl mt-2 max-w-[600px] mx-auto">
        {/* TODO: 协议内容插槽 */}
        <div className="text-[#666] text-sm leading-6">
          <p>这里是用户协议与隐私政策的内容占位符。</p>
        </div>
      </div>
    </div>
  );
};

export default Agreement;
