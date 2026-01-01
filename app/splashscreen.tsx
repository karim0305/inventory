import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      // go to Login and replace so user can't go back to splash
      router.replace('/Login')
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      <Text style={styles.subtitle}>Loading…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a7ea4' },
  title: { color: '#fff', fontSize: 32, fontWeight: '700' },
  subtitle: { color: '#fff', marginTop: 8 },
})
