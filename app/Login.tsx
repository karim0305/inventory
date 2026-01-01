import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  // signup modal state
  const [signupVisible, setSignupVisible] = useState(false)
  const [name, setName] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [expiry, setExpiry] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<'active'|'inactive'>('active')

  const handleLogin = () => {
    // simple client-side 'login' placeholder
    router.replace('/(tabs)')
  }

  const openSignup = () => {
    setName('')
    setPurchasePrice('')
    setSalePrice('')
    setExpiry('')
    setImageUrl('')
    setStatus('active')
    setSignupVisible(true)
  }

  const handleSignupSave = () => {
    if (!name.trim()) return Alert.alert('Validation', 'Name is required')
    const purchase = parseFloat(purchasePrice)
    const sale = parseFloat(salePrice)
    if (Number.isNaN(purchase) || Number.isNaN(sale)) return Alert.alert('Validation', 'Enter valid prices')

    // Placeholder: just show success and close modal (persistence not implemented)
    Alert.alert('Signed up', `${name.trim()} was created.`)
    setSignupVisible(false)
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://placehold.co/96x96?text=Logo' }} style={styles.logo} />
      <Text style={styles.title}>Welcome back</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.ghostButton]} onPress={openSignup}>
        <Text style={[styles.buttonText, styles.ghostButtonText]}>Sign up</Text>
      </TouchableOpacity>

      <Modal visible={signupVisible} animationType="slide" transparent onRequestClose={() => setSignupVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign up</Text>
            <ScrollView>
              <TextInput placeholder="Product name" value={name} onChangeText={setName} style={styles.input} />
              <TextInput placeholder="Purchase price" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="numeric" style={styles.input} />
              <TextInput placeholder="Sale price" value={salePrice} onChangeText={setSalePrice} keyboardType="numeric" style={styles.input} />
              <TextInput placeholder="Expiry (YYYY-MM-DD)" value={expiry} onChangeText={setExpiry} style={styles.input} />
              <TextInput placeholder="Image URL (online)" value={imageUrl} onChangeText={setImageUrl} style={styles.input} />

              <View style={styles.rowInline}>
                <TouchableOpacity onPress={() => setStatus('active')} style={[styles.statusBtn, status === 'active' && styles.statusBtnActive]}>
                  <Text style={status === 'active' ? styles.statusBtnTextActive : styles.statusBtnText}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStatus('inactive')} style={[styles.statusBtn, status === 'inactive' && styles.statusBtnActive]}>
                  <Text style={status === 'inactive' ? styles.statusBtnTextActive : styles.statusBtnText}>Inactive</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSignupSave}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSignupVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#0a7ea4', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  ghostButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#0a7ea4' },
  ghostButtonText: { color: '#0a7ea4' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  rowInline: { flexDirection: 'row', marginBottom: 12 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginRight: 8 },
  statusBtnActive: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  statusBtnText: { color: '#333' },
  statusBtnTextActive: { color: '#fff' },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  saveBtn: { backgroundColor: '#0a7ea4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  saveText: { color: '#fff' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  cancelText: { color: '#333' },
  logo: { width: 96, height: 96, borderRadius: 16, alignSelf: 'center', marginBottom: 12 },
})
