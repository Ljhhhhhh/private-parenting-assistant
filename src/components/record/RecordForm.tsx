import React, { useState, useEffect } from 'react';
import { Form, Input, Radio, Button, Space, Divider } from 'antd-mobile';
import { CreateRecordDto, RecordResponseDto, RecordType } from '@/types/models';

import './RecordForm.css'; // 假设我们会创建一个对应的 CSS 文件

// 睡眠记录表单
const SleepRecordForm: React.FC<{
  details: Record<string, any>;
  setDetails: (details: Record<string, any>) => void;
}> = ({ details, setDetails }) => {
  return (
    <div className="details-form">
      <h3 className="details-title">睡眠详情</h3>

      <Form.Item label="时长（小时）">
        <Input
          placeholder="输入睡眠时长"
          value={details.duration as string}
          onChange={(value: string) =>
            setDetails({ ...details, duration: value })
          }
          type="number"
        />
      </Form.Item>

      <Form.Item label="睡眠质量">
        <Radio.Group
          value={details.quality || 'fair'}
          onChange={(value: string) =>
            setDetails({ ...details, quality: value })
          }
        >
          <Space direction="horizontal" wrap>
            <Radio value="good">良好</Radio>
            <Radio value="fair">一般</Radio>
            <Radio value="poor">较差</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
    </div>
  );
};

// 喂食记录表单
const FeedingRecordForm: React.FC<{
  details: Record<string, any>;
  setDetails: (details: Record<string, any>) => void;
}> = ({ details, setDetails }) => {
  return (
    <div className="details-form">
      <h3 className="details-title">喂食详情</h3>

      <div className="form-row">
        <Form.Item label="数量" className="form-item-flex">
          <Input
            placeholder="输入数量"
            value={details.amount as string}
            onChange={(value: string) =>
              setDetails({ ...details, amount: value })
            }
            type="number"
          />
        </Form.Item>

        <Form.Item label="单位" className="form-item-flex">
          <Radio.Group
            value={details.unit || 'ml'}
            onChange={(value: string) =>
              setDetails({ ...details, unit: value })
            }
          >
            <Space direction="horizontal">
              <Radio value="oz">OZ</Radio>
              <Radio value="ml">ML</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </div>

      <Form.Item label="类型">
        <Radio.Group
          value={details.type || 'formula'}
          onChange={(value: string) => setDetails({ ...details, type: value })}
        >
          <Space direction="horizontal" wrap>
            <Radio value="formula">配方奶</Radio>
            <Radio value="breast milk">母乳</Radio>
            <Radio value="solid food">固体食物</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
    </div>
  );
};

// 尿布记录表单
const DiaperRecordForm: React.FC<{
  details: Record<string, any>;
  setDetails: (details: Record<string, any>) => void;
}> = ({ details, setDetails }) => {
  return (
    <div className="details-form">
      <h3 className="details-title">尿布详情</h3>

      <Form.Item label="类型">
        <Radio.Group
          value={details.type || 'wet'}
          onChange={(value: string) => setDetails({ ...details, type: value })}
        >
          <Space direction="horizontal" wrap>
            <Radio value="wet">尿湿</Radio>
            <Radio value="dirty">便便</Radio>
            <Radio value="both">两者都有</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="状态">
        <Radio.Group
          value={details.consistency || 'normal'}
          onChange={(value: string) =>
            setDetails({ ...details, consistency: value })
          }
        >
          <Space direction="horizontal" wrap>
            <Radio value="normal">正常</Radio>
            <Radio value="loose">稀软</Radio>
            <Radio value="hard">硬结</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
    </div>
  );
};

// 笔记记录表单
const NoteRecordForm: React.FC<{
  details: Record<string, any>;
  setDetails: (details: Record<string, any>) => void;
}> = ({ details, setDetails }) => {
  return (
    <div className="details-form">
      <h3 className="details-title">笔记详情</h3>

      <Form.Item label="内容">
        <Input.TextArea
          placeholder="输入笔记内容"
          value={details.content as string}
          onChange={(value: string) =>
            setDetails({ ...details, content: value })
          }
          rows={4}
        />
      </Form.Item>
    </div>
  );
};

interface RecordFormProps {
  recordType: RecordType | null;
  childId: number;
  initialRecord?: RecordResponseDto;
  onSubmit: (record: CreateRecordDto) => void;
  onCancel: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({
  recordType,
  childId,
  initialRecord,
  onSubmit,
  onCancel,
}) => {
  const [details, setDetails] = useState<Record<string, any>>({});
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (initialRecord) {
      setDetails(initialRecord.details || {});
      setNoteText(initialRecord.details.note || '');
    } else {
      setDetails({});
      setNoteText('');
    }
  }, [initialRecord, recordType]);

  const getDetailsForm = () => {
    if (!recordType) return null;

    switch (recordType) {
      case 'Feeding':
        return <FeedingRecordForm details={details} setDetails={setDetails} />;
      case 'Sleep':
        return <SleepRecordForm details={details} setDetails={setDetails} />;
      case 'Diaper':
        return <DiaperRecordForm details={details} setDetails={setDetails} />;
      case 'Note':
        return <NoteRecordForm details={details} setDetails={setDetails} />;
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!recordType) return;

    // 如果是笔记类型，确保将noteText保存到details中
    if (recordType === 'Note' && !details.content) {
      setDetails({ ...details, content: noteText });
    }

    // 构建记录数据
    const recordData: CreateRecordDto = {
      childId,
      recordType,
      recordTimestamp: new Date().toISOString(),
      details: {
        ...details,
        note: noteText,
      },
    };

    onSubmit(recordData);
  };

  return (
    <div className="record-form-container">
      <Form layout="horizontal">
        {getDetailsForm()}

        {recordType !== 'Note' && (
          <Form.Item label="备注" className="note-input">
            <Input.TextArea
              placeholder="额外备注（可选）"
              value={noteText}
              onChange={(value: string) => setNoteText(value)}
              rows={3}
            />
          </Form.Item>
        )}

        <Divider />

        <div className="form-buttons">
          <Space justify="between" style={{ width: '100%' }}>
            <Button color="default" fill="outline" onClick={onCancel}>
              取消
            </Button>
            <Button color="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

// 以下是建议创建的 RecordForm.css 文件内容
/*
.record-form-container {
  padding: 16px;
  background-color: var(--adm-color-background);
}

.details-form {
  margin-bottom: 16px;
}

.details-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--adm-color-text);
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.form-item-flex {
  flex: 1;
  min-width: 120px;
}

.note-input {
  margin-bottom: 16px;
}

.form-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
}
*/

export default RecordForm;
