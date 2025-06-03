// db/schema.ts o lib/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
// Si deseas timestamps por defecto, descomenta la línea de abajo y los campos createdAt/updatedAt
// import { sql } from 'drizzle-orm';

// Define la tabla 'payus' con Drizzle ORM
export const orders = sqliteTable('payus', {
  // ID autoincremental como clave primaria (común)
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),

  // Columnas basadas en tu sentencia INSERT original
  merchantId: text('merchantId'),
  merchant_name: text('merchant_name'),
  merchant_address: text('merchant_address'),
  telephone: text('telephone'),
  merchant_url: text('merchant_url'),
  transactionState: text('transactionState'),
  lapTransactionState: text('lapTransactionState'),
  message: text('message'),
  // referenceCode: Asumiendo que es único y requerido
  referenceCode: text('referenceCode').notNull().unique(),
  reference_pol: text('reference_pol'),
  transactionId: text('transactionId'),
  description: text('description'),
  trazabilityCode: text('trazabilityCode'),
  cus: text('cus'),
  orderLanguage: text('orderLanguage'),
  polTransactionState: text('polTransactionState'),
  signature: text('signature'),
  polResponseCode: text('polResponseCode'),
  lapResponseCode: text('lapResponseCode'),
  risk: text('risk'),
  // Asumiendo que estos son IDs o números, usa integer
  polPaymentMethod: integer('polPaymentMethod', { mode: 'number'}),
  lapPaymentMethod: integer('lapPaymentMethod', { mode: 'number'}),
  polPaymentMethodType: integer('polPaymentMethodType', { mode: 'number'}),
  lapPaymentMethodType: integer('lapPaymentMethodType', { mode: 'number'}),
  installmentsNumber: integer('installmentsNumber', { mode: 'number'}),
  // Usa real para valores decimales como montos
  TX_VALUE: real('TX_VALUE'),
  TX_TAX: real('TX_TAX'),
  currency: text('currency'),
  lng: text('lng'),
  buyerEmail: text('buyerEmail'),
  authorizationCode: text('authorizationCode'),
  TX_ADMINISTRATIVE_FEE: real('TX_ADMINISTRATIVE_FEE'),
  TX_TAX_ADMINISTRATIVE_FEE: real('TX_TAX_ADMINISTRATIVE_FEE'),
  TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE: real('TX_TAX_ADMINISTRATIVE_FEE_RETURN_BASE'),
  // processingDate: Podrías querer almacenarla como INTEGER timestamp o TEXT
  processingDate: text('processingDate'),
  clerk_id: text('clerk_id'),

  // Opcional: Añadir timestamps de creación/actualización
  // createdAt: integer('createdAt', { mode: 'timestamp'}).default(sql`CURRENT_TIMESTAMP`),
  // updatedAt: integer('updatedAt', { mode: 'timestamp'}).default(sql`CURRENT_TIMESTAMP`),
});

// Si el esquema de payuTokens está en este mismo archivo, mantenlo aquí:
// export const payuTokens = sqliteTable('payu_tokens', { ... });
