import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button, NavBar } from '@/components/ui';
import { useUserStore, useChildrenStore } from '@/stores';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { children } = useChildrenStore();

  // 应用信息
  const appInfo = {
    name: '萌芽育儿助手',
    version: '1.0.0',
    author: '萌芽团队',
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

  const calculateChildAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) {
      return `${years}岁${months > 0 ? `${months}个月` : ''}`;
    } else if (months > 0) {
      return `${months}个月${days > 0 ? `${days}天` : ''}`;
    } else {
      return `${days}天`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF8]">
      <NavBar title="个人中心" />

      <div className="overflow-auto flex-1">
        <div className="px-5 pt-4 pb-8">
          {/* 用户信息卡片 */}
          <div className="mb-6">
            <div className="relative p-6 bg-gradient-to-br from-white to-[#FFF8F4] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#F0F0F0] overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 opacity-5 transform translate-x-1/4 -translate-y-1/4">
                <Icon
                  icon="mdi:account-heart"
                  className="text-[150px] text-[#FFB38A]"
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="flex justify-center items-center mr-4 w-16 h-16 bg-gradient-to-br rounded-full shadow-[0_4px_10px_rgba(74,144,226,0.3)] from-[#4A90E2] to-[#7AADEE]">
                    <Icon icon="mdi:account" className="text-3xl text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-xl font-semibold text-[#333333]">
                      {user?.email || '未登录用户'}
                    </div>
                    <div className="text-sm text-[#666666]">
                      用户ID: {user?.id || '未知'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#F0F0F0]">
                  <div className="text-sm text-[#999999]">
                    账户状态：
                    <span className="ml-1 text-[#4CAF50] font-medium">
                      正常使用
                    </span>
                  </div>
                  <Button
                    variant="text"
                    className="text-[#4A90E2] hover:bg-[#4A90E2]/10"
                    onClick={() => navigate('/children')}
                  >
                    管理信息
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 儿童列表 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center text-lg font-semibold text-[#333333]">
                <Icon icon="mdi:baby-face" className="mr-2 text-[#FFB38A]" />
                我的宝宝
                {children.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-[#999999]">
                    {children.length} 个
                  </span>
                )}
              </h2>
              <div
                className="flex items-center text-[#FF9F73] cursor-pointer group"
                onClick={navigateToChildren}
              >
                <span className="mr-1 text-sm">管理</span>
                <Icon
                  icon="mdi:chevron-right"
                  className="text-sm transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] overflow-hidden">
              {children.length > 0 ? (
                <div className="space-y-0">
                  {children.map((child, index) => (
                    <div
                      key={child.id}
                      className={`flex items-center p-4 transition-colors duration-200 hover:bg-[#FFF8F4] ${
                        index !== children.length - 1
                          ? 'border-b border-[#F0F0F0]'
                          : ''
                      }`}
                    >
                      <div className="flex justify-center items-center mr-3 w-12 h-12 bg-gradient-to-br rounded-full from-[#FFB38A]/20 to-[#FFC9A8]/20">
                        <Icon
                          icon={
                            child.gender === 'male'
                              ? 'mdi:baby-face'
                              : 'mdi:baby-face-outline'
                          }
                          className={`text-xl ${
                            child.gender === 'male'
                              ? 'text-blue-500'
                              : 'text-pink-500'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-base font-medium text-[#333333] mr-2">
                            {child.nickname}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              child.gender === 'male'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-pink-100 text-pink-600'
                            }`}
                          >
                            {child.gender === 'male' ? '男宝' : '女宝'}
                          </span>
                        </div>
                        <div className="text-sm text-[#666666]">
                          {calculateChildAge(child.dateOfBirth)}
                        </div>
                      </div>
                      <Icon
                        icon="mdi:chevron-right"
                        className="text-[#CCCCCC] transition-colors duration-200 group-hover:text-[#999999]"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-3">
                    <Icon
                      icon="mdi:baby-face-outline"
                      className="text-4xl text-[#CCCCCC]"
                    />
                  </div>
                  <div className="mb-2 text-base text-[#666666]">
                    还没有添加宝宝信息
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/children/add')}
                    className="mt-3"
                  >
                    添加宝宝
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 应用信息 */}
          <div className="mb-6">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-[#333333]">
              <Icon icon="mdi:information" className="mr-2 text-[#FFB38A]" />
              关于应用
            </h2>

            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] overflow-hidden">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="flex justify-center items-center mr-4 w-14 h-14 bg-gradient-to-br rounded-2xl shadow-[0_4px_10px_rgba(255,179,138,0.3)] from-[#FFB38A] to-[#FFC9A8]">
                    <Icon
                      icon="mdi:baby-carriage"
                      className="text-2xl text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-lg font-semibold text-[#333333]">
                      {appInfo.name}
                    </div>
                    <div className="text-sm text-[#666666]">
                      {appInfo.description}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F0F0F0]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#666666]">版本号</span>
                    <span className="text-sm font-medium text-[#333333]">
                      v{appInfo.version}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#666666]">开发团队</span>
                    <span className="text-sm font-medium text-[#333333]">
                      {appInfo.author}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 设置和其他选项 */}
          <div className="mb-6">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-[#333333]">
              <Icon icon="mdi:cog" className="mr-2 text-[#FFB38A]" />
              设置与帮助
            </h2>

            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] overflow-hidden">
              <div
                className="flex items-center justify-between p-4 transition-colors duration-200 hover:bg-[#FFF8F4] cursor-pointer border-b border-[#F0F0F0]"
                onClick={navigateToPrivacyPolicy}
              >
                <div className="flex items-center">
                  <Icon
                    icon="mdi:shield-check"
                    className="mr-3 text-xl text-[#4A90E2]"
                  />
                  <span className="text-base text-[#333333]">隐私政策</span>
                </div>
                <Icon icon="mdi:chevron-right" className="text-[#CCCCCC]" />
              </div>

              <div
                className="flex items-center justify-between p-4 transition-colors duration-200 hover:bg-[#FFF8F4] cursor-pointer border-b border-[#F0F0F0]"
                onClick={() => console.log('用户协议')}
              >
                <div className="flex items-center">
                  <Icon
                    icon="mdi:file-document"
                    className="mr-3 text-xl text-[#4A90E2]"
                  />
                  <span className="text-base text-[#333333]">用户协议</span>
                </div>
                <Icon icon="mdi:chevron-right" className="text-[#CCCCCC]" />
              </div>

              <div
                className="flex items-center justify-between p-4 transition-colors duration-200 hover:bg-[#FFF8F4] cursor-pointer"
                onClick={() => console.log('联系我们')}
              >
                <div className="flex items-center">
                  <Icon
                    icon="mdi:email"
                    className="mr-3 text-xl text-[#4A90E2]"
                  />
                  <span className="text-base text-[#333333]">联系我们</span>
                </div>
                <Icon icon="mdi:chevron-right" className="text-[#CCCCCC]" />
              </div>
            </div>
          </div>

          {/* 退出登录 */}
          <div className="mt-8">
            <Button
              variant="secondary"
              className="w-full py-3 text-base font-medium text-[#FF5252] border-[#FF5252]/20 hover:bg-[#FF5252]/10"
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
    </div>
  );
};

export default Profile;
