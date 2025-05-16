import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import RecordButton from '@/components/RecordButton';
import { Utensils, Moon, Baby, Plus, X, FileText } from 'lucide-react-native';
import { 
  RecordResponseDto, 
  RecordType,
  CreateRecordDto,
  UpdateRecordDto 
} from '@/types/models';
import { 
  createRecord, 
  getRecordsByChildId, 
  updateRecord,
  deleteRecord 
} from '@/api/records';
import RecordItem from '@/components/record/RecordItem';
import RecordForm from '@/components/record/RecordForm';

export default function RecordsScreen() {
  // 状态管理
  const [records, setRecords] = useState<RecordResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<RecordType | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number>(1); // 默认选择第一个孩子，实际应从全局状态或路由参数获取
  const [selectedRecord, setSelectedRecord] = useState<RecordResponseDto | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // 加载记录数据
  useEffect(() => {
    fetchRecords();
  }, [selectedChildId]);

  // 获取特定孩子的所有记录
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await getRecordsByChildId(selectedChildId);
      setRecords(response.data);
    } catch (error) {
      console.error('获取记录失败:', error);
      Alert.alert('错误', '获取记录失败，请稍后再试');
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
          details: recordData.details
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
      Alert.alert('错误', '保存记录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 处理记录删除
  const handleDeleteRecord = async (recordId: number) => {
    try {
      setLoading(true);
      await deleteRecord(recordId);
      await fetchRecords();
      Alert.alert('成功', '记录已删除');
    } catch (error) {
      console.error('删除记录失败:', error);
      Alert.alert('错误', '删除记录失败，请稍后再试');
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          日常记录
        </Text>
      </View>

      <View style={styles.quickButtonsContainer}>
        <RecordButton
          title="喂食"
          icon={<Utensils size={24} color="#fff" />}
          onPress={() => handleQuickLog('Feeding')}
          color={colors.primary}
          style={styles.quickButton}
        />
        <RecordButton
          title="睡眠"
          icon={<Moon size={24} color="#fff" />}
          onPress={() => handleQuickLog('Sleep')}
          color={colors.secondary}
          style={styles.quickButton}
        />
        <RecordButton
          title="尿布"
          icon={<Baby size={24} color="#000" />}
          onPress={() => handleQuickLog('Diaper')}
          color={colors.accent}
          style={styles.quickButton}
        />
      </View>

      <TouchableOpacity
        style={[styles.addNoteButton, { backgroundColor: colors.primary }]}
        onPress={() => handleQuickLog('Note')}
      >
        <FileText size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.timelineHeader}>
        <Text style={[styles.timelineTitle, { color: colors.text }]}>
          时间线
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>加载中...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            暂无记录，点击上方按钮添加
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={({ item }) => (
            <RecordItem 
              record={item} 
              onPress={handleRecordPress}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.timeline}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isEditing ? '编辑记录' : '添加记录'}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {recordType && (
              <RecordForm
                recordType={recordType}
                childId={selectedChildId}
                initialRecord={selectedRecord}
                onSubmit={handleSubmitRecord}
                onCancel={handleCloseModal}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  quickButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  addNoteButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  timelineHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeline: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});
