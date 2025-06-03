-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  saldo TEXT DEFAULT '0.00',
  is_admin INTEGER DEFAULT 0,
  phone TEXT
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  compare_at_price REAL,
  cost_per_item REAL,
  vendor TEXT,
  product_type TEXT,
  status INTEGER NOT NULL DEFAULT 1,
  category TEXT,
  tags TEXT,
  sku TEXT,
  barcode TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  track_inventory INTEGER DEFAULT 0,
  images TEXT NOT NULL,
  sizes TEXT NOT NULL,
  size_range TEXT NOT NULL,
  colors TEXT NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  products TEXT NOT NULL,
  subtotal REAL NOT NULL,
  tip REAL NOT NULL,
  shipping TEXT NOT NULL,
  taxes REAL NOT NULL,
  total REAL NOT NULL
); 