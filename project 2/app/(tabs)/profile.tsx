import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  useColorScheme,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { Baby, CreditCard as Edit2, Calendar, Merge as Allergens, Info, X } from 'lucide-react-native';

// Sample child data - in a real app, this would come from a database
const initialChildData = {
  nickname: 'Alex',
  birthdate: '08/20/2023',
  age: '8 months',
  gender: 'Male',
  allergies: 'Dairy\nEggs\nPeanuts',
  moreInfo: 'Alex enjoys tummy time and playing with soft toys. He\'s starting to crawl and is very curious about his surroundings. He has a consistent sleep schedule with naps at 10am and 2pm.'
};

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [childData, setChildData] = useState(initialChildData);
  const [editData, setEditData] = useState(initialChildData);
  const [error, setError] = useState<string | null>(null);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSave = () => {
    // Validate the data
    if (!editData.nickname || !editData.birthdate) {
      setError('Nickname and birthdate are required');
      return;
    }

    // Update the child data
    setChildData(editData);
    setModalVisible(false);
    setError(null);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditData(childData);
    setError(null);
  };

  const openModal = () => {
    setEditData(childData);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Child Profile</Text>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
            onPress={openModal}
          >
            <Edit2 size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[
              styles.avatar, 
              { backgroundColor: colors.primary + '20' }
            ]}>
              <Baby size={40} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {childData.nickname}
              </Text>
              <Text style={[styles.profileAge, { color: colors.gray[500] }]}>
                {childData.age}
              </Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Basic Information
          </Text>
        </View>
        
        <Card>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.gray[500] }]}>
                Date of Birth
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {childData.birthdate}
              </Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Info size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.gray[500] }]}>
                Gender
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {childData.gender}
              </Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Health Information
          </Text>
        </View>
        
        <Card style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <View style={styles.healthIcon}>
              <Allergens size={20} color={colors.error} />
            </View>
            <Text style={[styles.healthTitle, { color: colors.text }]}>
              Allergies
            </Text>
          </View>
          
          <View style={[
            styles.allergiesContainer, 
            { 
              backgroundColor: colors.error + '10',
              borderColor: colors.error + '30',
            }
          ]}>
            {childData.allergies.split('\n').map((allergy, index) => (
              <View 
                key={index} 
                style={[
                  styles.allergyItem, 
                  { backgroundColor: colors.error + '20' }
                ]}
              >
                <Text style={[styles.allergyText, { color: colors.error }]}>
                  {allergy}
                </Text>
              </View>
            ))}
          </View>
          
          <Text style={[styles.allergyNote, { color: colors.gray[500] }]}>
            Always consult with a healthcare professional about managing allergies.
          </Text>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Additional Information
          </Text>
        </View>
        
        <Card>
          <Text style={[styles.additionalInfo, { color: colors.text }]}>
            {childData.moreInfo}
          </Text>
        </Card>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Profile
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              )}

              <TextInput
                label="Nickname"
                value={editData.nickname}
                onChangeText={(text) => setEditData({ ...editData, nickname: text })}
                placeholder="Enter nickname"
              />

              <TextInput
                label="Date of Birth"
                value={editData.birthdate}
                onChangeText={(text) => setEditData({ ...editData, birthdate: text })}
                placeholder="MM/DD/YYYY"
              />

              <View style={styles.genderSelect}>
                <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
                <View style={styles.genderButtons}>
                  {['Male', 'Female', 'Prefer not to say'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderButton,
                        editData.gender === gender && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setEditData({ ...editData, gender })}
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          editData.gender === gender && { color: '#fff' },
                        ]}
                      >
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                label="Allergies"
                value={editData.allergies}
                onChangeText={(text) => setEditData({ ...editData, allergies: text })}
                placeholder="List allergies (one per line)"
                multiline
                containerStyle={styles.allergiesInput}
              />
              <Text style={[styles.helperText, { color: colors.gray[500] }]}>
                List each allergy on a new line. This information will be used by the AI assistant.
              </Text>

              <TextInput
                label="Additional Information"
                value={editData.moreInfo}
                onChangeText={(text) => setEditData({ ...editData, moreInfo: text })}
                placeholder="Add any additional information"
                multiline
                containerStyle={styles.moreInfoInput}
              />
              <Text style={[styles.helperText, { color: colors.gray[500] }]}>
                Include details about routines, preferences, and development milestones.
              </Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={closeModal}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Save Changes"
                onPress={handleSave}
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
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 16,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  healthCard: {
    marginBottom: 16,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthIcon: {
    marginRight: 8,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  allergyItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  allergyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  allergyNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  additionalInfo: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  genderSelect: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  allergiesInput: {
    height: 120,
  },
  moreInfoInput: {
    height: 120,
  },
  helperText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    fontStyle: 'italic',
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