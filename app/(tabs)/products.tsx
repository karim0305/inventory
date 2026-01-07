import { AppBar } from '@/components/app-bar';
import { addProduct, deleteProduct, getAllProducts, updateProduct } from '@/database/product';
import { randomUUID } from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import { Directory } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Product = {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  expiry: string;
  status: 'active' | 'inactive';
  image?: string;
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // form state
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  // search
  const [query, setQuery] = useState('');

  useEffect(() => {
    setProducts(getAllProducts());
  }, []);

  // ================= IMAGE FUNCTIONS =================

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };


  
  const saveImage = async (uri: string): Promise<string> => {
    const filename = uri.split('/').pop()!;
    const imagesDir = FileSystem.documentDirectory + 'images/';

    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }

    const newPath = imagesDir + filename;
    await FileSystem.copyAsync({ from: uri, to: newPath });

    return newPath;
  };

  // ================= CRUD =================

  const openAdd = () => {
    setEditing(null);
    setName('');
    setPurchasePrice('');
    setSalePrice('');
    setExpiry('');
    setStatus('active');
    setImageUrl(undefined);
    setModalVisible(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setPurchasePrice(String(p.purchasePrice));
    setSalePrice(String(p.salePrice));
    setExpiry(p.expiry);
    setStatus(p.status);
    setImageUrl(p.image);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }

    const purchase = parseFloat(purchasePrice);
    const sale = parseFloat(salePrice);

    if (Number.isNaN(purchase) || Number.isNaN(sale)) {
      Alert.alert('Validation', 'Enter valid prices');
      return;
    }

    let storedImage: string | undefined = undefined;

    if (imageUrl && imageUrl.startsWith('file://')) {
      storedImage = await saveImage(imageUrl);
    } else {
      storedImage = imageUrl;
    }

    if (editing) {
      updateProduct({
        ...editing,
        name: name.trim(),
        purchasePrice: purchase,
        salePrice: sale,
        expiry,
        status,
        image: storedImage,
      });
    } else {
      addProduct({
        id: randomUUID(),
        name: name.trim(),
        purchasePrice: purchase,
        salePrice: sale,
        expiry,
        status,
        image: storedImage,
      });
    }

    setProducts(getAllProducts());
    setModalVisible(false);
  };

  const handleDelete = (p: Product) => {
    Alert.alert('Delete', `Delete ${p.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProduct(p.id);
          setProducts(getAllProducts());
        },
      },
    ]);
  };

  const toggleStatus = (p: Product) => {
    updateProduct({
      ...p,
      status: p.status === 'active' ? 'inactive' : 'active',
    });
    setProducts(getAllProducts());
  };

  const filteredProducts = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );

  // ================= UI =================

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Products" actionLabel="Add Product" onActionPress={openAdd} />

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search products..."
        style={styles.searchInput}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.productImage} />
            ) : (
              <View style={styles.productImage} />
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                Buy: ${item.purchasePrice.toFixed(2)} • Sell: $
                {item.salePrice.toFixed(2)} • Exp: {item.expiry}
              </Text>
              <Text
                style={[
                  styles.status,
                  item.status === 'active' ? styles.active : styles.inactive,
                ]}
              >
                {item.status}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => toggleStatus(item)}
              >
                <Text style={styles.toggleText}>
                  {item.status === 'active' ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editing ? 'Edit Product' : 'Add Product'}
            </Text>

            <TextInput placeholder="Product name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Purchase price" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="numeric" style={styles.input} />
            <TextInput placeholder="Sale price" value={salePrice} onChangeText={setSalePrice} keyboardType="numeric" style={styles.input} />
            <TextInput placeholder="Expiry (YYYY-MM-DD)" value={expiry} onChangeText={setExpiry} style={styles.input} />

            <TouchableOpacity onPress={pickImage} style={styles.input}>
              <Text>{imageUrl ? 'Change Image' : 'Pick Image'}</Text>
            </TouchableOpacity>

            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={{ width: 100, height: 100, marginTop: 8 }} />
            )}

            <View style={styles.rowInline}>
              <TouchableOpacity
                onPress={() => setStatus('active')}
                style={[styles.statusBtn, status === 'active' && styles.statusBtnActive]}
              >
                <Text style={status === 'active' ? styles.statusBtnTextActive : styles.statusBtnText}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatus('inactive')}
                style={[styles.statusBtn, status === 'inactive' && styles.statusBtnActive]}
              >
                <Text style={status === 'inactive' ? styles.statusBtnTextActive : styles.statusBtnText}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
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
  row: { flexDirection: 'row', padding: 12, borderRadius: 12, backgroundColor: '#fff', marginBottom: 12, alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', marginTop: 4 },
  actions: { marginLeft: 12, alignItems: 'flex-end' },
  editButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#e0f2f1', borderRadius: 6, marginBottom: 6 },
  editText: { color: '#00796b' },
  deleteButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#ffebee', borderRadius: 6, marginBottom: 6 },
  deleteText: { color: '#c62828' },
  toggleButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#e3f2fd', borderRadius: 6 },
  toggleText: { color: '#1565c0' },
  status: { marginTop: 6, fontWeight: '600' },
  active: { color: '#388e3c' },
  inactive: { color: '#c62828' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, marginBottom: 8 },
  rowInline: { flexDirection: 'row', marginBottom: 12 },
  statusBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginRight: 8 },
  statusBtnActive: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  statusBtnText: { color: '#333' },
  statusBtnTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveBtn: { backgroundColor: '#0a7ea4', padding: 12, borderRadius: 8 },
  saveText: { color: '#fff' },
  cancelBtn: { padding: 12, marginLeft: 8 },
  cancelText: { color: '#333' },
  productImage: { width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  searchInput: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', margin: 16 },
});

export default Products;
