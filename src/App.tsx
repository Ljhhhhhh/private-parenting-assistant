import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x';
import React, { useEffect, useState } from 'react';

import {
  CloudUploadOutlined,
  CommentOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined,
  MenuOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Badge, Button, Drawer, type GetProp, Space } from 'antd';

const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);

const defaultConversationsItems = [
  {
    key: '0',
    label: 'What is Ant Design X?',
  },
];

// 使用 Tailwind 类名替代 createStyles

const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    label: renderTitle(
      <FireOutlined style={{ color: '#FF4D4F' }} />,
      'Hot Topics',
    ),
    description: 'What are you interested in?',
    children: [
      {
        key: '1-1',
        description: `What's new in X?`,
      },
      {
        key: '1-2',
        description: `What's AGI?`,
      },
      {
        key: '1-3',
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: '2',
    label: renderTitle(
      <ReadOutlined style={{ color: '#1890FF' }} />,
      'Design Guide',
    ),
    description: 'How to design a good product?',
    children: [
      {
        key: '2-1',
        icon: <HeartOutlined />,
        description: `Know the well`,
      },
      {
        key: '2-2',
        icon: <SmileOutlined />,
        description: `Set the AI role`,
      },
      {
        key: '2-3',
        icon: <CommentOutlined />,
        description: `Express the feeling`,
      },
    ],
  },
];

const senderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    description: 'Hot Topics',
    icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
  },
  {
    key: '2',
    description: 'Design Guide',
    icon: <ReadOutlined style={{ color: '#1890FF' }} />,
  },
];

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
  },
};

const Independent: React.FC = () => {
  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = useState(false);
  const [content, setContent] = useState('');
  const [conversationsItems, setConversationsItems] = useState(
    defaultConversationsItems,
  );
  const [activeKey, setActiveKey] = useState(
    defaultConversationsItems[0].key,
  );
  const [attachedFiles, setAttachedFiles] = useState<
    GetProp<typeof Attachments, 'items'>
  >([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // ==================== Runtime ====================
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess }) => {
      onSuccess(`Mock success return. You said: ${message}`);
    },
  });

  const { onRequest, messages, setMessages } = useXChat({
    agent,
  });

  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey]);

  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    onRequest(nextContent);
    setContent('');
  };

  const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
    onRequest(info.data.description as string);
  };

  const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `新对话 ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
    setMenuOpen(false); // 移动端添加新对话后关闭抽屉
  };

  const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (
    key,
  ) => {
    setActiveKey(key);
    setMenuOpen(false); // 移动端选择对话后关闭抽屉
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) =>
    setAttachedFiles(info.fileList);

  // ==================== Nodes ====================
  const placeholderNode = (
    <div className="flex flex-col space-y-4 pt-8 animate-fade-in">
      <Welcome
        variant="borderless"
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="育儿助手"
        description="基于 AI 的个性化育儿助手，为您提供专业的育儿建议和解决方案"
        extra={
          <Space>
            <Button icon={<ShareAltOutlined />} className="btn-secondary" />
            <Button icon={<EllipsisOutlined />} className="btn-secondary" />
          </Space>
        }
      />
      <Prompts
        title="您想了解什么？"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </div>
  );

  const items: GetProp<typeof Bubble.List, 'items'> = messages.map(
    ({ id, message, status }) => ({
      key: id,
      loading: status === 'loading',
      role: status === 'local' ? 'local' : 'ai',
      content: message,
    }),
  );

  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button
        type="text"
        icon={<PaperClipOutlined />}
        onClick={() => setHeaderOpen(!headerOpen)}
        className="text-primary-600"
      />
    </Badge>
  );

  const senderHeader = (
    <Sender.Header
      title="附件"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === 'drop'
            ? { title: '拖拽文件到此处' }
            : {
                icon: <CloudUploadOutlined />,
                title: '上传文件',
                description: '点击或拖拽文件到此区域上传',
              }
        }
      />
    </Sender.Header>
  );

  const logoNode = (
    <div className="flex h-16 items-center justify-start px-4 box-border">
      <img
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
        draggable={false}
        alt="logo"
        className="w-6 h-6 inline-block"
      />
      <span className="inline-block mx-2 font-bold text-gray-900 dark:text-white text-base">
        育儿助手
      </span>
    </div>
  );

  // 移动端菜单按钮
  const menuButton = (
    <Button 
      icon={<MenuOutlined />} 
      type="text" 
      onClick={() => setMenuOpen(true)}
      className="md:hidden text-primary-600"
    />
  );

  // ==================== Render =================
  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 flex flex-col md:flex-row mobile-safe-area">
      {/* 桌面端侧边栏 */}
      <div className="hidden md:flex md:w-72 h-full bg-gray-50/80 dark:bg-gray-800/80 flex-col">
        {/* Logo */}
        {logoNode}
        {/* 添加会话按钮 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/30 w-[calc(100%-24px)] mx-3 mb-6 text-primary-700 dark:text-primary-300"
          icon={<PlusOutlined />}
        >
          新建对话
        </Button>
        {/* 会话列表 */}
        <Conversations
          items={conversationsItems}
          className="px-3 flex-1 overflow-y-auto"
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>

      {/* 移动端侧边栏抽屉 */}
      <Drawer 
        open={menuOpen} 
        onClose={() => setMenuOpen(false)}
        placement="left"
        title={logoNode}
        styles={{
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <Button
          onClick={onAddConversation}
          type="link"
          className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/30 w-[calc(100%-24px)] mx-3 mb-6 text-primary-700 dark:text-primary-300"
          icon={<PlusOutlined />}
        >
          新建对话
        </Button>
        <Conversations
          items={conversationsItems}
          className="px-3 flex-1 overflow-y-auto"
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </Drawer>

      {/* 聊天区域 */}
      <div className="flex-1 h-full max-w-3xl mx-auto box-border flex flex-col p-4 md:p-6 gap-4">
        {/* 移动端顶部导航 */}
        <div className="flex justify-between items-center md:hidden mb-2">
          {menuButton}
          <span className="font-bold text-lg text-gray-900 dark:text-white">育儿助手</span>
          <div className="w-8"></div> {/* 占位，保持居中 */}
        </div>
        
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto">
          <Bubble.List
            items={
              items.length > 0
                ? items
                : [{ content: placeholderNode, variant: 'borderless' }]
            }
            roles={roles}
          />
        </div>
        
        {/* 提示词 */}
        <Prompts items={senderPromptsItems} onItemClick={onPromptsItemClick} />
        
        {/* 输入框 */}
        <div className="shadow-sm rounded-lg overflow-hidden">
          <Sender
            value={content}
            header={senderHeader}
            onSubmit={onSubmit}
            onChange={setContent}
            prefix={attachmentsNode}
            loading={agent.isRequesting()}
            placeholder="输入您的问题..."  
          />
        </div>
      </div>
    </div>
  );
};

export default Independent;
