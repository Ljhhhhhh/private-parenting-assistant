import React from 'react';
import { Card } from 'antd-mobile';
import { RecordResponseDto, RecordType } from '@/types/models';
import { format } from 'date-fns';
import { Icon } from '@iconify/react';

import './RecordItem.css'; // 假设我们会创建一个对应的 CSS 文件

interface RecordItemProps {
  record: RecordResponseDto;
  onPress?: (record: RecordResponseDto) => void;
}

const getRecordIcon = (type: RecordType) => {
  switch (type) {
    case 'Sleep':
      return <Icon icon="mdi:eye-outline" width={20} />;
    case 'Feeding':
      return <Icon icon="mdi:shopping-outline" width={20} />;
    case 'Diaper':
      return <Icon icon="mdi:information-outline" width={20} />;
    case 'Note':
      return <Icon icon="mdi:file-outline" width={20} />;
  }
};

const getRecordColor = (type: RecordType) => {
  switch (type) {
    case 'Sleep':
      return 'warning';
    case 'Feeding':
      return 'primary';
    case 'Diaper':
      return 'success';
    case 'Note':
      return 'default';
  }
};

const getRecordTitle = (type: RecordType) => {
  return type;
};

const getRecordSummary = (record: RecordResponseDto) => {
  const { recordType, details } = record;

  switch (recordType) {
    case 'Sleep':
      return details.duration
        ? `睡眠时长: ${details.duration}小时, 质量: ${
            details.quality || '未记录'
          }`
        : '睡眠记录';
    case 'Feeding':
      return details.amount
        ? `${details.type || '喂食'}: ${details.amount}${details.unit || ''}`
        : '喂食记录';
    case 'Diaper':
      return `尿布类型: ${details.type || '未记录'}, 状态: ${
        details.consistency || '未记录'
      }`;
    case 'Note':
      return details.content || '备注记录';
    default:
      return '日常记录';
  }
};

export const RecordItem: React.FC<RecordItemProps> = ({ record, onPress }) => {
  const recordColor = getRecordColor(record.recordType);

  const formattedTime = format(new Date(record.recordTimestamp), 'HH:mm');
  const formattedDate = format(new Date(record.recordTimestamp), 'yyyy-MM-dd');

  return (
    <Card className="record-item" onClick={() => onPress && onPress(record)}>
      <div className="record-item-content">
        <div className={`record-icon-container record-color-${recordColor}`}>
          {getRecordIcon(record.recordType)}
        </div>
        <div className="record-content">
          <div className="record-header">
            <span className="record-title">
              {getRecordTitle(record.recordType)}
            </span>
            <span className="record-time">{formattedTime}</span>
          </div>
          <div className="record-summary">{getRecordSummary(record)}</div>
          <div className="record-date">{formattedDate}</div>
        </div>
      </div>
    </Card>
  );
};

export default RecordItem;
