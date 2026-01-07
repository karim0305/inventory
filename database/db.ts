import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('inv.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      purchasePrice REAL NOT NULL,
      salePrice REAL NOT NULL,
      expiry TEXT,
      status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
      image TEXT
    );
  `);
}
