import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Grid, Card, Button, Space } from 'antd-mobile';
import {
  MessageOutline,
  HistogramOutline,
  SetOutline,
  PictureOutline,
  HeartOutline,
  ClockCircleOutline,
} from 'antd-mobile-icons';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 功能卡片数据
  const features = [
    {
      id: 'chat',
      title: '智能问答',
      icon: <MessageOutline />,
      color: '#1677ff',
      description: '向AI育儿助手提问',
      onClick: () => navigate('/chat'),
    },
    {
      id: 'history',
      title: '聊天记录',
      icon: <HistogramOutline />,
      color: '#00b578',
      description: '查看历史对话',
      onClick: () => navigate('/chat-history'),
    },
    {
      id: 'growth',
      title: '成长记录',
      icon: <HeartOutline />,
      color: '#ff8f1f',
      description: '记录宝宝成长数据',
      onClick: () => alert('功能开发中'),
    },
    {
      id: 'milestones',
      title: '发育里程碑',
      icon: <ClockCircleOutline />,
      color: '#ff3141',
      description: '追踪发育进度',
      onClick: () => alert('功能开发中'),
    },
    {
      id: 'album',
      title: '宝宝相册',
      icon: <PictureOutline />,
      color: '#9f76ff',
      description: '记录精彩瞬间',
      onClick: () => alert('功能开发中'),
    },
    {
      id: 'settings',
      title: '聊天设置',
      icon: <SetOutline />,
      color: '#8f8f8f',
      description: '个性化设置',
      onClick: () => navigate('/chat-settings'),
    },
  ];

  return (
    <div className="dashboard">
      {/* 用户信息卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#1677ff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div style={{ marginLeft: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
              {user?.full_name || '亲爱的用户'}
            </h2>
            <p style={{ color: '#666', margin: 0 }}>{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* 快速开始聊天按钮 */}
      <Button
        block
        color="primary"
        size="large"
        onClick={() => navigate('/chat')}
        style={{ marginBottom: 16 }}
      >
        <Space>
          <MessageOutline />
          <span>开始新对话</span>
        </Space>
      </Button>

      {/* 功能网格 */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>功能</h3>
        <Grid columns={2} gap={12}>
          {features.map((feature) => (
            <Grid.Item key={feature.id}>
              <Card
                onClick={feature.onClick}
                style={{ height: '100%' }}
                bodyStyle={{
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: feature.color,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontSize: 20,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div style={{ marginLeft: 12 }}>
                    <div style={{ fontWeight: 'bold' }}>{feature.title}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {feature.description}
                    </div>
                  </div>
                </div>
              </Card>
            </Grid.Item>
          ))}
        </Grid>
      </div>

      {/* 育儿小贴士 */}
      <Card title="今日育儿小贴士">
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          <p>
            <strong>宝宝睡眠小技巧：</strong>
            建立规律的睡前仪式，如洗澡、读故事、轻声哼唱，有助于宝宝更快入睡。
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
