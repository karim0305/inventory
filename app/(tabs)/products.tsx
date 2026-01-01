import { AppBar } from '@/components/app-bar';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Product = {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  expiry: string; // ISO date or free text
  status: 'active' | 'inactive';
  image?: string; // optional image URL
};

const initialProducts: Product[] = [
  { id: '1', name: 'Apple', purchasePrice: 1.2, salePrice: 2.99, expiry: '2026-02-01', status: 'active', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=64&q=80' },
  { id: '2', name: 'Banana', purchasePrice: 0.5, salePrice: 1.49, expiry: '2026-01-15', status: 'active', image: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=64&q=80' },
  { id: '3', name: 'Orange', purchasePrice: 1.5, salePrice: 3.49, expiry: '2026-03-10', status: 'inactive', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=64&q=80' },
];

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // form state
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [imageUrl, setImageUrl] = useState('');

  // search
  const [query, setQuery] = useState('');
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  const openAdd = () => {
    setEditing(null);
    setName('');
    setPurchasePrice('');
    setSalePrice('');
    setExpiry('');
    setStatus('active');
    setImageUrl('');
    setModalVisible(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setPurchasePrice(String(p.purchasePrice));
    setSalePrice(String(p.salePrice));
    setExpiry(p.expiry);
    setStatus(p.status);
    setImageUrl(p.image ?? '');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) return Alert.alert('Validation', 'Name is required');
    const purchase = parseFloat(purchasePrice);
    const sale = parseFloat(salePrice);
    if (Number.isNaN(purchase) || Number.isNaN(sale)) return Alert.alert('Validation', 'Enter valid prices');

    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, name: name.trim(), purchasePrice: purchase, salePrice: sale, expiry, status, image: imageUrl || undefined } : p));
    } else {
      const id = Date.now().toString();
      const newP: Product = { id, name: name.trim(), purchasePrice: purchase, salePrice: sale, expiry, status, image: imageUrl || undefined };
      setProducts(prev => [newP, ...prev]);
    }
    setModalVisible(false);
  };

  const handleDelete = (p: Product) => {
    Alert.alert('Delete', `Delete ${p.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setProducts(prev => prev.filter(x => x.id !== p.id)) },
    ]);
  };

  const toggleStatus = (p: Product) => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x));

  const totalCount = useMemo(() => products.length, [products]);

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Products" actionLabel="Add Product" onActionPress={openAdd} />

      <View style={styles.header}>
        
      </View>

      <TextInput value={query} onChangeText={setQuery} placeholder="Search products..." style={styles.searchInput} />

      <FlatList
        data={products}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>Buy: ${item.purchasePrice.toFixed(2)} • Sell: ${item.salePrice.toFixed(2)} • Exp: {item.expiry}</Text>
              <Text style={[styles.status, item.status === 'active' ? styles.active : styles.inactive]}>{item.status}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.editButton} onPress={() => openEdit(item)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleButton} onPress={() => toggleStatus(item)}>
                <Text style={styles.toggleText}>{item.status === 'active' ? 'Deactivate' : 'Activate'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Product' : 'Add Product'}</Text>

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
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerInfo: { color: '#666' },
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
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  rowInline: { flexDirection: 'row', marginBottom: 12 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginRight: 8 },
  statusBtnActive: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  statusBtnText: { color: '#333' },
  statusBtnTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveBtn: { backgroundColor: '#0a7ea4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  productImage: { width: 64, height: 64, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  searchInput: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginHorizontal: 16, marginBottom: 12 },
  saveText: { color: '#fff' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 8 },
  cancelText: { color: '#333' },
});

export default Products;
