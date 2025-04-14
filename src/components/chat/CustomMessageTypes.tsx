import React from 'react';
import { Bubble, BubbleProps } from '@chatui/core';
import { Image, Card, Space, Tag } from 'antd-mobile';

// 图片消息
export const ImageMessage: React.FC<BubbleProps> = (props) => {
  const { content } = props;
  return (
    <Bubble type="image">
      <Image 
        src={content.picUrl} 
        fit="cover" 
        width={200} 
        style={{ borderRadius: 10 }}
        onClick={() => {
          // 点击查看大图
          if (content.picUrl) {
            window.open(content.picUrl, '_blank');
          }
        }}
      />
    </Bubble>
  );
};

// 文章卡片消息
export const ArticleMessage: React.FC<BubbleProps> = (props) => {
  const { content } = props;
  return (
    <Bubble>
      <Card
        title={content.title}
        onClick={() => {
          if (content.url) {
            window.open(content.url, '_blank');
          }
        }}
        style={{ width: 240 }}
      >
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          {content.description}
        </div>
        {content.image && (
          <Image src={content.image} width="100%" fit="cover" style={{ borderRadius: 4 }} />
        )}
      </Card>
    </Bubble>
  );
};

// 推荐选项消息
export const RecommendMessage: React.FC<BubbleProps> = (props) => {
  const { content } = props;
  const { title, items } = content;
  
  return (
    <Bubble>
      <div style={{ width: 240 }}>
        {title && <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{title}</div>}
        <Space wrap>
          {items && items.map((item: any, index: number) => (
            <Tag
              key={index}
              color="primary"
              onClick={() => {
                if (props.onClick) {
                  props.onClick(item);
                }
              }}
            >
              {item.name}
            </Tag>
          ))}
        </Space>
      </div>
    </Bubble>
  );
};

// 系统消息
export const SystemMessage: React.FC<BubbleProps> = (props) => {
  const { content } = props;
  return (
    <div className="system-message" style={{ 
      textAlign: 'center', 
      margin: '10px 0',
      color: '#999',
      fontSize: '12px'
    }}>
      {content.text}
    </div>
  );
};
