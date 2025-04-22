import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from 'react-native';

export default function CreateProfileScreen() {
  const [nickname, setNickname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [allergies, setAllergies] = useState('');
  const [moreInfo, setMoreInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleCreateProfile = () => {
    // Basic validation
    if (!nickname || !birthdate) {
      setError('Please provide a nickname and birthdate');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate profile creation
    setTimeout(() => {
      // In a real app, send data to backend
      setLoading(false);
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Child Information
            </Text>
            <Text style={[styles.subtitle, { color: colors.gray[500] }]}>
              Add your child's details to personalize the experience
            </Text>
          </View>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <TextInput
              label="Nickname"
              placeholder="Enter your child's nickname"
              value={nickname}
              onChangeText={setNickname}
            />

            <TextInput
              label="Date of Birth"
              placeholder="MM/DD/YYYY"
              value={birthdate}
              onChangeText={setBirthdate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
            <View style={[
              styles.pickerContainer, 
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              }
            ]}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Prefer not to say" value="not_specified" />
              </Picker>
            </View>

            <TextInput
              label="Allergy Information"
              placeholder="Please list each known allergen on a separate line"
              value={allergies}
              onChangeText={setAllergies}
              multiline
              containerStyle={styles.allergiesContainer}
            />
            <Text style={[styles.infoText, { color: colors.gray[500] }]}>
              Please be sure to fill in accurately. The AI assistant will refer to this when providing suggestions.
            </Text>

            <TextInput
              label="More Information (Optional)"
              placeholder="Add any other information you want the AI to know"
              value={moreInfo}
              onChangeText={setMoreInfo}
              multiline
            />
            <Text style={[styles.infoText, { color: colors.gray[500] }]}>
              You can add special habits, personality traits, routines, etc. Do not enter urgent health information.
            </Text>

            <Button
              title="Create Profile"
              onPress={handleCreateProfile}
              loading={loading}
              fullWidth
              style={styles.createButton}
            />
          </View>

          <View style={styles.disclaimerContainer}>
            <Text style={[styles.disclaimerText, { color: colors.gray[500] }]}>
              This information helps personalize our AI recommendations but cannot replace professional medical advice.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  allergiesContainer: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 16,
    marginTop: -8,
  },
  createButton: {
    marginTop: 16,
  },
  disclaimerContainer: {
    marginTop: 16,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});