import React, { useState, useEffect } from 'react';
import {
  List,
  Modal,
  Toast,
  DotLoading,
  SafeArea,
  Button,
  NavBar,
} from 'antd-mobile';
import { Icon } from '@iconify/react';
import RecordButton from '@/components/record/RecordButton';
import {
  RecordResponseDto,
  RecordType,
  CreateRecordDto,
  UpdateRecordDto,
} from '@/types/models';
import {
  createRecord,
  getRecordsByChildId,
  updateRecord,
  // deleteRecord, // 暂时注释掉未使用的导入
} from '@/api/records';
import RecordItem from '@/components/record/RecordItem';
import RecordForm from '@/components/record/RecordForm';

import './Record.css'; // 假设我们会创建一个对应的 CSS 文件

export default function RecordsScreen() {
  // 状态管理
  const [records, setRecords] = useState<RecordResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<RecordType | null>(null);
  const [selectedChildId] = useState<number>(1); // 默认选择第一个孩子，实际应从全局状态或路由参数获取
  const [selectedRecord, setSelectedRecord] = useState<
    RecordResponseDto | undefined
  >(undefined);
  const [isEditing, setIsEditing] = useState(false);

  // 加载记录数据
  useEffect(() => {
    fetchRecords();
  }, [selectedChildId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 获取特定孩子的所有记录
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await getRecordsByChildId(selectedChildId);
      setRecords(response);
    } catch (error) {
      console.error('获取记录失败:', error);
      Toast.show({
        content: '获取记录失败，请稍后再试',
        icon: 'fail',
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理快速记录按钮点击
  const handleQuickLog = (type: RecordType) => {
    setRecordType(type);
    setIsEditing(false);
    setSelectedRecord(undefined);
    setModalVisible(true);
  };

  // 处理记录项点击
  const handleRecordPress = (record: RecordResponseDto) => {
    setSelectedRecord(record);
    setRecordType(record.recordType);
    setIsEditing(true);
    setModalVisible(true);
  };

  // 处理记录提交（创建或更新）
  const handleSubmitRecord = async (recordData: CreateRecordDto) => {
    try {
      setLoading(true);

      if (isEditing && selectedRecord) {
        // 更新现有记录
        const updateData: UpdateRecordDto = {
          recordType: recordData.recordType,
          recordTimestamp: recordData.recordTimestamp,
          details: recordData.details,
        };

        await updateRecord(selectedRecord.id, updateData);
      } else {
        // 创建新记录
        await createRecord(recordData);
      }

      // 重新获取记录列表
      await fetchRecords();

      // 关闭模态框并重置状态
      setModalVisible(false);
      setRecordType(null);
      setSelectedRecord(undefined);
      setIsEditing(false);
    } catch (error) {
      console.error('保存记录失败:', error);
      Toast.show({
        content: '保存记录失败，请稍后再试',
        icon: 'fail',
      });
    } finally {
      setLoading(false);
    }
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setModalVisible(false);
    setRecordType(null);
    setSelectedRecord(undefined);
    setIsEditing(false);
  };

  return (
    <div className="record-container">
      <SafeArea position="top" />
      <NavBar className="record-header" back={null}>
        日常记录
      </NavBar>

      <div className="quick-buttons-container">
        <RecordButton
          title="喂食"
          icon={<Icon icon="mdi:silverware" width={24} />}
          onPress={() => handleQuickLog('Feeding')}
          color="primary"
        />
        <RecordButton
          title="睡眠"
          icon={<Icon icon="mdi:sleep" width={24} />}
          onPress={() => handleQuickLog('Sleep')}
          color="warning"
        />
        <RecordButton
          title="尿布"
          icon={<Icon icon="mdi:information-outline" width={24} />}
          onPress={() => handleQuickLog('Diaper')}
          color="success"
        />
      </div>

      <Button
        className="add-note-button"
        color="primary"
        onClick={() => handleQuickLog('Note')}
        icon={<Icon icon="mdi:file-outline" width={24} />}
        shape="circle"
        size="large"
      />

      <div className="timeline-header">
        <h2 className="timeline-title">时间线</h2>
      </div>

      {loading ? (
        <div className="loading-container">
          <DotLoading color="primary" />
          <span className="loading-text">加载中...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="empty-container">
          <span className="empty-text">暂无记录，点击上方按钮添加</span>
        </div>
      ) : (
        <List className="record-list">
          {records.map((item: RecordResponseDto) => (
            <RecordItem
              key={item.id}
              record={item}
              onPress={handleRecordPress}
            />
          ))}
        </List>
      )}

      <Modal
        visible={modalVisible}
        onClose={handleCloseModal}
        closeOnMaskClick
        title={isEditing ? '编辑记录' : '添加记录'}
        closeIcon={<Icon icon="mdi:close" />}
        content={
          recordType && (
            <RecordForm
              recordType={recordType}
              childId={selectedChildId}
              initialRecord={selectedRecord}
              onSubmit={handleSubmitRecord}
              onCancel={handleCloseModal}
            />
          )
        }
      />
    </div>
  );
}

// 以下是建议创建的 Record.css 文件内容
/*
.record-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--adm-color-background);
}

.record-header {
  font-weight: 500;
}

.quick-buttons-container {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  flex-wrap: wrap;
}

.add-note-button {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.timeline-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--adm-color-border);
  margin-top: 16px;
}

.timeline-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--adm-color-weak);
}

.loading-text,
.empty-text {
  margin-top: 12px;
}

.record-list {
  margin-bottom: 80px;
}
*/
