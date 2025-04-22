import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  Modal, 
  TouchableOpacity, 
  useColorScheme,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import RecordButton from '../../components/RecordButton';
import LogItem, { LogEntry, LogType } from '../../components/LogItem';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { Utensils, Moon, Baby, Plus, X } from 'lucide-react-native';

// Sample data - in a real app, this would come from storage
const initialLogs: LogEntry[] = [
  {
    id: '1',
    type: 'feed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    note: 'Bottle feeding, 6oz formula',
    details: {
      amount: '6',
      unit: 'oz',
      type: 'formula'
    }
  },
  {
    id: '2',
    type: 'sleep',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    note: 'Afternoon nap, slept for 1.5 hours',
    details: {
      duration: '1.5',
      quality: 'good'
    }
  },
  {
    id: '3',
    type: 'diaper',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    note: 'Wet diaper',
    details: {
      type: 'wet',
      consistency: 'normal'
    }
  }
];

type RecordDetails = {
  feed: {
    amount: string;
    unit: 'oz' | 'ml';
    type: 'formula' | 'breast milk' | 'solid food';
  };
  sleep: {
    duration: string;
    quality: 'good' | 'fair' | 'poor';
  };
  diaper: {
    type: 'wet' | 'dirty' | 'both';
    consistency: 'normal' | 'loose' | 'hard';
  };
};

export default function RecordsScreen() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [recordType, setRecordType] = useState<LogType | null>(null);
  const [recordDetails, setRecordDetails] = useState<Partial<RecordDetails[keyof RecordDetails]>>({});
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleQuickLog = (type: LogType) => {
    setRecordType(type);
    setModalVisible(true);
  };

  const getDetailsForm = () => {
    if (!recordType) return null;

    switch (recordType) {
      case 'feed':
        return (
          <View style={styles.detailsForm}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>Feeding Details</Text>
            <View style={styles.row}>
              <TextInput
                label="Amount"
                placeholder="Enter amount"
                value={recordDetails.amount as string}
                onChangeText={(text) => setRecordDetails({ ...recordDetails, amount: text })}
                keyboardType="numeric"
                containerStyle={styles.input}
              />
              <View style={styles.select}>
                <Text style={[styles.label, { color: colors.text }]}>Unit</Text>
                <View style={styles.buttonGroup}>
                  {['oz', 'ml'].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.selectButton,
                        (recordDetails.unit === unit) && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setRecordDetails({ ...recordDetails, unit })}
                    >
                      <Text style={[
                        styles.selectButtonText,
                        (recordDetails.unit === unit) && { color: '#fff' },
                      ]}>
                        {unit.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.select}>
              <Text style={[styles.label, { color: colors.text }]}>Type</Text>
              <View style={styles.buttonGroup}>
                {['formula', 'breast milk', 'solid food'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.selectButton,
                      (recordDetails.type === type) && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setRecordDetails({ ...recordDetails, type })}
                  >
                    <Text style={[
                      styles.selectButtonText,
                      (recordDetails.type === type) && { color: '#fff' },
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'sleep':
        return (
          <View style={styles.detailsForm}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>Sleep Details</Text>
            <TextInput
              label="Duration (hours)"
              placeholder="Enter duration"
              value={recordDetails.duration as string}
              onChangeText={(text) => setRecordDetails({ ...recordDetails, duration: text })}
              keyboardType="numeric"
            />
            <View style={styles.select}>
              <Text style={[styles.label, { color: colors.text }]}>Sleep Quality</Text>
              <View style={styles.buttonGroup}>
                {['good', 'fair', 'poor'].map((quality) => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.selectButton,
                      (recordDetails.quality === quality) && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setRecordDetails({ ...recordDetails, quality })}
                  >
                    <Text style={[
                      styles.selectButtonText,
                      (recordDetails.quality === quality) && { color: '#fff' },
                    ]}>
                      {quality}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'diaper':
        return (
          <View style={styles.detailsForm}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>Diaper Details</Text>
            <View style={styles.select}>
              <Text style={[styles.label, { color: colors.text }]}>Type</Text>
              <View style={styles.buttonGroup}>
                {['wet', 'dirty', 'both'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.selectButton,
                      (recordDetails.type === type) && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setRecordDetails({ ...recordDetails, type })}
                  >
                    <Text style={[
                      styles.selectButtonText,
                      (recordDetails.type === type) && { color: '#fff' },
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.select}>
              <Text style={[styles.label, { color: colors.text }]}>Consistency</Text>
              <View style={styles.buttonGroup}>
                {['normal', 'loose', 'hard'].map((consistency) => (
                  <TouchableOpacity
                    key={consistency}
                    style={[
                      styles.selectButton,
                      (recordDetails.consistency === consistency) && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setRecordDetails({ ...recordDetails, consistency })}
                  >
                    <Text style={[
                      styles.selectButtonText,
                      (recordDetails.consistency === consistency) && { color: '#fff' },
                    ]}>
                      {consistency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!recordType) return;

    const newLog: LogEntry = {
      id: Date.now().toString(),
      type: recordType,
      timestamp: new Date(),
      note: noteText,
      details: recordDetails
    };
    
    setLogs([newLog, ...logs]);
    setNoteText('');
    setRecordDetails({});
    setRecordType(null);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Daily Records</Text>
      </View>
      
      <View style={styles.quickButtonsContainer}>
        <RecordButton
          title="Feed"
          icon={<Utensils size={24} color="#fff" />}
          onPress={() => handleQuickLog('feed')}
          color={colors.primary}
          style={styles.quickButton}
        />
        <RecordButton
          title="Sleep"
          icon={<Moon size={24} color="#fff" />}
          onPress={() => handleQuickLog('sleep')}
          color={colors.secondary}
          style={styles.quickButton}
        />
        <RecordButton
          title="Diaper"
          icon={<Baby size={24} color="#000" />}
          onPress={() => handleQuickLog('diaper')}
          color={colors.accent}
          style={styles.quickButton}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.addNoteButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          setRecordType('note');
          setModalVisible(true);
        }}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.timelineHeader}>
        <Text style={[styles.timelineTitle, { color: colors.text }]}>
          Timeline
        </Text>
      </View>
      
      <FlatList
        data={logs}
        renderItem={({ item }) => <LogItem entry={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.timeline}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View 
            style={[
              styles.modalContent, 
              { backgroundColor: colors.cardBackground }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {recordType === 'note' ? 'Add Note' : `Add ${recordType?.charAt(0).toUpperCase()}${recordType?.slice(1)} Record`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setRecordType(null);
                  setRecordDetails({});
                  setNoteText('');
                }}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {getDetailsForm()}
              
              <TextInput
                placeholder={recordType === 'note' ? "What's happening with your child?" : "Additional notes (optional)"}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                containerStyle={styles.noteInput}
              />
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setNoteText('');
                  setRecordDetails({});
                  setRecordType(null);
                  setModalVisible(false);
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleSubmit}
                style={styles.modalButton}
              />
            </View>
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
  modalScroll: {
    padding: 24,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 0,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});