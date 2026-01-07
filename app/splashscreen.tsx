import { initDatabase } from '@/database/db';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const [dbReady, setDbReady] = useState(false);

  // 1️⃣ DB init (always called)
  useEffect(() => {
    try {
      initDatabase();
      setDbReady(true);
    } catch (err) {
      console.error('DB init failed', err);
    }
  }, []);

  // 2️⃣ Navigation (always called)
  useEffect(() => {
    if (!dbReady) return;

    const t = setTimeout(() => {
      router.replace('/Login');
    }, 1500);

    return () => clearTimeout(t);
  }, [dbReady]);

  // 3️⃣ Conditional render AFTER hooks
  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      <Text style={styles.subtitle}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a7ea4' },
  title: { color: '#fff', fontSize: 32, fontWeight: '700' },
  subtitle: { color: '#fff', marginTop: 8 },
});
