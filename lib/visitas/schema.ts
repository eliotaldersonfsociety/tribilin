import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const visitas = sqliteTable("visitas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ip: text("ip").notNull(),
  fecha: text("fecha").notNull(),
  rutas: text("rutas").notNull().default('[]'), // <-- AGREGA ESTA LÍNEA
  visita: integer("visita").default(1),         // <-- AGREGA ESTA LÍNEA
});