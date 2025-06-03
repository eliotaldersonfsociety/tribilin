CREATE TABLE IF NOT EXISTS epayco_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referenceCode TEXT NOT NULL UNIQUE,
  clerk_id TEXT NOT NULL,
  amount REAL NOT NULL,
  tax REAL NOT NULL,
  taxBase REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  status TEXT NOT NULL DEFAULT 'PENDING',
  transactionId TEXT,
  processingDate INTEGER,
  buyerEmail TEXT NOT NULL,
  buyerName TEXT NOT NULL,
  shippingAddress TEXT NOT NULL,
  shippingCity TEXT NOT NULL,
  shippingCountry TEXT NOT NULL,
  phone TEXT NOT NULL,
  documentType TEXT NOT NULL,
  documentNumber TEXT NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS epayco_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  productId TEXT NOT NULL,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_epayco_orders_clerk_id ON epayco_orders(clerk_id);
CREATE INDEX idx_epayco_orders_reference_code ON epayco_orders(referenceCode);
CREATE INDEX idx_epayco_order_items_order_id ON epayco_order_items(orderId);