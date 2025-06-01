import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import {
  EmptyState,
  NavBar,
  Button,
  useDialog,
  useToast,
} from '@/components/ui';
import { getRecordsByChildIdPaginated, deleteRecord } from '@/api/records';
import { useChildrenStore, useAppStore } from '@/stores';
import {
  RecordResponseDto,
  SleepDetails,
  FeedingDetails,
  DiaperDetails,
  NoteDetails,
  GrowthDetails,
  FeedingType,
  PaginationQueryDto,
} from '@/types/models';

// 格式化的记录类型
interface FormattedRecord {
  id: number;
  type: 'sleep' | 'feeding' | 'diaper' | 'note' | 'growth';
  time: string;
  date: string;
  fullDate: string;
  title: string;
  details: string;
  icon: string;
  color: string;
  rawData: RecordResponseDto;
}

// 筛选类型
type FilterType = 'all' | 'sleep' | 'feeding' | 'diaper' | 'note' | 'growth';

// 分页状态接口
interface PaginationState {
  page: number;
  limit: number;
  hasMore: boolean;
  total: number;
}

const RecordHistory: React.FC = () => {
  const navigate = useNavigate();
  const { show: showDialog, hide: hideDialog, DialogContainer } = useDialog();
  const { show: showToast, ToastContainer } = useToast();

  // 从全局状态获取儿童信息
  const { currentChild } = useChildrenStore();
  const { refreshUserData } = useAppStore();

  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 状态管理
  const [records, setRecords] = useState<FormattedRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<FormattedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 分页状态
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 5,
    hasMore: true,
    total: 0,
  });

  // 筛选选项配置
  const filterOptions = [
    { id: 'all', name: '全部', icon: 'mdi:view-list', color: '#666666' },
    { id: 'sleep', name: '睡眠', icon: 'mdi:sleep', color: '#7986CB' },
    { id: 'feeding', name: '喂养', icon: 'mdi:food-apple', color: '#FF9F73' },
    {
      id: 'diaper',
      name: '尿布',
      icon: 'mdi:baby-face-outline',
      color: '#8D6E63',
    },
    { id: 'growth', name: '成长', icon: 'mdi:chart-line', color: '#81C784' },
    {
      id: 'note',
      name: '随手记',
      icon: 'mdi:note-text-outline',
      color: '#FFD040',
    },
  ];

  // 格式化记录数据的函数
  const formatRecord = (record: RecordResponseDto): FormattedRecord => {
    const recordType =
      record.recordType.toLowerCase() as FormattedRecord['type'];
    const recordDate = new Date(record.recordTimestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 格式化日期显示
    let dateText = '';
    if (recordDate.toDateString() === today.toDateString()) {
      dateText = '今天';
    } else if (recordDate.toDateString() === yesterday.toDateString()) {
      dateText = '昨天';
    } else {
      const diffTime = today.getTime() - recordDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        dateText = `${diffDays}天前`;
      } else {
        dateText = `${recordDate.getMonth() + 1}月${recordDate.getDate()}日`;
      }
    }

    // 完整日期格式
    const fullDate = recordDate.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    // 根据记录类型生成标题和详情
    let title = '';
    let details = '';
    let icon = '';
    let color = '';

    switch (recordType) {
      case 'sleep': {
        const sleepDetails = record.details as SleepDetails;
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
      }

      case 'feeding': {
        const feedingDetails = record.details as FeedingDetails;
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
      }

      case 'diaper': {
        const diaperDetails = record.details as DiaperDetails;
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
      }

      case 'note': {
        const noteDetails = record.details as NoteDetails;
        title = '随手记';
        details = noteDetails.content || '随手记';
        if (noteDetails.tags && noteDetails.tags.length > 0) {
          details += ` - 标签: ${noteDetails.tags.join(', ')}`;
        }
        icon = 'mdi:note-text-outline';
        color = '#FFD040';
        break;
      }

      case 'growth': {
        const growthDetails = record.details as GrowthDetails;
        title = '成长记录';
        details = '';

        if (growthDetails.height !== undefined) {
          details += `身高: ${growthDetails.height}厘米`;
        }
        if (growthDetails.weight !== undefined) {
          details += details ? ' | ' : '';
          details += `体重: ${growthDetails.weight}千克`;
        }
        if (growthDetails.headCircumference !== undefined) {
          details += details ? ' | ' : '';
          details += `头围: ${growthDetails.headCircumference}厘米`;
        }
        if (!details) {
          details = '成长记录';
        }
        if (growthDetails.notes) {
          details += ` - ${growthDetails.notes}`;
        }
        icon = 'mdi:chart-line';
        color = '#81C784';
        break;
      }
    }

    return {
      id: record.id,
      type: recordType,
      time: recordDate.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: dateText,
      fullDate,
      title,
      details,
      icon,
      color,
      rawData: record,
    };
  };

  // 获取记录数据（分页）
  const fetchRecords = useCallback(
    async (page = 1, isRefresh = false) => {
      if (!currentChild?.id) return;

      try {
        // 设置加载状态
        if (isRefresh || page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params: PaginationQueryDto = {
          page,
          limit: pagination.limit,
        };

        const response = await getRecordsByChildIdPaginated(
          currentChild.id,
          params,
        );

        // 格式化记录数据
        const formattedRecords = response.data.map(formatRecord);

        // 更新记录列表
        if (isRefresh || page === 1) {
          setRecords(formattedRecords);
        } else {
          setRecords((prev) => [...prev, ...formattedRecords]);
        }

        // 更新分页状态
        setPagination({
          page,
          limit: pagination.limit,
          hasMore: page < response.pagination.totalPages,
          total: response.pagination.total,
        });
      } catch (error) {
        console.error('获取记录失败:', error);
        showToast({
          type: 'fail',
          content: '获取记录失败，请重试',
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentChild?.id, pagination.limit, showToast],
  );

  // 刷新数据
  const handleRefresh = useCallback(() => {
    fetchRecords(1, true);
  }, [fetchRecords]);

  // 加载更多数据
  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      fetchRecords(pagination.page + 1);
    }
  }, [fetchRecords, loadingMore, pagination.hasMore, pagination.page]);

  // 滚动事件处理
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && pagination.hasMore && !loadingMore && !loading) {
      loadMore();
    }
  }, [loadMore, pagination.hasMore, loadingMore, loading]);

  // 初始化数据加载
  useEffect(() => {
    if (currentChild?.id) {
      fetchRecords(1, true);
    }
  }, [currentChild?.id]);

  // 应用筛选和搜索
  useEffect(() => {
    let filtered = records;

    // 按类型筛选
    if (filter !== 'all') {
      filtered = filtered.filter((record) => record.type === filter);
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(query) ||
          record.details.toLowerCase().includes(query),
      );
    }

    setFilteredRecords(filtered);
  }, [records, filter, searchQuery]);

  // 绑定滚动事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 删除记录
  const handleDeleteRecord = (record: FormattedRecord) => {
    showDialog({
      title: '删除记录',
      content: `确定要删除这条${record.title}吗？删除后无法恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          await deleteRecord(record.id);
          showToast({
            type: 'success',
            content: '记录删除成功',
          });
          await handleRefresh();
          await refreshUserData();
        } catch (error) {
          console.error('删除记录失败:', error);
          showToast({
            type: 'fail',
            content: '删除记录失败，请重试',
          });
        }
        hideDialog();
      },
      onCancel: hideDialog,
    });
  };

  // 查看记录详情
  const handleViewRecord = (record: FormattedRecord) => {
    showDialog({
      title: record.title,
      content: (
        <div className="space-y-3">
          <div className="flex items-center">
            <Icon
              icon={record.icon}
              className="mr-2 text-lg"
              style={{ color: record.color }}
            />
            <span className="font-medium">{record.title}</span>
          </div>
          <div className="text-sm text-[#666666]">
            <div className="mb-2">
              <strong>时间：</strong>
              {record.fullDate} {record.time}
            </div>
            <div>
              <strong>详情：</strong>
              {record.details}
            </div>
          </div>
        </div>
      ),
      confirmText: '确定',
      onConfirm: hideDialog,
    });
  };

  // 按日期分组记录
  const groupRecordsByDate = (records: FormattedRecord[]) => {
    const groups: { [key: string]: FormattedRecord[] } = {};

    records.forEach((record) => {
      const dateKey = new Date(record.rawData.recordTimestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(record);
    });

    return Object.entries(groups)
      .map(([dateKey, records]) => ({
        date: new Date(dateKey),
        records: records.sort(
          (a, b) =>
            new Date(b.rawData.recordTimestamp).getTime() -
            new Date(a.rawData.recordTimestamp).getTime(),
        ),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const groupedRecords = groupRecordsByDate(filteredRecords);

  // 如果没有选择儿童，显示提示
  if (!currentChild) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FDFBF8]">
        <NavBar title="历史记录" onBack={() => navigate('/home')} />
        <div className="flex-1 flex items-center justify-center p-8">
          <EmptyState
            title="请先选择儿童"
            description="需要选择一个儿童才能查看记录"
            iconType="empty"
            iconName="mdi:account-child"
            iconColor="#FFB38A"
            action={
              <Button variant="primary" onClick={() => navigate('/children')}>
                选择儿童
              </Button>
            }
          />
        </div>
        <DialogContainer />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF8]">
      {/* 导航栏 */}
      <NavBar
        title="历史记录"
        onBack={() => navigate('/home')}
        right={
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
              onClick={handleRefresh}
              disabled={loading}
            >
              <Icon
                icon="mdi:refresh"
                className={`text-white text-lg ${
                  loading ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden">
        {/* 搜索和筛选区域 */}
        <div className="px-5 py-4 bg-white border-b border-[#F0F0F0]">
          {/* 搜索框 */}
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon icon="mdi:magnify" className="text-[#999999] text-lg" />
            </div>
            <input
              type="text"
              placeholder="搜索记录内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-[#F5F7FA] border border-[#E0E0E0] rounded-xl text-base placeholder-[#999999] focus:outline-none focus:border-[#FFB38A] focus:bg-white transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#666666]"
              >
                <Icon icon="mdi:close" className="text-lg" />
              </button>
            )}
          </div>

          {/* 筛选标签 */}
          <div className="flex overflow-x-auto hide-scrollbar space-x-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id as FilterType)}
                className={`flex-shrink-0 flex items-center px-3 py-2 rounded-full border transition-all duration-200 ${
                  filter === option.id
                    ? 'bg-[#FFB38A] border-[#FFB38A] text-white'
                    : 'bg-white border-[#E0E0E0] text-[#666666] hover:border-[#FFB38A] hover:text-[#FFB38A]'
                }`}
              >
                <Icon
                  icon={option.icon}
                  className={`mr-1 text-sm ${
                    filter === option.id ? 'text-white' : ''
                  }`}
                  style={filter !== option.id ? { color: option.color } : {}}
                />
                <span className="text-sm font-medium">{option.name}</span>
              </button>
            ))}
          </div>

          {/* 数据统计 */}
          {/* {pagination.total > 0 && (
            <div className="mt-3 text-xs text-[#999999] text-center">
              已加载 {records.length} / {pagination.total} 条记录
              {filteredRecords.length !== records.length &&
                ` (筛选后 ${filteredRecords.length} 条)`}
            </div>
          )} */}
        </div>

        {/* 记录列表 */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto"
          style={{ maxHeight: 'calc(100vh - 240px)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center">
                <Icon
                  icon="mdi:loading"
                  className="text-4xl text-[#FFB38A] animate-spin mb-2"
                />
                <span className="text-[#666666]">加载中...</span>
              </div>
            </div>
          ) : groupedRecords.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <EmptyState
                title={
                  searchQuery || filter !== 'all'
                    ? '没有找到相关记录'
                    : '暂无记录'
                }
                description={
                  searchQuery || filter !== 'all'
                    ? '尝试调整搜索条件或筛选类型'
                    : '开始记录宝宝的日常活动吧'
                }
                iconType="noResult"
                iconName="mdi:file-search-outline"
                iconColor="#FFB38A"
                action={
                  searchQuery || filter !== 'all' ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearchQuery('');
                        setFilter('all');
                      }}
                    >
                      清除筛选
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => navigate('/home')}>
                      开始记录
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <div className="px-5 py-4 space-y-6">
              {groupedRecords.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* 日期分组标题 */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#FFB38A] rounded-full mr-2"></div>
                      <h3 className="text-base font-semibold text-[#333333]">
                        {group.date.toLocaleDateString('zh-CN', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        })}
                      </h3>
                    </div>
                    <div className="flex-1 h-px bg-[#E0E0E0] ml-3"></div>
                    <span className="ml-3 text-sm text-[#999999]">
                      {group.records.length} 条记录
                    </span>
                  </div>

                  {/* 记录列表 */}
                  <div className="space-y-3">
                    {group.records.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#F0F0F0] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer"
                        onClick={() => handleViewRecord(record)}
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
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-[#333333] font-medium truncate mr-2">
                                {record.title}
                              </div>
                              <div className="flex items-center text-xs text-[#999999] whitespace-nowrap">
                                <span>{record.time}</span>
                              </div>
                            </div>
                            <div className="text-sm text-[#666666] mb-2">
                              {record.details}
                            </div>

                            {/* 操作按钮 */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewRecord(record);
                                }}
                                className="flex items-center text-xs text-[#FFB38A] hover:text-[#FF9F73] transition-colors duration-200"
                              >
                                <Icon icon="mdi:eye" className="mr-1" />
                                查看
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRecord(record);
                                }}
                                className="flex items-center text-xs text-[#999999] hover:text-[#FF5252] transition-colors duration-200"
                              >
                                <Icon
                                  icon="mdi:delete-outline"
                                  className="mr-1"
                                />
                                删除
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* 加载更多指示器 */}
              {loadingMore && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center text-[#999999]">
                    <Icon
                      icon="mdi:loading"
                      className="text-lg animate-spin mr-2"
                    />
                    <span className="text-sm">加载更多...</span>
                  </div>
                </div>
              )}

              {/* 没有更多数据提示 */}
              {!pagination.hasMore && records.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-[#999999]">已加载全部记录</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialog 和 Toast 容器 */}
      <DialogContainer />
      <ToastContainer />
    </div>
  );
};

export default RecordHistory;
