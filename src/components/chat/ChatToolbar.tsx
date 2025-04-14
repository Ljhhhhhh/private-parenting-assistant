import React, { useState } from 'react';
import { Toolbar, ToolbarItemProps } from '@chatui/core';
import { ImageUploader, Dialog, Toast } from 'antd-mobile';
import { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import { PictureOutline, SoundOutline, SmileOutline } from 'antd-mobile-icons';

interface ChatToolbarProps {
  onSend: (type: string, content: any) => void;
}

const ChatToolbar: React.FC<ChatToolbarProps> = ({ onSend }) => {
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  // 工具栏项
  const toolbarItems: ToolbarItemProps[] = [
    {
      type: 'image',
      icon: <PictureOutline />,
      title: '图片',
    },
    {
      type: 'voice',
      icon: <SoundOutline />,
      title: '语音',
    },
    {
      type: 'emoji',
      icon: <SmileOutline />,
      title: '表情',
    },
  ];

  // 处理工具栏项点击
  const handleToolbarClick = (item: ToolbarItemProps) => {
    switch (item.type) {
      case 'image':
        setVisible(true);
        break;
      case 'voice':
        Toast.show({
          content: '语音功能开发中...',
          position: 'bottom',
        });
        break;
      case 'emoji':
        Toast.show({
          content: '表情功能开发中...',
          position: 'bottom',
        });
        break;
      default:
        break;
    }
  };

  // 模拟上传图片
  const mockUpload = async (file: File): Promise<{ url: string }> => {
    setUploading(true);
    try {
      // 在实际应用中，这里应该是真实的上传逻辑
      // 这里我们使用 FileReader 来模拟上传并获取图片的 base64 编码
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setTimeout(() => {
            resolve({ url: reader.result as string });
            setUploading(false);
          }, 1500); // 模拟上传延迟
        };
      });
    } catch (error) {
      setUploading(false);
      Toast.show({
        content: '上传失败',
        position: 'bottom',
      });
      throw error;
    }
  };

  // 处理图片上传完成
  const handleImageUploadComplete = () => {
    if (fileList.length > 0 && fileList[0].url) {
      // 发送图片消息
      onSend('image', { picUrl: fileList[0].url });
      // 清空文件列表
      setFileList([]);
      // 关闭上传对话框
      setVisible(false);
    }
  };

  return (
    <>
      <Toolbar items={toolbarItems} onClick={handleToolbarClick} />
      
      <Dialog
        visible={visible}
        title="发送图片"
        content={
          <div style={{ padding: '20px 0' }}>
            <ImageUploader
              value={fileList}
              onChange={setFileList}
              upload={mockUpload}
              multiple={false}
              maxCount={1}
              showUpload={fileList.length < 1}
              onDelete={() => setFileList([])}
            />
          </div>
        }
        closeOnAction
        onClose={() => setVisible(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
          },
          {
            key: 'send',
            text: '发送',
            disabled: fileList.length === 0 || uploading,
            bold: true,
            onClick: handleImageUploadComplete,
          },
        ]}
      />
    </>
  );
};

export default ChatToolbar;
