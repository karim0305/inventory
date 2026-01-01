import { AppBar } from '@/components/app-bar';
import * as Print from 'expo-print';
import React, { useState } from 'react';
import { FlatList, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const products = [
  {
    id: '1',
    name: 'Apple',
    image: { uri: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=64&q=80' },
    price: '$2.99',
    expiry: '2026-02-01',
  },
  {
    id: '2',
    name: 'Banana',
    image: { uri: 'https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=64&q=80' },
    price: '$1.49',
    expiry: '2026-01-15',
  },
  {
    id: '3',
    name: 'Orange',
    image: { uri: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=64&q=80' },
    price: '$3.49',
    expiry: '2026-03-10',
  },
];

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const Sale = () => {
  // `selectedQty` keeps quantity per product id (0 or undefined means not selected)
  const [selected, setSelected] = useState<{ [key: string]: number }>({});
  const [query, setQuery] = useState('');
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [lastInvoiceMessage, setLastInvoiceMessage] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: prev[id] && prev[id] > 0 ? 0 : 1 }));
  };

  const increaseQty = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decreaseQty = (id: string) => {
    setSelected(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  // Get selected products (those with qty > 0)
  const selectedProducts = products.filter(p => (selected[p.id] || 0) > 0);
  const total = selectedProducts.reduce((sum, p) => sum + parseFloat(p.price.replace('$', '')) * (selected[p.id] || 0), 0);

  const handleSaleComplete = async () => {
    const date = new Date().toLocaleString();

    // Build items array using selected quantities and numeric price
    const items = selectedProducts.map(p => ({ product: { name: p.name }, quantity: selected[p.id] || 0, price: parseFloat(p.price.replace('$', '')) }));
    const invoiceTotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

    // Dynamic height depending on items (80mm base + 8mm per item)
    const pageHeight = 80 + items.length * 8;

    // Use jsPDF only on web via dynamic import to avoid bundler/runtime issues on native
    if (Platform.OS === 'web') {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, pageHeight] });

      // --- Header ---
      doc.setFontSize(12);
      doc.text('Sales Invoice', 40, 10, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`Date: ${date}`, 5, 18);

      // --- Table Header ---
      let y = 38;
      doc.setFontSize(9);
      doc.text('Product', 5, y);
      doc.text('Qty', 35, y);
      doc.text('Price', 48, y);
      doc.text('Total', 72, y, { align: 'right' });

      y += 4;
      doc.line(5, y, 75, y);

      // --- Items ---
      items.forEach((item) => {
        const lineTotal = item.quantity * item.price;
        y += 6;
        doc.text(String(item.product.name), 5, y);
        doc.text(String(item.quantity), 40, y, { align: 'right' });
        doc.text(item.price.toFixed(2), 55, y, { align: 'right' });
        doc.text(lineTotal.toFixed(2), 72, y, { align: 'right' });
      });

      y += 4;
      doc.line(5, y, 75, y);
      y += 8;

      // --- Totals ---
      doc.setFontSize(10);
      doc.text('Grand Total: ', 40, y);
      doc.text(invoiceTotal.toFixed(2), 72, y, { align: 'right' });

      y += 6;
      doc.text('Paid:', 40, y);
      doc.text('0.00', 72, y, { align: 'right' });

      y += 6;
      doc.text('Balance:', 40, y);
      doc.text(invoiceTotal.toFixed(2), 72, y, { align: 'right' });

      // --- Footer ---
      y += 15;
      doc.setFontSize(8);
      doc.text('Thank you for your purchase!', 40, y, { align: 'center' });

      // Convert to data URI and show preview modal (web)
      const url = doc.output('datauristring');
      setPdfUri(url);
      setLastInvoiceMessage(null);
      setPreviewVisible(true);
    } else {
      // Fallback on native: prepare a text invoice and show preview modal where user can print
      const lines = items.map(item => `${item.product.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
      const message = `Sale Invoice\nDate: ${date}\n\n${lines}\n\nTotal: $${invoiceTotal.toFixed(2)}`;
      setLastInvoiceMessage(message);
      setPdfUri(null);
      setPreviewVisible(true);
    }
  };

  const printWeb = () => {
    try {
      if (typeof document !== 'undefined') {
        const iframe = document.getElementById('invoice-preview-iframe') as HTMLIFrameElement | null;
        if (iframe?.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
      }
    } catch (e) {
      // ignore
      // eslint-disable-next-line no-console
      console.warn('Failed to print preview', e);
    }
  };

  const printNative = async () => {
    try {
      if (lastInvoiceMessage) {
        const html = `<pre style="font-family: monospace; white-space: pre-wrap;">${escapeHtml(lastInvoiceMessage)}</pre>`;
        await Print.printAsync({ html });
      } else if (pdfUri) {
        await Print.printAsync({ uri: pdfUri });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Print failed', e);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Sale" actionLabel="View Previous Bill" onActionPress={() => alert('Viewing previous bills...')} />
      <View style={styles.container}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products..."
          style={styles.searchInput}
          clearButtonMode="while-editing"
          accessibilityLabel="Search products"
        />
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          ListEmptyComponent={() => <Text style={styles.emptyText}>No products found</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.expiry}>Expiry: {item.expiry}</Text>
              </View>
              <View style={styles.qtyContainer}>
                {selected[item.id] ? (
                  <>
                    <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQty(item.id)}>
                      <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{selected[item.id]}</Text>
                    <TouchableOpacity style={styles.qtyButton} onPress={() => increaseQty(item.id)}>
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.cartButtonSmall} onPress={() => handleSelect(item.id)}>
                    <Text style={[styles.cartButtonText, { fontSize: 14, paddingHorizontal: 8 }]}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </View>
      {selectedProducts.length > 0 && (
        <View style={styles.cartBar}>
          <Text style={styles.cartBillTitle}>Cart Invoice</Text>
          <View style={styles.cartBillList}>
            {selectedProducts.map(p => (
              <View key={p.id} style={styles.cartBillRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.cartBillName}>{p.name}</Text>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQty(p.id)}>
                      <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{selected[p.id] || 0}</Text>
                    <TouchableOpacity style={styles.qtyButton} onPress={() => increaseQty(p.id)}>
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.cartBillPrice}>{`$${(parseFloat(p.price.replace('$', '')) * (selected[p.id] || 0)).toFixed(2)}`}</Text>
              </View>
            ))}
          </View>
          <View style={styles.cartSummary}>
            <Text style={styles.cartTotal}>Total: ${total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.cartButton} onPress={handleSaleComplete}>
              <Text style={styles.cartButtonText}>Sale Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {previewVisible && Platform.OS === 'web' && pdfUri && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: '80%', height: '80%', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <iframe id="invoice-preview-iframe" src={pdfUri} title="Invoice Preview" style={{ flex: 1, width: '100%', height: 'calc(100% - 56px)', border: 0 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 8 }}>
              <TouchableOpacity onPress={printWeb} style={{ padding: 12, backgroundColor: '#0a7ea4', borderRadius: 6, marginRight: 8 }}>
                <Text style={{ color: '#fff' }}>Print</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setPreviewVisible(false); setPdfUri(null); }} style={{ padding: 12, backgroundColor: '#9e9e9e', borderRadius: 6 }}>
                <Text style={{ color: '#fff' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {previewVisible && Platform.OS !== 'web' && (
        <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
          <View style={styles.nativePdfModal}>
            <Text style={styles.nativePdfText}>{lastInvoiceMessage ?? 'Invoice preview not available.'}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={printNative}>
              <Text style={styles.modalButtonText}>Print</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalClose} onPress={() => setPreviewVisible(false)}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fa',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#4caf50',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  expiry: {
    fontSize: 14,
    color: '#888',
  },
  checkbox: {
    marginLeft: 8,
    padding: 8,
  },
  checkOuter: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  checkInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#4caf50',
  },
  cartBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBillTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  cartBillList: {
    marginBottom: 8,
  },
  cartBillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartBillName: {
    fontSize: 16,
    color: '#333',
  },
  cartBillPrice: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  cartList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7fa',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  cartName: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 6,
  },
  cartPrice: {
    fontSize: 15,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  cartButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 12,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nativePdfModal: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  nativePdfText: {
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalClose: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cartButtonSmall: {
    backgroundColor: '#4caf50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyText: {
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default Sale;
