import { AppBar } from '@/components/app-bar';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ProfileData = {
  name: string;
  shopName: string;
  password: string;
  logoUrl?: string;
  contact?: string;
  address?: string;
};

const initialProfile: ProfileData = {
  name: 'John Doe',
  shopName: 'My Shop',
  password: '',
  logoUrl: '',
  contact: '',
  address: '',
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [editing, setEditing] = useState(false);

  // form state
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [password, setPassword] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');

  const openEdit = () => {
    setName(profile.name);
    setShopName(profile.shopName);
    setPassword(profile.password);
    setLogoUrl(profile.logoUrl ?? '');
    setContact(profile.contact ?? '');
    setAddress(profile.address ?? '');
    setEditing(true);
  };

  const saveProfile = () => {
    if (!name.trim()) return Alert.alert('Validation', 'Name is required');
    setProfile({ name: name.trim(), shopName: shopName.trim(), password, logoUrl: logoUrl.trim(), contact: contact.trim(), address: address.trim() });
    setEditing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Profile" actionLabel="Edit Profile" onActionPress={openEdit} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarWrap}>
          {profile.logoUrl ? (
            <Image source={{ uri: profile.logoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitials}>{profile.name.split(' ').map(n => n[0]).join('').slice(0,2)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.cameraBadge} onPress={openEdit} accessibilityLabel="Edit profile picture">
            <MaterialIcons name="photo-camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile.name}</Text>

          <Text style={styles.label}>Shop name</Text>
          <Text style={styles.value}>{profile.shopName}</Text>

          <Text style={styles.label}>Contact</Text>
          <Text style={styles.value}>{profile.contact || '-'}</Text>

          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{profile.address || '-'}</Text>
        </View>
      </ScrollView>

      <Modal visible={editing} animationType="slide" onRequestClose={() => setEditing(false)} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Shop name" value={shopName} onChangeText={setShopName} style={styles.input} />
            <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
            <TextInput placeholder="Logo image URL" value={logoUrl} onChangeText={setLogoUrl} style={styles.input} />
            <TextInput placeholder="Contact" value={contact} onChangeText={setContact} keyboardType="phone-pad" style={styles.input} />
            <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={[styles.input, { height: 80 }]} multiline />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  avatarWrap: { marginTop: 24, marginBottom: 12, position: 'relative' },
  avatar: { width: 128, height: 128, borderRadius: 64, backgroundColor: '#eee', borderWidth: 2, borderColor: '#0a7ea4' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 36, fontWeight: '700', color: '#333' },
  cameraBadge: { position: 'absolute', right: -6, bottom: -6, backgroundColor: '#0a7ea4', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  info: { marginTop: 16, width: '100%', paddingHorizontal: 12, borderWidth: 1, borderColor: '#e0e0e0', paddingVertical: 12, borderRadius: 8 },
  label: { color: '#666', fontSize: 14, marginTop: 12 },
  value: { fontSize: 18, fontWeight: '700', marginTop: 6 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveBtn: { backgroundColor: '#0a7ea4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  saveText: { color: '#fff' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  cancelText: { color: '#333' },
});

export default Profile;
