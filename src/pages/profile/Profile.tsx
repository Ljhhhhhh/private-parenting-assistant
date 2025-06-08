import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button, NavBar, Toast, DonationModal } from '@/components/ui';
import { useUserStore, useChildrenStore } from '@/stores';
import { calculateAge } from '@/utils';
import logoImage from '@/assets/logo.png';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { children, currentChild, setCurrentChild } = useChildrenStore();
  const [toast, setToast] = useState<{
    type: 'success' | 'fail' | 'loading' | 'info';
    content: string;
  } | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // 应用信息
  const appInfo = {
    name: '萌芽育儿',
    version: '1.0.0',
    author: '观默',
    description: '专业的育儿记录与智能咨询应用',
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  const navigateToChildren = () => {
    navigate('/children');
  };

  const navigateToPrivacyPolicy = () => {
    navigate('/privacy-policy');
  };

  const handleSelectChild = (child: any) => {
    setCurrentChild(child);
    setToast({ type: 'success', content: `已选择 ${child.nickname}` });
  };

  const handleEditChild = (childId: string | number) => {
    navigate(`/children/edit/${childId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FDFBF8] to-[#FFF8F4]">
      <NavBar title="个人中心" onBack={() => navigate('/')} />

      <div className="overflow-auto flex-1">
        <div className="px-4 pt-6 pb-8">
          {/* 用户信息卡片 - 重新设计为更有温暖感的卡片 */}
          <div className="mb-8">
            <div className="relative p-6 bg-gradient-to-br from-white via-[#FFF8F4] to-[#FFEFEB] rounded-3xl shadow-[0_8px_32px_rgba(255,179,138,0.12)] border border-[#FFE8D6] overflow-hidden backdrop-blur-sm">
              {/* 背景装饰元素 */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#FFB38A]/20 to-[#FFC9A8]/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-[#F8BBD0]/15 to-[#FAD1E0]/10 rounded-full blur-xl"></div>

              {/* 装饰图标 */}
              <div className="absolute top-4 right-4 opacity-10">
                <Icon icon="mdi:heart" className="text-3xl text-[#FFB38A]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center">
                  <div className="flex justify-center items-center mr-5 w-12 h-12 bg-[#FFB38A] rounded-full">
                    <Icon
                      icon="material-symbols:account-circle"
                      className="text-4xl text-white w-12 h-12"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-xl font-semibold text-[#333333] tracking-wide">
                      {user?.email || '未登录用户'}
                    </div>
                    <div className="flex items-center text-sm text-[#999999]">
                      <Icon
                        icon="mdi:identifier"
                        className="size-6 mr-1 text-[#FFB38A]"
                      />
                      {user?.id || '未知'}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 bg-[#66BB6A] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#66BB6A] font-medium">
                      在线
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 儿童列表 - 简洁优雅的重新设计 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center text-lg font-semibold text-[#333333]">
                <Icon icon="mdi:baby-face" className="mr-2 text-[#FFB38A]" />
                我的宝宝
                {children.length > 0 && (
                  <span className="ml-2 text-sm text-[#FFB38A] font-medium">
                    {children.length}
                  </span>
                )}
              </h2>
              <div
                className="flex items-center text-[#FF9F73] cursor-pointer group"
                onClick={navigateToChildren}
              >
                <span className="mr-1 text-sm font-medium">管理</span>
                <Icon
                  icon="mdi:chevron-right"
                  className="text-sm transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </div>

            <div className="space-y-3">
              {children.length > 0 ? (
                children.map((child) => (
                  <div
                    key={child.id}
                    className={`relative bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-md cursor-pointer ${
                      currentChild?.id === child.id
                        ? 'border-[#FFB38A] bg-gradient-to-r from-[#FFB38A]/5 to-transparent'
                        : 'border-[#E0E0E0] hover:border-[#FFB38A]/30'
                    }`}
                    onClick={() => handleSelectChild(child)}
                  >
                    {/* 选中指示器 */}
                    {currentChild?.id === child.id && (
                      <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#FFB38A] rounded-r-full"></div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* 简化的头像设计 */}
                        <div
                          className={`relative flex items-center justify-center w-10 h-10 text-base font-semibold rounded-xl ${
                            child.gender === 'male'
                              ? 'bg-[#FFDA63]/20 text-[#FFDA63]'
                              : child.gender === 'female'
                              ? 'bg-[#F8BBD0]/20 text-[#E091B1]'
                              : 'bg-[#FFB38A]/20 text-[#FF9F73]'
                          }`}
                        >
                          {child.nickname?.[0] || '宝'}
                          {/* 性别小标识 */}
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${
                              child.gender === 'male'
                                ? 'bg-[#FFDA63]'
                                : 'bg-[#F8BBD0]'
                            }`}
                          >
                            <Icon
                              icon={
                                child.gender === 'male'
                                  ? 'mdi:human-male'
                                  : 'mdi:human-female'
                              }
                              className="text-[10px] text-white absolute inset-0 m-auto"
                            />
                          </div>
                        </div>

                        {/* 简化的信息布局 */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-medium text-[#333333]">
                              {child.nickname}
                            </span>
                          </div>
                          <div className="text-sm text-[#666666]">
                            {calculateAge(child.dateOfBirth)}
                          </div>
                        </div>
                      </div>

                      {/* 简化的操作区域 */}
                      <div className="flex items-center gap-2">
                        {currentChild?.id === child.id && (
                          <Icon
                            icon="mdi:check-circle"
                            className="text-[#FFB38A] text-lg size-6"
                          />
                        )}
                        <button
                          className="p-2 text-[#FFB38A] hover:bg-[#FFB38A]/10 rounded-lg transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditChild(child.id);
                          }}
                        >
                          <Icon icon="mdi:pencil" className="size-6 text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-[#E0E0E0] p-8 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex justify-center items-center w-12 h-12 bg-[#FFB38A]/10 rounded-xl">
                      <Icon
                        icon="mdi:baby-face-outline"
                        className="text-2xl text-[#FFB38A]/60"
                      />
                    </div>
                  </div>
                  <div className="mb-1 text-base text-[#666666]">
                    还没有添加宝宝信息
                  </div>
                  <div className="mb-4 text-sm text-[#999999]">
                    添加第一个宝宝，开始记录成长点滴
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/children/add')}
                    className="px-4 py-2 bg-[#FFB38A] hover:bg-[#FF9F73] text-white rounded-lg text-sm font-medium"
                  >
                    <Icon icon="mdi:plus" className="mr-1" />
                    添加宝宝
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 应用信息 - 更现代化的设计 */}
          <div className="mb-8">
            <h2 className="flex items-center mb-6 text-xl font-semibold text-[#333333]">
              <div className="flex justify-center items-center mr-3 w-8 h-8 bg-gradient-to-br from-[#56C0E0] to-[#7AADEE] rounded-lg">
                <Icon icon="mdi:information" className="text-lg text-white" />
              </div>
              关于应用
            </h2>

            <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="flex justify-center items-center mr-5 w-16 h-16 bg-gradient-to-br from-[#FFB38A] to-[#FFC9A8] rounded-3xl shadow-[0_6px_20px_rgba(255,179,138,0.3)]">
                    <img
                      src={logoImage}
                      alt="萌芽育儿 Logo"
                      className="object-cover w-full h-full rounded-3xl"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-xl font-semibold text-[#333333]">
                      {appInfo.name}
                    </div>
                    <div className="text-sm text-[#666666] leading-relaxed">
                      {appInfo.description}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-[#F0F0F0]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Icon icon="mdi:tag" className="mr-2 text-[#FFB38A]" />
                      <span className="text-sm text-[#666666]">版本号</span>
                    </div>
                    <span className="text-sm font-semibold text-[#333333] px-3 py-1 bg-[#FFB38A]/10 rounded-full">
                      v{appInfo.version}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Icon
                        icon="mdi:account-circle"
                        className="mr-2 text-[#FFB38A]"
                      />
                      <span className="text-sm text-[#666666]">开发者</span>
                    </div>
                    <span className="text-sm font-semibold text-[#333333]">
                      {appInfo.author}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 设置和其他选项 - 更友好的交互设计 */}
          <div className="mb-8">
            <h2 className="flex items-center mb-6 text-xl font-semibold text-[#333333]">
              <div className="flex justify-center items-center mr-3 w-8 h-8 bg-gradient-to-br from-[#66BB6A] to-[#81C784] rounded-lg">
                <Icon icon="mdi:cog" className="text-lg text-white" />
              </div>
              设置与帮助
            </h2>

            <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0] overflow-hidden">
              <div
                className="flex items-center justify-between p-5 transition-all duration-200 hover:bg-[#FFF8F4] cursor-pointer border-b border-[#F0F0F0] group"
                onClick={() => setShowDonationModal(true)}
              >
                <div className="flex items-center">
                  <div className="flex justify-center items-center mr-4 w-10 h-10 bg-[#FFB38A]/10 rounded-xl group-hover:bg-[#FFB38A]/20 transition-colors duration-200">
                    <Icon
                      icon="mdi:coffee"
                      className="text-xl text-[#FFB38A]"
                    />
                  </div>
                  <div>
                    <span className="text-base font-medium text-[#333333]">
                      支持开发者
                    </span>
                    <div className="text-xs text-[#999999] mt-1">
                      请我喝杯咖啡
                    </div>
                  </div>
                </div>
                <Icon
                  icon="mdi:chevron-right"
                  className="text-[#CCCCCC] group-hover:text-[#FFB38A] transition-colors duration-200"
                />
              </div>

              <div
                className="flex items-center justify-between p-5 transition-all duration-200 hover:bg-[#FFF8F4] cursor-pointer border-b border-[#F0F0F0] group"
                onClick={() =>
                  navigate('/feedback', { state: { from: '/profile' } })
                }
              >
                <div className="flex items-center">
                  <div className="flex justify-center items-center mr-4 w-10 h-10 bg-[#56C0E0]/10 rounded-xl group-hover:bg-[#56C0E0]/20 transition-colors duration-200">
                    <Icon icon="mdi:email" className="text-xl text-[#56C0E0]" />
                  </div>
                  <div>
                    <span className="text-base font-medium text-[#333333]">
                      建议与反馈
                    </span>
                    <div className="text-xs text-[#999999] mt-1">
                      帮助我们改进
                    </div>
                  </div>
                </div>
                <Icon
                  icon="mdi:chevron-right"
                  className="text-[#CCCCCC] group-hover:text-[#56C0E0] transition-colors duration-200"
                />
              </div>

              <div
                className="flex items-center justify-between p-5 transition-all duration-200 hover:bg-[#FFF8F4] cursor-pointer border-b border-[#F0F0F0] group"
                onClick={navigateToPrivacyPolicy}
              >
                <div className="flex items-center">
                  <div className="flex justify-center items-center mr-4 w-10 h-10 bg-[#66BB6A]/10 rounded-xl group-hover:bg-[#66BB6A]/20 transition-colors duration-200">
                    <Icon
                      icon="mdi:shield-check"
                      className="text-xl text-[#66BB6A]"
                    />
                  </div>
                  <div>
                    <span className="text-base font-medium text-[#333333]">
                      隐私政策
                    </span>
                    <div className="text-xs text-[#999999] mt-1">
                      保护您的隐私
                    </div>
                  </div>
                </div>
                <Icon
                  icon="mdi:chevron-right"
                  className="text-[#CCCCCC] group-hover:text-[#66BB6A] transition-colors duration-200"
                />
              </div>

              <div
                className="flex items-center justify-between p-5 transition-all duration-200 hover:bg-[#FFF8F4] cursor-pointer group"
                onClick={() =>
                  navigate('/user-agreement', { state: { from: '/profile' } })
                }
              >
                <div className="flex items-center">
                  <div className="flex justify-center items-center mr-4 w-10 h-10 bg-[#FFA726]/10 rounded-xl group-hover:bg-[#FFA726]/20 transition-colors duration-200">
                    <Icon
                      icon="mdi:file-document"
                      className="text-xl text-[#FFA726]"
                    />
                  </div>
                  <div>
                    <span className="text-base font-medium text-[#333333]">
                      用户协议
                    </span>
                    <div className="text-xs text-[#999999] mt-1">使用条款</div>
                  </div>
                </div>
                <Icon
                  icon="mdi:chevron-right"
                  className="text-[#CCCCCC] group-hover:text-[#FFA726] transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          {/* 退出登录 - 更温和的警告设计 */}
          <div className="mt-8">
            <Button
              variant="secondary"
              className="w-full py-4 text-base font-medium text-[#EF5350] border-[#EF5350]/20 hover:bg-[#EF5350]/5 rounded-2xl transition-all duration-300 hover:shadow-[0_4px_12px_rgba(239,83,80,0.15)]"
              onClick={handleLogout}
            >
              <Icon icon="mdi:logout" className="mr-2" />
              退出登录
            </Button>
          </div>
        </div>

        {/* 底部安全区域 */}
        <div className="safe-bottom"></div>
      </div>

      {/* 渲染Toast */}
      {toast && (
        <Toast
          type={toast.type}
          content={toast.content}
          onClose={() => setToast(null)}
        />
      )}

      {/* 渲染打赏弹窗 */}
      <DonationModal
        visible={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />
    </div>
  );
};

export default Profile;
