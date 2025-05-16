import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NavBar,
  SafeArea,
  List,
  Button,
  Empty,
  Dialog,
  Toast,
  DotLoading,
  SwipeAction,
  Image,
} from 'antd-mobile';
import { Icon } from '@iconify/react';
import { getAllChildren, deleteChild } from '../../api/children';
import { ChildResponseDto } from '../../types/models';
import dayjs from 'dayjs';

const ChildrenListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildResponseDto[]>([]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await getAllChildren();
      setChildren(response);
    } catch (error) {
      console.error('Failed to fetch children:', error);
      Dialog.alert({
        content: '获取宝宝档案失败，请稍后再试',
        confirmText: '确定',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleCreateChild = () => {
    navigate('/children/create');
  };

  const handleViewChild = (childId: number) => {
    navigate(`/children/${childId}`);
  };

  const handleDeleteChild = async (childId: number) => {
    Dialog.confirm({
      content: '确定要删除这个宝宝档案吗？',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          await deleteChild(childId);
          Toast.show({
            icon: 'success',
            content: '删除成功',
          });
          fetchChildren();
        } catch (error) {
          console.error('Failed to delete child:', error);
          Dialog.alert({
            content: '删除失败，请稍后再试',
            confirmText: '确定',
          });
        }
      },
    });
  };

  const calculateAge = (birthday: string) => {
    const birthDate = dayjs(birthday);
    const now = dayjs();
    const months = now.diff(birthDate, 'month');
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return `${years}岁${remainingMonths > 0 ? remainingMonths + '个月' : ''}`;
    } else {
      return `${months}个月`;
    }
  };

  const getGenderText = (gender: string | undefined) => {
    return gender === 'male' ? '男宝宝' : '女宝宝';
  };

  const getGenderColor = (gender: string | undefined) => {
    return gender === 'male'
      ? 'bg-blue-100 text-blue-600'
      : 'bg-pink-100 text-pink-600';
  };

  const getAvatarPlaceholder = (gender: string | undefined) => {
    return gender === 'male' ? '/boy-avatar.svg' : '/girl-avatar.svg';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <NavBar
        className="bg-white border-b border-gray-200"
        onBack={() => navigate(-1)}
      >
        宝宝档案
      </NavBar>
      <SafeArea position="top" />

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <DotLoading color="primary" />
            <span className="mt-2 text-gray-500">加载中...</span>
          </div>
        ) : children.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full">
            <Empty description="暂无宝宝档案" imageStyle={{ width: 128 }} />
            <div className="mt-4 space-y-2">
              <Button color="primary" onClick={handleCreateChild}>
                创建宝宝档案
              </Button>
              <div className="mt-2 text-sm text-center text-gray-500">或者</div>
              <Button
                color="primary"
                fill="outline"
                onClick={() => navigate('/chat')}
              >
                直接开始问答
              </Button>
            </div>
          </div>
        ) : (
          <>
            <List header="我的宝宝" className="overflow-hidden rounded-lg">
              {children.map((child) => (
                <SwipeAction
                  key={child.id}
                  rightActions={[
                    {
                      key: 'delete',
                      text: '删除',
                      color: 'danger',
                      onClick: () => handleDeleteChild(child.id),
                    },
                  ]}
                >
                  <List.Item
                    onClick={() => handleViewChild(child.id)}
                    prefix={
                      <Image
                        src={getAvatarPlaceholder(child.gender)}
                        style={{ borderRadius: 20 }}
                        fit="cover"
                        width={40}
                        height={40}
                        placeholder=""
                        fallback={
                          <div className="flex justify-center items-center w-10 h-10 bg-gray-200 rounded-full">
                            {child.nickname.charAt(0)}
                          </div>
                        }
                      />
                    }
                    description={
                      <div className="flex items-center mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getGenderColor(
                            child.gender,
                          )}`}
                        >
                          {getGenderText(child.gender)}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {calculateAge(child.dateOfBirth)}
                        </span>
                      </div>
                    }
                    arrow={true}
                  >
                    {child.nickname}
                  </List.Item>
                </SwipeAction>
              ))}
            </List>

            <div className="p-4 mt-4">
              <Button block color="primary" onClick={handleCreateChild}>
                <Icon icon="mdi:plus" />
                添加宝宝档案
              </Button>
              <p className="mt-2 text-xs text-center text-gray-500">
                最多可添加2个宝宝档案
              </p>
            </div>
          </>
        )}
      </div>

      <SafeArea position="bottom" />
    </div>
  );
};

export default ChildrenListPage;
