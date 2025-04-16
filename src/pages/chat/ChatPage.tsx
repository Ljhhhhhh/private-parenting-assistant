import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  SafeArea,
  Button,
  Dialog,
  Toast,
  Popover,
  Space,
  Result,
  Skeleton,
  Ellipsis,
} from 'antd-mobile';
import {
  DownOutline,
  MoreOutline,
  SetOutline,
  DeleteOutline,
  UserAddOutline,
  UserOutline,
} from 'antd-mobile-icons';
import Chat, { Bubble, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';

// 定义快速回复项类型
interface QuickReplyItem {
  name: string;
  isNew?: boolean;
  isHighlight?: boolean;
}
import { chatApi, childrenApi } from '../../api';
import { ChatHistoryPublic, ChildPublic, ModelInfo } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

// 定义消息类型
interface ChatMessage {
  type: string;
  content: {
    text: string;
    data?: any;
  };
  position?: 'left' | 'right';
  createdAt?: number;
  hasTime?: boolean;
  user?: {
    avatar?: string;
    name?: string;
  };
  sessionId?: string;
}

// 定义推荐问题
const QUICK_REPLIES: QuickReplyItem[] = [
  {
    name: '宝宝发烧怎么办？',
    isNew: true,
    isHighlight: true,
  },
  {
    name: '宝宝多大可以添加辅食？',
  },
  {
    name: '宝宝不爱喝水怎么办？',
  },
  {
    name: '宝宝晚上哭闹不睡觉怎么办？',
  },
  {
    name: '宝宝几个月会翻身？',
  },
];

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(
    searchParams.get('childId') || undefined,
  );
  const [children, setChildren] = useState<ChildPublic[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildPublic | null>(null);
  const [, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    undefined,
  );
  const [showChildPrompt, setShowChildPrompt] = useState(false);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [sessionDropdownVisible, setSessionDropdownVisible] = useState(false);
  const [sessions, setSessions] = useState<string[]>([]);

  // 使用 chatUI 的 useMessages hook 管理消息
  const { messages, appendMsg, resetList, updateMsg } = useMessages([]);

  // 创建引用
  const messageContainerRef = useRef<any>(null);
  const childDropdownRef = useRef<HTMLDivElement>(null);
  const sessionDropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        childDropdownRef.current &&
        !childDropdownRef.current.contains(event.target as Node) &&
        showChildDropdown
      ) {
        setShowChildDropdown(false);
      }

      if (
        sessionDropdownRef.current &&
        !sessionDropdownRef.current.contains(event.target as Node) &&
        sessionDropdownVisible
      ) {
        setSessionDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChildDropdown, sessionDropdownVisible]);

  // 获取儿童列表
  const fetchChildren = useCallback(async () => {
    try {
      const response = await childrenApi.getChildren();
      setChildren(response.data);

      // 如果有选定的儿童ID，找到对应的儿童信息
      if (selectedChildId) {
        const child = response.data.find((c) => c.id === selectedChildId);
        if (child) {
          setSelectedChild(child);
        }
      }

      // 如果没有儿童信息，显示提示
      if (response.data.length === 0) {
        setShowChildPrompt(true);
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
      Toast.show({
        icon: 'fail',
        content: '获取宝宝信息失败',
      });
    }
  }, [selectedChildId]);

  // 获取可用的模型
  const fetchAvailableModels = useCallback(async () => {
    try {
      const response = await chatApi.getAvailableModels();
      setAvailableModels(response.models);
      if (response.models.length > 0) {
        // 使用第一个模型作为默认模型
        setSelectedModel(response.models[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      // 如果获取模型失败，使用默认模型
      setSelectedModel('gpt-3.5-turbo');
    }
  }, []);

  // 获取会话列表
  const fetchSessions = useCallback(async () => {
    try {
      const sessions = await chatApi.getChatSessions();
      setSessions(sessions);

      // 如果没有指定会话ID，使用第一个会话或创建新会话
      if (!sessionId && sessions.length > 0) {
        setSessionId(sessions[0]);
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    }
  }, [sessionId]);

  // 获取聊天历史
  const fetchChatHistory = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await chatApi.getChatHistories(
        sessionId,
        selectedChildId,
      );

      // 转换历史消息格式
      const historyMessages: ChatMessage[] = [];
      response.data.forEach((history: ChatHistoryPublic) => {
        // 用户消息
        historyMessages.push({
          type: 'text',
          content: { text: history.user_query },
          position: 'right',
          createdAt: new Date(history.created_at).getTime(),
          sessionId: history.session_id,
        });

        // AI回复
        historyMessages.push({
          type: 'text',
          content: {
            text: history.ai_response,
            data: {
              sources: history.sources,
              model: history.model,
            },
          },
          position: 'left',
          createdAt: new Date(history.created_at).getTime() + 1, // 确保顺序正确
          sessionId: history.session_id,
        });
      });

      // 按时间排序
      historyMessages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

      // 重置消息列表并添加历史消息
      resetList(historyMessages);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      Toast.show({
        icon: 'fail',
        content: '获取聊天记录失败',
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId, selectedChildId, resetList]);

  // 初始化
  useEffect(() => {
    if (isAuthenticated) {
      fetchChildren();
      fetchAvailableModels();
      fetchSessions();
    }
  }, [isAuthenticated, fetchChildren, fetchAvailableModels, fetchSessions]);

  // 当会话ID变化时，获取聊天历史
  useEffect(() => {
    if (sessionId) {
      fetchChatHistory();
    } else {
      resetList([]);
      setLoading(false);
    }
  }, [sessionId, fetchChatHistory, resetList]);

  // 当选择的儿童ID变化时，更新选择的儿童信息
  useEffect(() => {
    if (selectedChildId && children.length > 0) {
      const child = children.find((c) => c.id === selectedChildId);
      setSelectedChild(child || null);
    } else {
      setSelectedChild(null);
    }
  }, [selectedChildId, children]);

  // 处理发送消息
  const handleSend = async (type: string, content: string) => {
    // 验证消息类型和内容，防止重复发送
    if (type !== 'text' || !content.trim() || sendingMessage) return;

    // 如果没有选择儿童但有儿童数据，显示提示
    if (!selectedChildId && children.length > 0 && !showChildPrompt) {
      setShowChildPrompt(true);
    }

    // 添加用户消息到聊天界面
    appendMsg({
      type: 'text',
      content: { text: content },
      position: 'right',
    });

    // 添加加载中的AI消息
    const aiMsgId = appendMsg({
      type: 'text',
      content: { text: '思考中...' },
      position: 'left',
    });

    try {
      setSendingMessage(true);

      // 发送消息到服务器
      const response = await chatApi.sendChatMessage({
        question: content,
        session_id: sessionId,
        child_id: selectedChildId,
        model: selectedModel,
      });

      // 更新AI消息
      updateMsg(aiMsgId, {
        type: 'text',
        content: {
          text: response.answer,
          data: {
            sources: response.sources,
            model: response.model,
          },
        },
        position: 'left',
      });

      // 如果是新会话，更新会话ID并刷新会话列表
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
        fetchSessions();
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      // 更新AI消息为错误信息
      updateMsg(aiMsgId, {
        type: 'text',
        content: { text: '抱歉，发送消息失败，请稍后再试。' },
        position: 'left',
      });

      Toast.show({
        icon: 'fail',
        content: '发送消息失败',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // 处理快速回复点击
  const handleQuickReplyClick = (reply: QuickReplyItem) => {
    handleSend('text', reply.name);
  };

  // 创建新会话
  const handleNewSession = () => {
    setSessionId(undefined);
    resetList([]);
    setSessionDropdownVisible(false);
  };

  // 切换会话
  const handleSwitchSession = (session: string) => {
    setSessionId(session);
    setSessionDropdownVisible(false);
  };

  // 删除会话
  const handleDeleteSession = () => {
    if (!sessionId) return;

    Dialog.confirm({
      content: '确定要删除此会话吗？',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          // 这里应该有一个删除会话的API调用
          // await chatApi.deleteSession(sessionId);

          // 刷新会话列表
          fetchSessions();

          // 创建新会话
          handleNewSession();

          Toast.show({
            icon: 'success',
            content: '会话已删除',
          });
        } catch (error) {
          console.error('Failed to delete session:', error);
          Toast.show({
            icon: 'fail',
            content: '删除会话失败',
          });
        }
      },
    });
  };

  // 创建儿童档案
  const handleCreateChild = () => {
    navigate('/children/create');
  };

  // 选择儿童
  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    // 可以考虑重新获取聊天历史
  };

  // 去儿童列表页面
  const handleGoToChildrenList = () => {
    navigate('/children');
  };

  // 渲染消息内容
  const renderMessageContent = (msg: any) => {
    const { content } = msg;

    // 如果是AI回复，添加引用源和模型信息
    if (msg.position === 'left' && content.data) {
      return (
        <div>
          <Bubble content={content.text} />

          {/* 如果有引用源，显示引用源 */}
          {content.data.sources && content.data.sources.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              <div className="mb-1 font-medium">参考资料：</div>
              <ul className="pl-4 list-disc">
                {content.data.sources.map((source: string, index: number) => (
                  <li key={index}>
                    <Ellipsis direction="end" content={source} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 显示模型信息 */}
          {content.data.model && (
            <div className="mt-1 text-xs text-gray-400">
              由 {content.data.model} 提供
            </div>
          )}
        </div>
      );
    }

    // 普通消息
    return <Bubble content={content.text} />;
  };

  // 计算儿童年龄
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

  // 渲染导航栏右侧内容
  const renderNavbarRight = () => (
    <div className="flex items-center">
      {/* 儿童选择下拉菜单 */}
      <div className="relative" ref={childDropdownRef}>
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setShowChildDropdown(!showChildDropdown)}
        >
          {selectedChild ? (
            <span className="mr-1">{selectedChild.name}</span>
          ) : (
            <span className="mr-1 text-gray-400">选择宝宝</span>
          )}
          <DownOutline fontSize={12} />
        </div>

        {showChildDropdown && (
          <div className="absolute right-0 z-10 p-2 mt-2 bg-white rounded-lg shadow-lg w-60">
            {children.length > 0 ? (
              <>
                {children.map((child) => (
                  <div
                    key={child.id}
                    className={`p-2 rounded-md flex items-center cursor-pointer ${
                      selectedChildId === child.id
                        ? 'bg-primary-50 text-primary-600'
                        : ''
                    }`}
                    onClick={() => {
                      handleSelectChild(child.id);
                      setShowChildDropdown(false);
                    }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-primary-100">
                      {child.gender === 'male' ? '👦' : '👧'}
                    </div>
                    <div>
                      <div className="font-medium">{child.name}</div>
                      <div className="text-xs text-gray-500">
                        {calculateAge(child.birthday)}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <Button
                    block
                    size="small"
                    onClick={() => {
                      handleGoToChildrenList();
                      setShowChildDropdown(false);
                    }}
                  >
                    管理宝宝档案
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-4 text-center">
                <div className="mb-2 text-gray-500">还没有宝宝档案</div>
                <Button
                  color="primary"
                  size="small"
                  onClick={() => {
                    handleCreateChild();
                    setShowChildDropdown(false);
                  }}
                >
                  创建宝宝档案
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 更多选项 */}
      <Popover
        content={
          <div className="p-1">
            <Space direction="vertical" block>
              <div
                className="flex items-center p-2"
                onClick={() => {
                  // 打开设置
                }}
              >
                <SetOutline className="mr-2" />
                <span>设置</span>
              </div>
              <div
                className={`p-2 flex items-center ${
                  !sessionId ? 'text-gray-300' : ''
                }`}
                onClick={sessionId ? handleDeleteSession : undefined}
              >
                <DeleteOutline className="mr-2" />
                <span>删除会话</span>
              </div>
              <div
                className="flex items-center p-2"
                onClick={handleCreateChild}
              >
                <UserAddOutline className="mr-2" />
                <span>添加宝宝档案</span>
              </div>
            </Space>
          </div>
        }
        trigger="click"
        placement="bottom-end"
      >
        <div className="p-1 ml-2">
          <MoreOutline fontSize={24} />
        </div>
      </Popover>
    </div>
  );

  // 渲染导航栏标题
  const renderNavbarTitle = () => (
    <div className="relative" ref={sessionDropdownRef}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setSessionDropdownVisible(!sessionDropdownVisible)}
      >
        <span className="mr-1">智能问答</span>
        <DownOutline fontSize={12} />
      </div>

      {sessionDropdownVisible && (
        <div className="absolute left-0 z-10 p-2 mt-2 bg-white rounded-lg shadow-lg w-44">
          <div
            className={`p-2 rounded-md cursor-pointer ${
              !sessionId ? 'bg-primary-50 text-primary-600' : ''
            }`}
            onClick={handleNewSession}
          >
            新对话
          </div>
          {sessions.map((session) => (
            <div
              key={session}
              className={`p-2 rounded-md cursor-pointer ${
                sessionId === session ? 'bg-primary-50 text-primary-600' : ''
              }`}
              onClick={() => handleSwitchSession(session)}
            >
              会话 {session.substring(0, 8)}...
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 渲染儿童提示
  const renderChildPrompt = () => {
    if (!showChildPrompt) return null;

    return (
      <div className="fixed left-0 right-0 z-10 p-3 top-16 bg-yellow-50 animate-slide-down">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-yellow-800">
              添加宝宝档案，获取更精准的育儿建议
            </div>
            <div className="mt-1 text-xs text-yellow-700">
              根据宝宝的年龄和性别，我们可以提供更有针对性的回答
            </div>
          </div>
          <Space>
            <Button size="mini" onClick={() => setShowChildPrompt(false)}>
              稍后再说
            </Button>
            <Button size="mini" color="primary" onClick={handleCreateChild}>
              立即添加
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  // 渲染加载状态
  const renderLoading = () => {
    if (!loading) return null;

    return (
      <div className="p-4">
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={3} animated />
      </div>
    );
  };

  // 渲染空状态
  const renderEmpty = () => {
    if (loading || messages.length > 0) return null;

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Result
          icon={<UserOutline style={{ fontSize: 48, color: '#ccc' }} />}
          title="开始提问，获取育儿建议"
        />
        <div className="max-w-xs mt-4 text-sm text-center text-gray-500">
          您可以询问关于宝宝成长、喂养、健康、教育等方面的问题，我们的AI助手将为您提供专业的育儿建议。
        </div>

        {children.length === 0 && (
          <Button className="mt-6" color="primary" onClick={handleCreateChild}>
            创建宝宝档案，获取更精准的回答
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 导航栏 */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-3">
          {renderNavbarTitle()}
          {/* 下方 renderNavbarRight 存在问题 */}
          {/* {renderNavbarRight()} */}
        </div>
        <SafeArea position="top" />
      </div>

      {/* 儿童提示 */}
      {renderChildPrompt()}

      {/* 聊天界面 */}
      <div
        className={`flex-1 overflow-hidden ${showChildPrompt ? 'mt-16' : ''}`}
      >
        {renderLoading()}
        {renderEmpty()}

        <Chat
          wideBreakpoint="600px"
          messages={messages}
          renderMessageContent={renderMessageContent}
          quickReplies={QUICK_REPLIES}
          onQuickReplyClick={handleQuickReplyClick}
          onSend={handleSend}
          locale="zh-CN"
          placeholder="输入您的问题..."
          // disabled 属性不被支持，可以在 onSend 中处理
          loadMoreText="加载更多"
          messagesRef={messageContainerRef}
        />
      </div>
    </div>
  );
};

export default ChatPage;
