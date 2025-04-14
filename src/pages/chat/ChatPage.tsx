import React, { useState, useRef } from 'react';
import { NavBar, Image, Popup, Button, Space } from 'antd-mobile';
import Chat, {
  Bubble,
  MessageProps,
  useMessages,
  QuickReplyItemProps,
} from '@chatui/core';
import { useNavigate } from 'react-router-dom';
import { LeftOutline, MoreOutline } from 'antd-mobile-icons';
import { useMessage } from '../../contexts/MessageContext';

// 定义消息类型
interface ChatMessage extends MessageProps {
  _id: string;
  createdAt: number;
}

const initialMessages: ChatMessage[] = [
  {
    _id: '1',
    type: 'text',
    content: { text: '欢迎使用育儿助手！我可以帮助您解答关于育儿的各种问题。' },
    position: 'left',
    createdAt: Date.now(),
  },
];

// 快速回复选项
const defaultQuickReplies: QuickReplyItemProps[] = [
  {
    icon: 'message',
    name: '宝宝发烧怎么办？',
    isNew: true,
  },
  {
    icon: 'message',
    name: '如何安抚哭闹的婴儿？',
  },
  {
    icon: 'message',
    name: '婴儿辅食添加指南',
  },
  {
    icon: 'message',
    name: '宝宝睡眠问题',
  },
];

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { showDialog } = useMessage();
  const { messages, appendMsg, setTyping } = useMessages(initialMessages);
  const [quickReplies, setQuickReplies] =
    useState<QuickReplyItemProps[]>(defaultQuickReplies);
  const [menuVisible, setMenuVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatRef = useRef<any>(null);

  // 模拟发送消息到服务器并获取回复
  const sendMessageToServer = async (text: string) => {
    try {
      // 这里应该是实际的API调用
      // const response = await axios.post('/api/chat', { message: text });
      // 模拟API响应
      const mockResponse = {
        data: {
          message: `这是对"${text}"的回复。在实际应用中，这里会是从服务器返回的回答。`,
          quickReplies: [
            {
              icon: 'message',
              name: '了解更多关于这个话题',
            },
            {
              icon: 'message',
              name: '我有其他问题',
            },
          ],
        },
      };

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return mockResponse.data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  };

  // 处理发送消息
  const handleSend = async (type: string, val: string) => {
    if (type === 'text' && val.trim()) {
      // 添加用户消息
      appendMsg({
        _id: Date.now().toString(),
        type: 'text',
        content: { text: val },
        position: 'right',
        createdAt: Date.now(),
      });

      // 显示正在输入状态
      setTyping(true);

      try {
        // 发送消息到服务器并获取回复
        const data = await sendMessageToServer(val);

        // 添加机器人回复
        appendMsg({
          _id: (Date.now() + 1).toString(),
          type: 'text',
          content: { text: data.message },
          position: 'left',
          createdAt: Date.now(),
        });

        // 更新快速回复选项
        if (data.quickReplies) {
          setQuickReplies(data.quickReplies);
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        // 显示错误消息
        showDialog({
          content: '发送消息失败，请稍后再试',
          confirmText: '确定',
        });
      } finally {
        // 取消正在输入状态
        setTyping(false);
      }
    }
  };

  // 处理快速回复点击
  const handleQuickReplyClick = (item: QuickReplyItemProps) => {
    handleSend('text', item.name);
  };

  // 处理返回按钮点击
  const handleBack = () => {
    navigate('/');
  };

  // 处理菜单按钮点击
  const handleMenuClick = () => {
    setMenuVisible(true);
  };

  // 渲染消息内容
  const renderMessageContent = (msg: MessageProps) => {
    const { type, content } = msg;

    // 根据消息类型渲染不同的内容
    switch (type) {
      case 'text':
        return <Bubble content={content.text} />;
      case 'image':
        return (
          <Bubble type="image">
            <Image
              src={content.picUrl}
              fit="cover"
              width={200}
              style={{ borderRadius: 10 }}
            />
          </Bubble>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="chat-page"
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* 头部导航栏 */}
      <NavBar
        back={<LeftOutline />}
        onBack={handleBack}
        right={<MoreOutline onClick={handleMenuClick} />}
        style={{
          backgroundColor: '#fff',
          '--height': '45px',
          borderBottom: '1px solid #eee',
        }}
      >
        育儿助手
      </NavBar>

      {/* 聊天界面 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Chat
          ref={chatRef}
          messages={messages}
          renderMessageContent={renderMessageContent}
          quickReplies={quickReplies}
          onQuickReplyClick={handleQuickReplyClick}
          onSend={handleSend}
        />
      </div>

      {/* 菜单弹出层 */}
      <Popup
        visible={menuVisible}
        onMaskClick={() => setMenuVisible(false)}
        position="right"
        bodyStyle={{ width: '60vw', height: '100vh' }}
      >
        <div style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>菜单</h3>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              block
              onClick={() => {
                setMenuVisible(false);
                navigate('/profile');
              }}
            >
              个人资料
            </Button>
            <Button
              block
              onClick={() => {
                setMenuVisible(false);
                navigate('/settings');
              }}
            >
              设置
            </Button>
            <Button
              block
              onClick={() => {
                setMenuVisible(false);
                showDialog({
                  content: '确定要清空聊天记录吗？',
                  confirmText: '确定',
                  cancelText: '取消',
                  onConfirm: () => {
                    // 清空聊天记录，只保留初始消息
                    chatRef.current?.resetList(initialMessages);
                  },
                });
              }}
            >
              清空聊天
            </Button>
          </Space>
        </div>
      </Popup>
    </div>
  );
};

export default ChatPage;
