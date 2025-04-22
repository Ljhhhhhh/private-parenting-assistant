import React, { useState } from 'react';
import { StyleSheet, Text, View, useColorScheme, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleLogin = () => {
    // Validate input
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate login delay
    setTimeout(() => {
      // In a real app, you would make an API call to authenticate
      setLoading(false);
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to ParentAssist
          </Text>
          <Text style={[styles.subtitle, { color: colors.gray[500] }]}>
            Sign in to continue
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.forgotPasswordContainer}>
            <Pressable onPress={() => router.push('/auth/forgot-password')}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.gray[500] }]}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/auth/signup')}>
              <Text style={[styles.signupLink, { color: colors.primary }]}>
                Sign Up
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.legalContainer}>
          <Text style={[styles.legalText, { color: colors.gray[500] }]}>
            By signing in, you agree to our{' '}
            <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
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