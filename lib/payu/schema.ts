// db/schema.ts o lib/payu/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
// Si deseas timestamps por defecto, descomenta la línea de abajo y los campos createdAt/updatedAt
// import { sql } from 'drizzle-orm';

// Define la tabla 'payus' con Drizzle ORM
export const orders = sqliteTable('payu_tab', {
  // ID autoincremental como clave primaria (común)
  id: integer('id').primaryKey({ autoIncrement: true }),
  // referenceCode: Asumiendo que es único y requerido
  referenceCode: text('referenceCode').notNull().unique(),
  clerk_id: text('clerk_id'), // ID de usuario Clerk
  TX_VALUE: real('TX_VALUE'),
  currency: text('currency'),
  buyerEmail: text('buyerEmail'),
  authorizationCode: text('authorizationCode'),
  transactionState: text('transactionState'),
  status: text('status').default('Pendiente'),
  processingDate: integer('processingDate'),
  // processingDate: Podrías querer almacenarla como INTEGER timestamp o TEXT
  // Opcional: Añadir timestamps de creación/actualización
  // createdAt: integer('createdAt', { mode: 'timestamp'}).default(sql`CURRENT_TIMESTAMP`),
  // updatedAt: integer('updatedAt', { mode: 'timestamp'}).default(sql`CURRENT_TIMESTAMP`),
});

// Si el esquema de payuTokens está en este mismo archivo, mantenlo aquí:
// export const payuTokens = sqliteTable('payu_tokens', { ... });

// lib/payu/schema.ts

export const orderItems = sqliteTable('order_items', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id').notNull(), // FK a orders.id
    productId: text('product_id').notNull(), // ID del producto
    title: text('title').notNull(), // Título del producto
    price: real('price').notNull(), // Precio del producto
    quantity: integer('quantity').notNull(), // Cantidad del producto
  });


export const users = sqliteTable("usuarios", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      clerk_id: text("clerk_id").unique(), 
      email: text("email").notNull().unique(),
      address: text("address"),
      house_apt: text("house_apt"),
      city: text("city"),
      state: text("state"),
      country: text("country"),
      postal_code: text("postal_code"),
      saldo: text("saldo").default('0.00'),
      phone: text("phone"),
      first_name: text("first_name"),
      last_name: text("last_name"),
    });
  
