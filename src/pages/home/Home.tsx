import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, Button } from '@/components/ui';
import { Icon } from '@iconify/react';
import {
  SleepRecord,
  FeedingRecord,
  DiaperRecord,
  NoteRecord,
  GrowthRecord,
} from '@/components/record';
import { getRecordsByChildId } from '@/api/records';
import { useChildrenStore } from '@/stores/children';
import { useAppContext } from '@/contexts/useAppContext';
import {
  SleepDetails,
  FeedingDetails,
  DiaperDetails,
  NoteDetails,
  GrowthDetails,
  FeedingType,
} from '@/types/models';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [hasRecords, setHasRecords] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 从AppContext获取应用状态
  const { isAuthenticated, hasChildren, isLoading, refreshUserData } =
    useAppContext();

  // 从全局状态获取儿童信息
  const { children, currentChild } = useChildrenStore();

  // 最近记录状态
  const [recentRecords, setRecentRecords] = useState<
    Array<{
      id: number;
      type: 'sleep' | 'feeding' | 'diaper' | 'note' | 'growth';
      time: string;
      date: string;
      title: string;
      details: string;
      icon: string;
      color: string;
    }>
  >([]);

  // 记录弹窗状态
  const [activeModal, setActiveModal] = useState<
    'sleep' | 'feeding' | 'diaper' | 'note' | 'growth' | null
  >(null);

  // 处理没有儿童的情况，引导用户创建儿童
  useEffect(() => {
    if (isAuthenticated && !hasChildren && !isLoading) {
      // 如果用户已登录但没有儿童，引导到添加儿童页面
      navigate('/children/add');
    }
  }, [isAuthenticated, hasChildren, isLoading, navigate]);

  // 获取最近记录数据
  useEffect(() => {
    if (currentChild) {
      fetchRecordList();
    }
  }, [currentChild]); // 依赖于currentChild而不是currentChildId

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  // 获取友好的时间问候
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return '夜深了';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  };

  // 计算儿童年龄
  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // 调整月份和天数
    if (days < 0) {
      months--;
      // 获取上个月的天数
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // 根据年龄返回不同的格式
    if (years > 0) {
      return `${years}岁${months > 0 ? `${months}个月` : ''}`;
    } else if (months > 0) {
      return `${months}个月${days > 0 ? `${days}天` : ''}`;
    } else {
      return `${days}天`;
    }
  };

  // 导航到聊天页面
  const navigateToChat = () => {
    navigate('/chat');
  };

  // 打开记录弹窗
  const openRecordModal = (
    type: 'sleep' | 'feeding' | 'diaper' | 'note' | 'growth',
  ) => {
    setActiveModal(type);
  };

  // 关闭记录弹窗
  const closeRecordModal = () => {
    setActiveModal(null);
  };

  // 添加记录成功回调 - 刷新用户数据并重新获取最新记录
  const handleRecordSuccess = async () => {
    // 刷新儿童数据
    await refreshUserData();
    // 获取最新记录
    await fetchRecordList();
  };

  // 记录成功回调 - 重新获取最新数据
  const fetchRecordList = async () => {
    if (!currentChild) return;

    try {
      // 重新获取最新记录数据
      const response = await getRecordsByChildId(currentChild.id);

      // 将API返回的数据转换为前端需要的格式
      const formattedRecords = response.slice(0, 5).map((record) => {
        // 根据记录类型设置图标和颜色
        const recordType = record.recordType.toLowerCase() as
          | 'sleep'
          | 'feeding'
          | 'diaper'
          | 'note'
          | 'growth';

        // 格式化时间
        const recordDate = new Date(record.recordTimestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 判断是今天、昨天还是其他日期
        let dateText = '';
        if (recordDate.toDateString() === today.toDateString()) {
          dateText = '今天';
        } else if (recordDate.toDateString() === yesterday.toDateString()) {
          dateText = '昨天';
        } else {
          dateText = `${recordDate.getMonth() + 1}月${recordDate.getDate()}日`;
        }

        // 根据记录类型生成标题和详情
        let title = '';
        let details = '';
        let icon = '';
        let color = '';
        // 预先声明类型变量，避免在 switch case 中声明
        let sleepDetails: SleepDetails;
        let feedingDetails: FeedingDetails;
        let diaperDetails: DiaperDetails;
        let noteDetails: NoteDetails;
        let growthDetails: GrowthDetails;

        switch (recordType) {
          case 'sleep':
            sleepDetails = record.details as SleepDetails;
            title = '睡眠记录';
            details = sleepDetails.sleepDuration
              ? `睡眠时长: ${sleepDetails.sleepDuration}${
                  sleepDetails.quality
                    ? ` 质量: ${
                        sleepDetails.quality === 1
                          ? '较差'
                          : sleepDetails.quality === 3
                          ? '一般'
                          : sleepDetails.quality === 5
                          ? '良好'
                          : sleepDetails.quality
                      }`
                    : ''
                }`
              : '睡眠记录';
            if (sleepDetails.notes) {
              details += ` - ${sleepDetails.notes}`;
            }
            icon = 'mdi:sleep';
            color = '#7986CB';
            break;
          case 'feeding':
            feedingDetails = record.details as FeedingDetails;
            title = '喂养记录';
            details = feedingDetails.amount
              ? `${feedingDetails.amount}${feedingDetails.unit || 'ml'} ${
                  feedingDetails.feedingType === FeedingType.MILK
                    ? '奶'
                    : feedingDetails.feedingType === FeedingType.COMPLEMENTARY
                    ? '辅食'
                    : feedingDetails.feedingType === FeedingType.MEAL
                    ? '正餐'
                    : ''
                }`
              : '喂养记录';
            if (feedingDetails.notes) {
              details += ` - ${feedingDetails.notes}`;
            }
            icon = 'mdi:food-apple';
            color = '#FF9F73';
            break;
          case 'diaper':
            diaperDetails = record.details as DiaperDetails;
            title = '尿布记录';
            details =
              diaperDetails.hasUrine && diaperDetails.hasStool
                ? '尿湿+便便'
                : diaperDetails.hasUrine
                ? '尿湿'
                : diaperDetails.hasStool
                ? '便便'
                : '尿布记录';
            if (diaperDetails.stoolColor || diaperDetails.stoolConsistency) {
              details += ` - ${diaperDetails.stoolColor || ''}${
                diaperDetails.stoolConsistency
                  ? ` ${diaperDetails.stoolConsistency}`
                  : ''
              }`;
            }
            if (diaperDetails.notes) {
              details += ` - ${diaperDetails.notes}`;
            }
            icon = 'mdi:baby-face-outline';
            color = '#8D6E63';
            break;
          case 'note':
            noteDetails = record.details as NoteDetails;
            title = '随手记';
            details = noteDetails.content || '随手记';
            if (noteDetails.tags && noteDetails.tags.length > 0) {
              details += ` - 标签: ${noteDetails.tags.join(', ')}`;
            }
            icon = 'mdi:note-text-outline';
            color = '#FFD040';
            break;
          case 'growth':
            growthDetails = record.details as GrowthDetails;
            title = '成长记录';
            details = '';

            // 添加身高信息（如果有）
            if (growthDetails.height !== undefined) {
              details += `身高: ${growthDetails.height}厘米`;
            }

            // 添加体重信息（如果有）
            if (growthDetails.weight !== undefined) {
              details += details ? ' | ' : '';
              details += `体重: ${growthDetails.weight}千克`;
            }

            // 添加头围信息（如果有）
            if (growthDetails.headCircumference !== undefined) {
              details += details ? ' | ' : '';
              details += `头围: ${growthDetails.headCircumference}厘米`;
            }

            // 如果没有任何测量数据，显示默认文本
            if (!details) {
              details = '成长记录';
            }

            // 添加备注（如果有）
            if (growthDetails.notes) {
              details += ` - ${growthDetails.notes}`;
            }

            icon = 'mdi:chart-line';
            color = '#81C784';
            break;
        }

        return {
          id: record.id,
          type: recordType,
          time: recordDate.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          date: dateText,
          title,
          details,
          icon,
          color,
        };
      });

      setRecentRecords(formattedRecords);
      setHasRecords(formattedRecords.length > 0);
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  };

  // 记录类型配置 - 使用设计规范中的语义色彩
  const recordTypes = [
    {
      id: 'sleep',
      name: '睡眠',
      icon: 'mdi:sleep',
      bgColor: 'bg-[#EEF0FB]',
      iconColor: 'text-[#7986CB]',
      borderColor: 'border-[#7986CB]/10',
      hoverBgColor: 'bg-[#DFE3F5]',
      description: '记录宝宝的睡眠时间和质量',
    },
    {
      id: 'feeding',
      name: '喂养',
      icon: 'mdi:food-apple',
      bgColor: 'bg-[#FFF4EE]',
      iconColor: 'text-[#FF9F73]',
      borderColor: 'border-[#FF9F73]/10',
      hoverBgColor: 'bg-[#FFE9DE]',
      description: '记录宝宝的喂养情况和食量',
    },
    {
      id: 'diaper',
      name: '尿布',
      icon: 'mdi:baby-face-outline',
      bgColor: 'bg-[#F5F0EE]',
      iconColor: 'text-[#8D6E63]',
      borderColor: 'border-[#8D6E63]/10',
      hoverBgColor: 'bg-[#EBE5E2]',
      description: '记录宝宝的排泄情况和频率',
    },
    {
      id: 'growth',
      name: '成长',
      icon: 'mdi:chart-line',
      bgColor: 'bg-[#F0F8F0]',
      iconColor: 'text-[#81C784]',
      borderColor: 'border-[#81C784]/10',
      hoverBgColor: 'bg-[#E3F1E3]',
      description: '记录宝宝的身高、体重和头围',
    },
    {
      id: 'note',
      name: '随手记',
      icon: 'mdi:note-text-outline',
      bgColor: 'bg-[#FFFAED]',
      iconColor: 'text-[#FFD040]',
      borderColor: 'border-[#FFD040]/10',
      hoverBgColor: 'bg-[#FFF5DB]',
      description: '记录宝宝的成长点滴和特殊事件',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF8]">
      {/* <NavBar title="日常记录" /> */}

      <div className="overflow-auto flex-1">
        {/* 顶部欢迎区 - 使用温暖渐变背景 */}
        <div className="relative px-5 pt-4 pb-4 bg-gradient-to-br from-white to-[#FFF8F4] overflow-hidden">
          {/* 背景装饰元素 */}
          <div className="absolute top-0 right-0 opacity-5 transform translate-x-1/4 -translate-y-1/4">
            <Icon
              icon="mdi:baby-face-outline"
              className="text-[200px] text-[#FFB38A]"
            />
          </div>

          {/* 顶部区域：左侧问候，右侧儿童信息 */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-2xl font-semibold text-[#333333]">
                <span className="text-[#FF9F73]">{getGreeting()}</span>
              </h1>
              <p className="text-base text-[#666666]">
                今天是{' '}
                <span className="font-medium">
                  {currentTime.toLocaleDateString('zh-CN', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                ，{currentTime.toLocaleDateString('zh-CN', { weekday: 'long' })}
              </p>
            </div>

            {/* 儿童信息展示 - 右侧紧凑版 */}
            {currentChild ? (
              <div
                className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-[#FFB38A]/20 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate('/children')}
              >
                <div className="flex flex-col items-end">
                  <div className="flex items-center justify-end mb-0.5">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-[#FFB38A]/20 to-[#FFD040]/20 mr-1">
                      <Icon
                        icon={
                          currentChild.gender === 'male'
                            ? 'mdi:gender-male'
                            : 'mdi:gender-female'
                        }
                        className={`text-[10px] ${
                          currentChild.gender === 'male'
                            ? 'text-blue-500'
                            : 'text-pink-500'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#333333]">
                      {currentChild.nickname}
                    </span>
                  </div>
                  <div className="text-xs bg-gradient-to-r from-[#FFB38A] to-[#FFD040] bg-clip-text text-transparent font-medium">
                    {calculateAge(currentChild.dateOfBirth)}
                  </div>
                </div>
              </div>
            ) : children.length > 0 ? (
              <div className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-[#FFB38A]/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                <Button variant="text" onClick={() => navigate('/children')}>
                  选择儿童
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-5 pt-2 pb-4">
          {/* 最近记录展示 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center text-lg font-semibold text-[#333333]">
                <Icon icon="mdi:history" className="mr-2 text-[#FFB38A]" />
                最近记录
                {hasRecords && (
                  <span className="ml-2 text-sm font-normal text-[#999999]">
                    {recentRecords.length} 项内容
                  </span>
                )}
              </h2>

              {/* 查看更多按钮 */}
              {hasRecords && (
                <div
                  className="flex items-center text-[#FF9F73] cursor-pointer group"
                  onClick={() => navigate('/records')}
                >
                  <span className="mr-1 text-sm">查看更多</span>
                  <Icon
                    icon="mdi:chevron-right"
                    className="text-sm transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              )}
            </div>

            {hasRecords ? (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex items-start">
                      {/* 记录类型图标 */}
                      <div
                        className="flex flex-shrink-0 justify-center items-center mr-3 w-10 h-10 rounded-full"
                        style={{ backgroundColor: `${record.color}20` }}
                      >
                        <Icon
                          icon={record.icon}
                          className="text-xl"
                          style={{ color: record.color }}
                        />
                      </div>

                      {/* 记录内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-[#333333] font-medium truncate mr-2">
                            {record.title}
                          </div>
                          <div className="flex items-center text-xs text-[#999999] whitespace-nowrap">
                            <span className="mr-1">{record.date}</span>
                            <span>{record.time}</span>
                          </div>
                        </div>
                        <div className="text-sm text-[#666666]">
                          {record.details}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 查看更多卡片 */}
                <div
                  className="p-4 bg-white rounded-xl border border-dashed border-[#FFB38A] flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[#FFF8F4]"
                  onClick={() => navigate('/records')}
                >
                  <Icon icon="mdi:plus" className="mr-2 text-[#FFB38A]" />
                  <span className="text-[#FF9F73]">查看全部记录</span>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#F0F0F0]">
                <EmptyState
                  title="暂无记录"
                  description="开始记录宝宝的日常活动吧"
                  iconType="empty"
                  iconName="mdi:notebook-outline"
                  iconColor="#FFB38A"
                />
              </div>
            )}
          </div>

          {/* 快捷记录区 - 优化UX设计 */}
          <div className="mb-8">
            <h2 className="flex items-center justify-between mb-4">
              <div className="flex items-center text-lg font-semibold text-[#333333]">
                <Icon
                  icon="mdi:lightning-bolt"
                  className="mr-2 text-[#FFB38A]"
                />
                快捷记录
              </div>
            </h2>

            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0F0F0] overflow-hidden">
              {/* 水平滑动卡片设计 */}
              <div className="flex overflow-x-auto py-4 px-4 hide-scrollbar">
                {recordTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex-shrink-0 mr-3 last:mr-0 cursor-pointer"
                    onClick={() => openRecordModal(type.id as any)}
                  >
                    {/* 精简卡片设计 */}
                    <div
                      className={`flex flex-col items-center px-3 py-3 ${type.bgColor} rounded-xl border ${type.borderColor} transition-all duration-200 hover:${type.hoverBgColor} hover:shadow-sm min-w-[64px]`}
                    >
                      {/* 图标 */}
                      <div className="flex items-center justify-center w-8 h-8 mb-1">
                        <Icon
                          icon={type.icon}
                          className={`text-xl ${type.iconColor}`}
                        />
                      </div>

                      {/* 文字 */}
                      <span
                        className={`text-xs font-medium ${type.iconColor} text-center`}
                      >
                        {type.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 添加全局类来隐藏滑动条 */}
            </div>
          </div>

          {/* AI 助手入口 */}
          <div>
            <h2 className="flex items-center mb-4 text-lg font-semibold text-[#333333]">
              <Icon icon="mdi:robot" className="mr-2 text-[#FFB38A]" />
              咨询萌芽
            </h2>
            <div
              className="flex items-center p-5 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#F0F0F0] transition-all duration-300 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] relative overflow-hidden"
              onClick={navigateToChat}
            >
              {/* 背景装饰 */}
              <div className="absolute right-0 bottom-0 opacity-5">
                <Icon
                  icon="mdi:robot"
                  className="text-[120px] text-[#FFB38A]"
                />
              </div>

              <div className="flex justify-center items-center mr-5 w-14 h-14 bg-gradient-to-br rounded-full shadow-[0_4px_10px_rgba(255,179,138,0.3)] from-[#FFB38A] to-[#FFC9A8] z-10">
                <Icon
                  icon="mdi:robot-excited"
                  className="text-2xl text-white"
                />
              </div>
              <div className="z-10 flex-1">
                <div className="mb-1 text-lg font-medium text-[#333333]">
                  萌芽助手
                </div>
                <div className="text-base text-[#666666]">AI加持，专业建议</div>
              </div>
              <div className="flex items-center text-[#FFB38A] z-10 group">
                <span className="mr-1 transition-all duration-300 group-hover:mr-2">
                  咨询
                </span>
                <Icon
                  icon="mdi:chevron-right"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 底部安全区域 - 确保内容不被底部导航遮挡 */}
        <div className="safe-bottom"></div>
      </div>

      {/* 记录弹窗组件 - 使用isOpen属性控制显示 */}
      {currentChild && (
        <>
          <SleepRecord
            isOpen={activeModal === 'sleep'}
            childId={currentChild.id}
            onClose={closeRecordModal}
            onSuccess={handleRecordSuccess}
          />
          <FeedingRecord
            isOpen={activeModal === 'feeding'}
            childId={currentChild.id}
            onClose={closeRecordModal}
            onSuccess={handleRecordSuccess}
          />
          <DiaperRecord
            isOpen={activeModal === 'diaper'}
            childId={currentChild.id}
            onClose={closeRecordModal}
            onSuccess={handleRecordSuccess}
          />
          <GrowthRecord
            isOpen={activeModal === 'growth'}
            childId={currentChild.id}
            onClose={closeRecordModal}
            onSuccess={handleRecordSuccess}
          />
          <NoteRecord
            isOpen={activeModal === 'note'}
            childId={currentChild.id}
            onClose={closeRecordModal}
            onSuccess={handleRecordSuccess}
          />
        </>
      )}
    </div>
  );
};

export default Home;
