import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AlertaGlobalProvider } from '@/components/AlertaGlobal';

function RootLayoutNav() {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    const dentroDasTabs = segments[0] === '(tabs)';
    if (!user && dentroDasTabs) {
      router.replace('/login');
    } else if (user && !dentroDasTabs) {
      router.replace('/');
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
      <AlertaGlobalProvider />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
