import React from 'react';
import { Button } from 'antd-mobile';
import type { ButtonProps } from 'antd-mobile/es/components/button';

interface RecordButtonProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: ButtonProps['color'];
  style?: React.CSSProperties;
}

export default function RecordButton({
  title,
  icon,
  onPress,
  color = 'primary',
  style,
}: RecordButtonProps) {
  return (
    <div className="record-button" style={style}>
      <Button
        onClick={onPress}
        color={color}
        fill="none"
        className="record-button-inner"
      >
        <div className="record-button-icon">{icon}</div>
        <div className="record-button-title">{title}</div>
      </Button>
    </div>
  );
}

// 以下是建议添加到 CSS 文件中的样式
/*
.record-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 12px;
  min-width: 100px;
}

.record-button-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px;
}

.record-button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  margin-bottom: 8px;
}

.record-button-title {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}
*/
