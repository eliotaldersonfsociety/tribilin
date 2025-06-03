import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('Ejecutando migraciones...');
  
  const TURSO_DB_URL = 'libsql://registroylogin-elliotalderson.aws-us-east-1.turso.io';
  const TURSO_DB_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDQyMzI0MjQsImlkIjoiZjQ4ZjhlOTAtMGNmNS00YTFiLTk3MjctMzI1ZTZiNjdjOTcwIiwicmlkIjoiOGFiNWE3N2ItODE5ZC00ZmI4LTk0ZTktYmMxYTQ5YTBjZWFjIn0.L3ewudH4Z_YDHd0X1tIvpM-m29zBTF9gEpj2FeCg5IqXasYJ6HvMj9iy2DRVsMXOeDnPaqjasLzI_fJf0dyBCA';

  try {
    // Leer el contenido del archivo SQL
    const sqlContent = fs.readFileSync(
      path.join(process.cwd(), 'lib/db/migrations/0000_initial.sql'),
      'utf-8'
    );

    // Crear cliente Turso
    const client = createClient({
      url: TURSO_DB_URL,
      authToken: TURSO_DB_AUTH_TOKEN,
    });

    // Ejecutar las sentencias SQL
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await client.execute(statement);
        console.log('Ejecutada migración:', statement.trim().split('\n')[0]);
      }
    }

    console.log('Migraciones completadas exitosamente');
  } catch (error) {
    console.error('Error al ejecutar migraciones:', error);
    process.exit(1);
  }
}

main(); 