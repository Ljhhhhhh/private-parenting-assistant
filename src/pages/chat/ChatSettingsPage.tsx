import React, { useState } from 'react';
import { NavBar, List, Switch, Slider, Radio, Space, Button } from 'antd-mobile';
import { LeftOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../contexts/MessageContext';

const ChatSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showDialog } = useMessage();
  
  // 聊天设置状态
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    vibration: true,
    autoReply: false,
    fontSize: 16,
    theme: 'light',
    language: 'zh_CN',
  });

  // 处理开关切换
  const handleSwitchChange = (key: string, checked: boolean) => {
    setSettings({
      ...settings,
      [key]: checked,
    });
  };

  // 处理字体大小变化
  const handleFontSizeChange = (value: number) => {
    setSettings({
      ...settings,
      fontSize: value,
    });
  };

  // 处理主题变化
  const handleThemeChange = (value: string) => {
    setSettings({
      ...settings,
      theme: value,
    });
  };

  // 处理语言变化
  const handleLanguageChange = (value: string) => {
    setSettings({
      ...settings,
      language: value,
    });
  };

  // 处理返回
  const handleBack = () => {
    navigate(-1);
  };

  // 处理保存设置
  const handleSaveSettings = () => {
    // 在实际应用中，这里应该保存设置到服务器或本地存储
    showDialog({
      content: '设置已保存',
      confirmText: '确定',
    });
  };

  // 处理重置设置
  const handleResetSettings = () => {
    showDialog({
      content: '确定要重置所有设置吗？',
      confirmText: '重置',
      cancelText: '取消',
      onConfirm: () => {
        setSettings({
          notifications: true,
          sound: true,
          vibration: true,
          autoReply: false,
          fontSize: 16,
          theme: 'light',
          language: 'zh_CN',
        });
      }
    });
  };

  return (
    <div className="chat-settings-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 头部导航栏 */}
      <NavBar
        back={<LeftOutline />}
        onBack={handleBack}
        style={{ 
          backgroundColor: '#fff',
          '--height': '45px',
          borderBottom: '1px solid #eee'
        }}
      >
        聊天设置
      </NavBar>

      {/* 设置列表 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List header="通知设置">
          <List.Item
            extra={
              <Switch
                checked={settings.notifications}
                onChange={(checked) => handleSwitchChange('notifications', checked)}
              />
            }
          >
            接收新消息通知
          </List.Item>
          <List.Item
            extra={
              <Switch
                checked={settings.sound}
                onChange={(checked) => handleSwitchChange('sound', checked)}
                disabled={!settings.notifications}
              />
            }
          >
            声音提醒
          </List.Item>
          <List.Item
            extra={
              <Switch
                checked={settings.vibration}
                onChange={(checked) => handleSwitchChange('vibration', checked)}
                disabled={!settings.notifications}
              />
            }
          >
            振动提醒
          </List.Item>
        </List>

        <List header="聊天设置">
          <List.Item
            extra={
              <Switch
                checked={settings.autoReply}
                onChange={(checked) => handleSwitchChange('autoReply', checked)}
              />
            }
          >
            自动回复
          </List.Item>
          <List.Item extra={`${settings.fontSize}px`}>
            字体大小
            <div style={{ padding: '10px 0' }}>
              <Slider
                value={settings.fontSize}
                min={12}
                max={20}
                step={1}
                onChange={handleFontSizeChange}
              />
            </div>
          </List.Item>
        </List>

        <List header="外观设置">
          <List.Item>
            主题
            <div style={{ marginTop: 10 }}>
              <Radio.Group
                value={settings.theme}
                onChange={handleThemeChange}
              >
                <Space>
                  <Radio value="light">浅色</Radio>
                  <Radio value="dark">深色</Radio>
                  <Radio value="system">跟随系统</Radio>
                </Space>
              </Radio.Group>
            </div>
          </List.Item>
        </List>

        <List header="语言设置">
          <List.Item>
            语言
            <div style={{ marginTop: 10 }}>
              <Radio.Group
                value={settings.language}
                onChange={handleLanguageChange}
              >
                <Space direction="vertical">
                  <Radio value="zh_CN">简体中文</Radio>
                  <Radio value="zh_TW">繁体中文</Radio>
                  <Radio value="en_US">English</Radio>
                </Space>
              </Radio.Group>
            </div>
          </List.Item>
        </List>

        <div style={{ padding: 16, display: 'flex', gap: 16 }}>
          <Button
            block
            color="primary"
            onClick={handleSaveSettings}
          >
            保存设置
          </Button>
          <Button
            block
            onClick={handleResetSettings}
          >
            重置设置
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsPage;
