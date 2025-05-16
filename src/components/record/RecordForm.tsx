import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import { CreateRecordDto, RecordResponseDto, RecordType } from '@/types/models';

// 睡眠记录表单
const SleepRecordForm: React.FC<{
  details: Record<string, any>;
  setDetails: (details: Record<string, any>) => void;
  colors: any;
}> = ({ details, setDetails, colors }) => {
  return (
    <View style={styles.detailsForm}>
      <Text style={[styles.detailsTitle, { color: colors.text }]}>
        睡眠详情
      </Text>
      <TextInput
        label="时长（小时）"
        placeholder="输入睡眠时长"
        value={details.duration as string}
        onChangeText={(text) =>
          setDetails({ ...details, duration: text })
        }
        keyboardType="numeric"
      />
      <View style={styles.select}>
        <Text style={[styles.label, { color: colors.text }]}>
          睡眠质量
        </Text>
        <View style={styles.buttonGroup}>
          {['good', 'fair', 'poor'].map((quality) => (
            <TouchableOpacity
              key={quality}
              style={[
                styles.selectButton,
                details.quality === quality && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() =>
                setDetails({ ...details, quality })
              }
            >
              <Text
                style={[
                  styles.selectButtonText,
                  details.quality === quality && { color: '#fff' },
                ]}
              >
                {quality === 'good' ? '良好' : quality === 'fair' ? '一般' : '较差'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// 喂食记录表单
const FeedingRecordForm: React.FC<{
  details: Record<string, any>;
  setDetails: (details: Record<string, any>) => void;
  colors: any;
}> = ({ details, setDetails, colors }) => {
  return (
    <View style={styles.detailsForm}>
      <Text style={[styles.detailsTitle, { color: colors.text }]}>
        喂食详情
      </Text>
      <View style={styles.row}>
        <TextInput
          label="数量"
          placeholder="输入数量"
          value={details.amount as string}
          onChangeText={(text) =>
            setDetails({ ...details, amount: text })
          }
          keyboardType="numeric"
          containerStyle={styles.input}
        />
        <View style={styles.select}>
          <Text style={[styles.label, { color: colors.text }]}>单位</Text>
          <View style={styles.buttonGroup}>
            {['oz', 'ml'].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.selectButton,
                  details.unit === unit && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() =>
                  setDetails({ ...details, unit })
                }
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    details.unit === unit && { color: '#fff' },
                  ]}
                >
                  {unit.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.select}>
        <Text style={[styles.label, { color: colors.text }]}>类型</Text>
        <View style={styles.buttonGroup}>
          {['formula', 'breast milk', 'solid food'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.selectButton,
                details.type === type && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setDetails({ ...details, type })}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  details.type === type && { color: '#fff' },
                ]}
              >
                {type === 'formula' ? '配方奶' : type === 'breast milk' ? '母乳' : '固体食物'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// 尿布记录表单
const DiaperRecordForm: React.FC<{
  details: Record<string, any>;
  setDetails: (details: Record<string, any>) => void;
  colors: any;
}> = ({ details, setDetails, colors }) => {
  return (
    <View style={styles.detailsForm}>
      <Text style={[styles.detailsTitle, { color: colors.text }]}>
        尿布详情
      </Text>
      <View style={styles.select}>
        <Text style={[styles.label, { color: colors.text }]}>类型</Text>
        <View style={styles.buttonGroup}>
          {['wet', 'dirty', 'both'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.selectButton,
                details.type === type && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setDetails({ ...details, type })}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  details.type === type && { color: '#fff' },
                ]}
              >
                {type === 'wet' ? '尿湿' : type === 'dirty' ? '便便' : '两者都有'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.select}>
        <Text style={[styles.label, { color: colors.text }]}>
          状态
        </Text>
        <View style={styles.buttonGroup}>
          {['normal', 'loose', 'hard'].map((consistency) => (
            <TouchableOpacity
              key={consistency}
              style={[
                styles.selectButton,
                details.consistency === consistency && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() =>
                setDetails({ ...details, consistency })
              }
            >
              <Text
                style={[
                  styles.selectButtonText,
                  details.consistency === consistency && {
                    color: '#fff',
                  },
                ]}
              >
                {consistency === 'normal' ? '正常' : consistency === 'loose' ? '稀软' : '硬结'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// 笔记记录表单
const NoteRecordForm: React.FC<{
  details: Record<string, any>;
  setDetails: (details: Record<string, any>) => void;
  colors: any;
}> = ({ details, setDetails, colors }) => {
  return (
    <View style={styles.detailsForm}>
      <Text style={[styles.detailsTitle, { color: colors.text }]}>
        笔记详情
      </Text>
      <TextInput
        label="内容"
        placeholder="输入笔记内容"
        value={details.content as string}
        onChangeText={(text) =>
          setDetails({ ...details, content: text })
        }
        multiline
        containerStyle={styles.noteInput}
      />
    </View>
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
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
        return <FeedingRecordForm details={details} setDetails={setDetails} colors={colors} />;
      case 'Sleep':
        return <SleepRecordForm details={details} setDetails={setDetails} colors={colors} />;
      case 'Diaper':
        return <DiaperRecordForm details={details} setDetails={setDetails} colors={colors} />;
      case 'Note':
        return <NoteRecordForm details={details} setDetails={setDetails} colors={colors} />;
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!recordType) return;

    // 如果是笔记类型，确保将noteText保存到details中
    if (recordType === 'Note' && !details.content) {
      setDetails({...details, content: noteText});
    }

    // 构建记录数据
    const recordData: CreateRecordDto = {
      childId,
      recordType,
      recordTimestamp: new Date().toISOString(),
      details: {
        ...details,
        note: noteText
      },
    };

    onSubmit(recordData);
  };

  return (
    <ScrollView style={styles.container}>
      {getDetailsForm()}

      <TextInput
        placeholder={
          recordType === 'Note'
            ? "记录孩子的情况..."
            : '额外备注（可选）'
        }
        value={noteText}
        onChangeText={setNoteText}
        multiline
        containerStyle={styles.noteInput}
      />

      <View style={styles.buttons}>
        <Button
          title="取消"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="保存"
          onPress={handleSubmit}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  detailsForm: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
  },
  select: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  noteInput: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default RecordForm;
