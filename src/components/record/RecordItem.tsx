import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { RecordResponseDto, RecordType } from '@/types/models';
import { format } from 'date-fns';
import { Utensils, Moon, Baby, FileText } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface RecordItemProps {
  record: RecordResponseDto;
  onPress?: (record: RecordResponseDto) => void;
}

const getRecordIcon = (type: RecordType, color: string) => {
  switch (type) {
    case 'Sleep':
      return <Moon size={20} color={color} />;
    case 'Feeding':
      return <Utensils size={20} color={color} />;
    case 'Diaper':
      return <Baby size={20} color={color} />;
    case 'Note':
      return <FileText size={20} color={color} />;
  }
};

const getRecordColor = (type: RecordType, colors: any) => {
  switch (type) {
    case 'Sleep':
      return colors.secondary;
    case 'Feeding':
      return colors.primary;
    case 'Diaper':
      return colors.accent;
    case 'Note':
      return colors.text;
  }
};

const getRecordTitle = (type: RecordType) => {
  return type;
};

const getRecordSummary = (record: RecordResponseDto) => {
  const { recordType, details } = record;
  
  switch (recordType) {
    case 'Sleep':
      return details.duration ? `睡眠时长: ${details.duration}小时, 质量: ${details.quality || '未记录'}` : '睡眠记录';
    case 'Feeding':
      return details.amount ? `${details.type || '喂食'}: ${details.amount}${details.unit || ''}` : '喂食记录';
    case 'Diaper':
      return `尿布类型: ${details.type || '未记录'}, 状态: ${details.consistency || '未记录'}`;
    case 'Note':
      return details.content || '备注记录';
    default:
      return '日常记录';
  }
};

export const RecordItem: React.FC<RecordItemProps> = ({ record, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const recordColor = getRecordColor(record.recordType, colors);
  
  const formattedTime = format(new Date(record.recordTimestamp), 'HH:mm');
  const formattedDate = format(new Date(record.recordTimestamp), 'yyyy-MM-dd');

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(record)}
    >
      <View style={[styles.iconContainer, { backgroundColor: recordColor }]}>
        {getRecordIcon(record.recordType, '#fff')}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {getRecordTitle(record.recordType)}
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {formattedTime}
          </Text>
        </View>
        <Text style={[styles.summary, { color: colors.textSecondary }]}>
          {getRecordSummary(record)}
        </Text>
        <Text style={[styles.date, { color: colors.textTertiary }]}>
          {formattedDate}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
  },
  summary: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
});

export default RecordItem;
