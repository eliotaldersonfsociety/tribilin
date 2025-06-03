// db/schema.ts o lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
// Importa 'sql' para usar funciones SQL como CURRENT_TIMESTAMP
import { sql } from 'drizzle-orm';
import { count } from 'console';

// Define la tabla 'users' con Drizzle ORM
export const users = sqliteTable('usuarios', {
  // Auto-incrementing primary key is common
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),

  // Columns based on your INSERT statement
  email: text('email').notNull().unique(), // Email is typically unique and required
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  address: text('address'), // Assuming address might be optional
  house_apt: text('house_apt'), // Assuming house_apt might be optional
  city: text('city'), // Assuming city might be optional
  state: text('state'), // Assuming state might be optional
  postal_code: text('postal_code'), // Assuming postal_code might be optional
  phone: text('phone'), // Assuming phone might be optional
  password: text('password').notNull(), // Hashed password is required
  country: text('country'), // Assuming country might be optional
  saldo: integer('saldo').default(0).notNull(), // Campo para el saldo del usuario

  // Añadimos un campo para la fecha de creación
  // Usamos INTEGER para almacenar un timestamp Unix
  // default(sql`CURRENT_TIMESTAMP`) establece el valor por defecto a la hora actual de la base de datos
  createdAt: integer('created_at', { mode: 'timestamp'}).default(sql`CURRENT_TIMESTAMP`).notNull(),

  // Opcional: Añadir un timestamp para la última actualización si lo necesitas
  // updatedAt: integer('updatedAt', { mode: 'timestamp'}).default(sql`CURRENT_TIMESTAMP`),

  // Agrega esta línea:
  role: text('role').notNull().default('user'),
});
