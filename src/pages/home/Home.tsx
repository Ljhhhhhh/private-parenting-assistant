import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui';
import { Icon } from '@iconify/react';
import {
  SleepRecord,
  FeedingRecord,
  DiaperRecord,
  NoteRecord,
} from '@/components/record';
import { getRecordsByChildId } from '@/api/records';
import { getChildById } from '@/api/children';
import {
  ChildResponseDto,
  SleepDetails,
  FeedingDetails,
  DiaperDetails,
  NoteDetails,
  FeedingType,
} from '@/types/models';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [hasRecords, setHasRecords] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 最近记录状态
  const [recentRecords, setRecentRecords] = useState<
    Array<{
      id: number;
      type: 'sleep' | 'feeding' | 'diaper' | 'note';
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
    'sleep' | 'feeding' | 'diaper' | 'note' | null
  >(null);

  // 当前选中的儿童ID（实际项目中应该从状态管理或API获取）
  const [currentChildId] = useState<number>(1); // 假设默认选中第一个孩子
  // 当前儿童信息
  const [currentChild, setCurrentChild] = useState<ChildResponseDto | null>(
    null,
  );

  // 获取当前儿童信息
  useEffect(() => {
    const fetchChildInfo = async () => {
      try {
        const childData = await getChildById(currentChildId);
        setCurrentChild(childData);
      } catch (error) {
        console.error('获取儿童信息失败:', error);
      }
    };

    fetchChildInfo();
  }, [currentChildId]);

  // 获取最近记录数据
  useEffect(() => {
    fetchRecordList();
  }, [currentChildId]);

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
  const openRecordModal = (type: 'sleep' | 'feeding' | 'diaper' | 'note') => {
    setActiveModal(type);
  };

  // 关闭记录弹窗
  const closeRecordModal = () => {
    setActiveModal(null);
  };

  // 记录成功回调 - 重新获取最新数据
  const fetchRecordList = async () => {
    try {
      // 重新获取最新记录数据
      const response = await getRecordsByChildId(currentChildId);

      // 将API返回的数据转换为前端需要的格式
      const formattedRecords = response.slice(0, 5).map((record) => {
        // 根据记录类型设置图标和颜色
        const recordType = record.recordType.toLowerCase() as
          | 'sleep'
          | 'feeding'
          | 'diaper'
          | 'note';

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
        // TODO: 根据记录类型 @model RecordDetails 生成

        switch (recordType) {
          case 'sleep':
            title = record.details.title || '睡眠记录';
            details = record.details.duration
              ? `睡眠时长: ${Math.floor(record.details.duration / 60)}小时${
                  record.details.duration % 60
                }分钟`
              : '睡眠记录';
            icon = 'mdi:sleep';
            color = '#7986CB';
            break;
          case 'feeding':
            title = record.details.title || '喂养记录';
            details = record.details.amount
              ? `${record.details.amount}${record.details.unit || 'ml'} ${
                  record.details.foodType || ''
                }`
              : '喂养记录';
            icon = 'mdi:food-apple';
            color = '#FF9F73';
            break;
          case 'diaper':
            title = record.details.title || '尿布记录';
            details = record.details.diaperType
              ? record.details.diaperType === 'wet'
                ? '尿湿'
                : record.details.diaperType === 'dirty'
                ? '便便'
                : '混合'
              : '尿布记录';
            icon = 'mdi:baby-face-outline';
            color = '#8D6E63';
            break;
          case 'note':
            title = record.details.title || '笔记记录';
            details = record.details.content || '笔记记录';
            icon = 'mdi:note-text-outline';
            color = '#FFD040';
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
      color: 'bg-[#C5CAE9]/30', // 睡眠记录 - 柔和薰衣草紫
      textColor: 'text-[#7986CB]',
      borderColor: 'border-[#C5CAE9]',
      description: '记录宝宝的睡眠时间和质量',
    },
    {
      id: 'feeding',
      name: '喂养',
      icon: 'mdi:food-apple',
      color: 'bg-[#FFC9A8]/30', // 喂养记录 - 浅蜜桃色
      textColor: 'text-[#FF9F73]',
      borderColor: 'border-[#FFC9A8]',
      description: '记录宝宝的喂养情况和食量',
    },
    {
      id: 'diaper',
      name: '尿布',
      icon: 'mdi:baby-face-outline',
      color: 'bg-[#BCAAA4]/30', // 排便记录 - 柔和棕
      textColor: 'text-[#8D6E63]',
      borderColor: 'border-[#BCAAA4]',
      description: '记录宝宝的排泄情况和频率',
    },
    {
      id: 'notes',
      name: '笔记',
      icon: 'mdi:note-text-outline',
      color: 'bg-[#FFE58C]/30', // 照片记录 - 浅活力黄
      textColor: 'text-[#FFD040]',
      borderColor: 'border-[#FFE58C]',
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
            {currentChild && (
              <div className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-[#FFB38A]/20 shadow-sm hover:shadow-md transition-shadow duration-300">
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
            )}
          </div>
        </div>

        <div className="px-5 pt-2 pb-4">
          {/* 最近记录展示 */}
          <div className="mb-8">
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

          {/* 快捷记录区 */}
          <div className="mb-8">
            <h2 className="flex items-center mb-5 text-lg font-semibold text-[#333333]">
              <Icon icon="mdi:lightning-bolt" className="mr-2 text-[#FFB38A]" />
              快捷记录
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {recordTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex flex-col items-center transition-all duration-300 cursor-pointer group"
                  onClick={() => openRecordModal(type.id as any)}
                >
                  <div
                    className={`flex items-center justify-center w-16 h-16 mb-3 rounded-full ${type.color} border ${type.borderColor} shadow-[0_4px_10px_rgba(0,0,0,0.03)] group-hover:shadow-[0_6px_14px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:scale-110`}
                  >
                    <Icon
                      icon={type.icon}
                      className={`text-2xl ${type.textColor} transition-transform duration-300 group-hover:scale-110`}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#333333] group-hover:text-[#FF9F73] transition-colors duration-300">
                    {type.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI 助手入口 */}
          <div>
            <h2 className="flex items-center mb-5 text-lg font-semibold text-[#333333]">
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

      {/* 记录弹窗组件 */}
      <SleepRecord
        isOpen={activeModal === 'sleep'}
        onClose={closeRecordModal}
        childId={currentChildId}
        onSuccess={fetchRecordList}
      />

      <FeedingRecord
        isOpen={activeModal === 'feeding'}
        onClose={closeRecordModal}
        childId={currentChildId}
        onSuccess={fetchRecordList}
      />

      <DiaperRecord
        isOpen={activeModal === 'diaper'}
        onClose={closeRecordModal}
        childId={currentChildId}
        onSuccess={fetchRecordList}
      />

      <NoteRecord
        isOpen={activeModal === 'note'}
        onClose={closeRecordModal}
        childId={currentChildId}
        onSuccess={fetchRecordList}
      />
    </div>
  );
};

export default Home;
