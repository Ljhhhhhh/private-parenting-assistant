import React, { useState } from 'react';
import { NavBar, List, SwipeAction, ErrorBlock, Button } from 'antd-mobile';
import { LeftOutline, DeleteOutline, MessageOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../contexts/MessageContext';

// 模拟聊天历史数据
const mockChatHistory = [
  {
    id: '1',
    title: '关于宝宝发烧的咨询',
    lastMessage: '38度算高烧吗？需要吃退烧药吗？',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).getTime(), // 30分钟前
    unread: 2,
  },
  {
    id: '2',
    title: '婴儿辅食添加',
    lastMessage: '6个月的宝宝可以添加哪些辅食？',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).getTime(), // 2小时前
    unread: 0,
  },
  {
    id: '3',
    title: '宝宝睡眠问题',
    lastMessage: '宝宝晚上频繁醒来怎么办？',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).getTime(), // 1天前
    unread: 0,
  },
];

const ChatHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showDialog } = useMessage();
  const [chatHistory, setChatHistory] = useState(mockChatHistory);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffDays = Math.floor(
      (now.getTime() - timestamp) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      // 今天，显示时间
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      // 昨天
      return '昨天';
    } else if (diffDays < 7) {
      // 一周内，显示星期几
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekdays[date.getDay()];
    } else {
      // 超过一周，显示日期
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      });
    }
  };

  // 处理删除聊天记录
  const handleDelete = (id: string) => {
    showDialog({
      content: '确定要删除这条聊天记录吗？',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: () => {
        setChatHistory(chatHistory.filter((item) => item.id !== id));
      },
    });
  };

  // 处理进入聊天
  const handleEnterChat = (id: string) => {
    // 在实际应用中，这里应该导航到特定的聊天会话
    navigate(`/chat/${id}`);
  };

  // 处理返回
  const handleBack = () => {
    navigate('/');
  };

  // 处理清空所有聊天记录
  const handleClearAll = () => {
    if (chatHistory.length === 0) return;

    showDialog({
      content: '确定要清空所有聊天记录吗？',
      confirmText: '清空',
      cancelText: '取消',
      onConfirm: () => {
        setChatHistory([]);
      },
    });
  };

  return (
    <div
      className="chat-history-page"
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* 头部导航栏 */}
      <NavBar
        back={<LeftOutline />}
        onBack={handleBack}
        right={
          chatHistory.length > 0 ? (
            <DeleteOutline onClick={handleClearAll} />
          ) : null
        }
        style={{
          backgroundColor: '#fff',
          '--height': '45px',
          borderBottom: '1px solid #eee',
        }}
      >
        聊天记录
      </NavBar>

      {/* 聊天历史列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {chatHistory.length > 0 ? (
          <List>
            {chatHistory.map((chat) => (
              <SwipeAction
                key={chat.id}
                rightActions={[
                  {
                    key: 'delete',
                    text: '删除',
                    color: 'danger',
                    onClick: () => handleDelete(chat.id),
                  },
                ]}
              >
                <List.Item
                  onClick={() => handleEnterChat(chat.id)}
                  prefix={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#1677ff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                      }}
                    >
                      <MessageOutline />
                    </div>
                  }
                  extra={
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {formatTime(chat.timestamp)}
                      </div>
                      {chat.unread > 0 && (
                        <div
                          style={{
                            marginTop: 4,
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            backgroundColor: '#ff3141',
                            color: 'white',
                            fontSize: 12,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 'auto',
                          }}
                        >
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  }
                  description={chat.lastMessage}
                >
                  {chat.title}
                </List.Item>
              </SwipeAction>
            ))}
          </List>
        ) : (
          <ErrorBlock
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            style={{
              '--image-height': '150px',
            }}
            description="暂无聊天记录"
          >
            <Button
              color="primary"
              onClick={() => navigate('/chat')}
              style={{ marginTop: 16 }}
            >
              开始新的对话
            </Button>
          </ErrorBlock>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryPage;
