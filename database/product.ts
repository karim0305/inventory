import { db } from '@/database/db';

type Product = {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  expiry: string; // ISO date or free text
  status: 'active' | 'inactive';
  image?: string; // optional image URL
};

// CREATE
export function addProduct(p: Product) {
  db.runSync(
    `
    INSERT INTO products
    (id, name, purchasePrice, salePrice, expiry, status, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      p.id,
      p.name,
      p.purchasePrice,
      p.salePrice,
      p.expiry,
      p.status,
      p.image ?? null,
    ]
  );
}

// READ
export function getAllProducts(): Product[] {
  return db.getAllSync<Product>('SELECT * FROM products ORDER BY name');
}

// UPDATE
export function updateProduct(p: Product) {
  db.runSync(
    `
    UPDATE products SET
      name = ?,
      purchasePrice = ?,
      salePrice = ?,
      expiry = ?,
      status = ?,
      image = ?
    WHERE id = ?
    `,
    [
      p.name,
      p.purchasePrice,
      p.salePrice,
      p.expiry,
      p.status,
      p.image ?? null,
      p.id,
    ]
  );
}

// DELETE
export function deleteProduct(id: string) {
  db.runSync('DELETE FROM products WHERE id = ?', [id]);
}
