import { Stack } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function AuthLayout() {
  useFrameworkReady();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}