import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tienda Texas - Productos de Calidad',
  description: 'Explora nuestra amplia selección de productos. Encuentra ofertas especiales y envío gratis en tu primera compra.',
  keywords: ['productos', 'tienda online', 'compras', 'ofertas', 'envío gratis', 'texas'],
};

export default function PaginaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 