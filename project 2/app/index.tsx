import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function IndexPage() {
  // For now, redirect to the login screen
  // In a real app, we'd check auth status here
  return <Redirect href="/auth/login" />;
}