import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  NavBar,
  SafeArea,
  Card,
  Button,
  Dialog,
  DotLoading,
  Image,
  Grid,
  Divider,
} from 'antd-mobile';
// import { EditSOutline } from 'antd-mobile-icons';
import { getChildById } from '../../api/children';
import { ChildResponseDto } from '../../types/models';
import dayjs from 'dayjs';

const ChildDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<ChildResponseDto | null>(null);

  const fetchChild = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getChildById(Number(id));
      setChild(response);
    } catch (error) {
      console.error('Failed to fetch child:', error);
      Dialog.alert({
        content: '获取宝宝档案失败，请稍后再试',
        confirmText: '确定',
        onConfirm: () => navigate('/children'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChild();
  }, [id]);

  const handleEditChild = () => {
    if (!child) return;
    navigate(`/children/${child.id}/edit`);
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
        onBack={() => navigate('/children')}
      >
        宝宝档案详情
      </NavBar>
      <SafeArea position="top" />

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <DotLoading color="primary" />
            <span className="mt-2 text-gray-500">加载中...</span>
          </div>
        ) : child ? (
          <div className="animate-fade-in">
            <Card className="overflow-hidden rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Image
                    src={getAvatarPlaceholder(child.gender)}
                    style={{ borderRadius: 24 }}
                    fit="cover"
                    width={64}
                    height={64}
                    placeholder=""
                    fallback={
                      <div className="flex justify-center items-center w-16 h-16 text-xl bg-gray-200 rounded-full">
                        {child.nickname?.charAt(0)}
                      </div>
                    }
                  />
                  <div className="ml-4">
                    <h2 className="text-xl font-bold">{child.nickname}</h2>
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
                  </div>
                </div>
                <Button
                  size="mini"
                  color="primary"
                  fill="outline"
                  onClick={handleEditChild}
                >
                  编辑
                </Button>
              </div>

              <Divider />

              <Grid columns={2} gap={8}>
                <Grid.Item>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500">出生日期</div>
                    <div className="mt-1 font-medium">
                      {dayjs(child.dateOfBirth).format('YYYY年MM月DD日')}
                    </div>
                  </div>
                </Grid.Item>
                <Grid.Item>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500">当前月龄</div>
                    <div className="mt-1 font-medium">
                      {calculateAge(child.dateOfBirth)}
                    </div>
                  </div>
                </Grid.Item>
              </Grid>

              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  成长记录
                </h3>
                <div className="flex flex-col justify-center items-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">暂无成长记录</p>
                  <Button
                    size="mini"
                    color="primary"
                    className="mt-2"
                    onClick={() =>
                      navigate(`/children/${child.id}/records/create`)
                    }
                  >
                    添加记录
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                block
                color="primary"
                onClick={() => navigate(`/children/${child.id}/records`)}
              >
                查看成长记录
              </Button>
              <Button
                block
                color="primary"
                fill="outline"
                onClick={() => navigate(`/chat?childId=${child.id}`)}
              >
                智能问答
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-full">
            <p className="text-gray-500">未找到宝宝档案</p>
            <Button
              color="primary"
              className="mt-4"
              onClick={() => navigate('/children')}
            >
              返回列表
            </Button>
          </div>
        )}
      </div>

      <SafeArea position="bottom" />
    </div>
  );
};

export default ChildDetailPage;
