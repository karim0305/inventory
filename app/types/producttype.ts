
type Product = {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  expiry: string; // ISO date or free text
  status: 'active' | 'inactive';
  image?: string; // optional image URL
};