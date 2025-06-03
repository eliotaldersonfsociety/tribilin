import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { products } from '@/lib/db/schema';

async function main() {
  console.log('Limpiando y reiniciando productos...');
  
  const PRODUCTS_DB_URL = 'libsql://products-elliotalderson.turso.io';
  const PRODUCTS_DB_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDQyMzI0MjQsImlkIjoiZjQ4ZjhlOTAtMGNmNS00YTFiLTk3MjctMzI1ZTZiNjdjOTcwIiwicmlkIjoiOGFiNWE3N2ItODE5ZC00ZmI4LTk0ZTktYmMxYTQ5YTBjZWFjIn0.L3ewudH4Z_YDHd0X1tIvpM-m29zBTF9gEpj2FeCg5IqXasYJ6HvMj9iy2DRVsMXOeDnPaqjasLzI_fJf0dyBCA';

  try {
    const client = createClient({
      url: PRODUCTS_DB_URL,
      authToken: PRODUCTS_DB_TOKEN,
    });

    const db = drizzle(client);

    // Limpiar la tabla de productos
    await db.delete(products);
    console.log('Tabla de productos limpiada');

    // Productos de prueba
    const productosPrueba = [
      {
        title: 'Audifonos Gamer',
        description: 'Audifonos gaming con sonido envolvente 7.1 y micrófono retráctil',
        price: 79.99,
        compare_at_price: 99.99,
        cost_per_item: 50.00,
        vendor: 'Gaming Pro',
        product_type: 'Audifonos',
        status: 1,
        category: 'Gaming',
        tags: 'audifonos,gaming,audio',
        sku: 'GAM-AUD-001',
        barcode: '456789123',
        quantity: 20,
        track_inventory: true,
        images: JSON.stringify(['/images/products/audifonos-gamer.jpg']),
        sizes: JSON.stringify(['Único']),
        size_range: JSON.stringify(['Único']),
        colors: JSON.stringify(['Negro', 'Rojo'])
      }
    ];

    // Insertar productos
    for (const producto of productosPrueba) {
      const result = await db.insert(products).values(producto);
      console.log('Producto insertado:', {
        id: result.lastInsertRowid,
        title: producto.title
      });
    }

    // Verificar productos insertados
    const productosInsertados = await db.select().from(products);
    console.log('Productos en la base de datos:', productosInsertados.map(p => ({
      id: p.id,
      title: p.title
    })));

    console.log('Productos de prueba insertados exitosamente');
  } catch (error) {
    console.error('Error al insertar productos:', error);
    process.exit(1);
  }
}

main(); 