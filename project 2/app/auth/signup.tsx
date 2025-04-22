import React, { useState } from 'react';
import { StyleSheet, Text, View, useColorScheme, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSignup = () => {
    // Validate input
    if (!email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate signup delay
    setTimeout(() => {
      // In a real app, you would make an API call to register
      setLoading(false);
      router.replace('/auth/create-profile');
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
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.gray[500] }]}>
              Join ParentAssist to track your child's development
            </Text>
          </View>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={loading}
              fullWidth
              style={styles.signupButton}
            />

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.gray[500] }]}>
                Already have an account?{' '}
              </Text>
              <Link href="/auth/login" asChild>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Sign In
                </Text>
              </Link>
            </View>
          </View>

          <View style={styles.legalContainer}>
            <Text style={[styles.legalText, { color: colors.gray[500] }]}>
              By signing up, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
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
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
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
  signupButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  legalContainer: {
    marginTop: 32,
  },
  legalText: {
    fontSize: 12,
    textAlign: 'center',
  },
});