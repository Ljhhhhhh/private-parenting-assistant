import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildrenStore } from '@/stores/children';
import { NavBar } from '@/components/ui';
import { calculateAge } from '@/utils';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentChild } = useChildrenStore();

  // 当进入页面时，如果没有当前选中的孩子，则选择第一个孩子或导航到添加孩子页面
  useEffect(() => {
    // 获取最新的store状态，避免使用过时的组件props
    const latestChildren = useChildrenStore.getState().children;
    const latestCurrentChild = useChildrenStore.getState().currentChild;

    if (!latestCurrentChild && latestChildren.length > 0) {
      // 自动选择第一个儿童
      setCurrentChild(latestChildren[0]);
    } else if (latestChildren.length === 0) {
      // 没有儿童信息，引导用户添加儿童
      navigate('/children/add');
    }
  }, [navigate, setCurrentChild]);

  // 导航到聊天页面
  const navigateToChat = () => {
    navigate('/chat');
  };

  // 导航到聊天页面并预设问题
  const navigateToChatWithQuestion = (question: string) => {
    // 由于无法直接设置聊天页面的输入值，我们可以通过URL参数传递
    navigate(`/chat?question=${encodeURIComponent(question)}`);
  };

  // 导航到儿童管理页面
  const navigateToChildren = () => {
    navigate('/children');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar
        title="智能育儿助手"
        right={
          <div
            className="flex items-center text-primary"
            onClick={navigateToChildren}
          >
            <span>切换</span>
          </div>
        }
      />

      <div className="flex-1 px-4 pt-4 pb-20 overflow-auto">
        {/* 当前孩子卡片 */}
        {(() => {
          // 获取当前最新的选中儿童
          const currentChild = useChildrenStore.getState().currentChild;

          if (!currentChild) return null;

          return (
            <div
              className="mb-4 transition-all bg-white cursor-pointer rounded-card shadow-card hover:shadow-md"
              onClick={navigateToChildren}
            >
              <div className="flex items-center p-4">
                <div
                  className={`flex items-center justify-center w-12 h-12 mr-3 rounded-full ${
                    currentChild.gender === 'male'
                      ? 'bg-primary-light text-primary'
                      : currentChild.gender === 'female'
                      ? 'bg-pink text-text-white'
                      : 'bg-orange-light text-orange'
                  }`}
                >
                  <span className="text-2xl">
                    {currentChild.nickname?.charAt(0) || '宝'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-text-primary">
                    {currentChild.nickname || '宝宝'}
                  </h3>
                  <p className="text-sm text-text-tertiary">
                    {calculateAge(currentChild.dateOfBirth)}
                  </p>
                </div>
                <div className="text-primary">更多 &gt;</div>
              </div>
            </div>
          );
        })()}

        {/* 功能区 */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-medium text-text-primary">
            今日概览
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer bg-gray-50 rounded-card shadow-card hover:shadow-md"
              onClick={navigateToChat}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-2 rounded-full bg-primary-light">
                <span className="text-xl text-primary">问</span>
              </div>
              <span className="text-sm text-text-primary">智能问答</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 text-center transition-all bg-gray-50 rounded-card shadow-card hover:shadow-md">
              <div className="flex items-center justify-center w-12 h-12 mb-2 rounded-full bg-success/20">
                <span className="text-xl text-success">记</span>
              </div>
              <span className="text-sm text-text-primary">成长记录</span>
            </div>
          </div>
        </div>

        {/* 常见问题 */}
        <div>
          <h2 className="mb-3 text-lg font-medium text-text-primary">
            常见问题
          </h2>
          <div
            className="p-3 mb-3 transition-all cursor-pointer bg-gray-50 rounded-card shadow-card hover:bg-gray-100"
            onClick={() => navigateToChatWithQuestion('宝宝发烧了怎么办？')}
          >
            <div className="text-base text-text-primary">
              宝宝发烧了怎么办？
            </div>
          </div>
          <div
            className="p-3 mb-3 transition-all cursor-pointer bg-gray-50 rounded-card shadow-card hover:bg-gray-100"
            onClick={() =>
              navigateToChatWithQuestion('如何判断宝宝是否缺乏营养？')
            }
          >
            <div className="text-base text-text-primary">
              如何判断宝宝是否缺乏营养？
            </div>
          </div>
          <div
            className="p-3 mb-3 transition-all cursor-pointer bg-gray-50 rounded-card shadow-card hover:bg-gray-100"
            onClick={() => navigateToChatWithQuestion('宝宝哭闹不停怎么安抚？')}
          >
            <div className="text-base text-text-primary">
              宝宝哭闹不停怎么安抚？
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
