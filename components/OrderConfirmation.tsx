"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from "@/components/ui/button";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useUser } from "@clerk/nextjs";
import useRoleRedirect from "@/hooks/useOrganization";

interface ShippingAddress {
  firstname: string;
  lastname: string;
  address: string;
  apartment: string;
  city: string;
  province: string;
  postal: string;
  phone: string;
  country: string | string[];
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  color?: string;
  size?: string;
  sizeRange?: string;
}

export default function OrderConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const roleRedirect = useRoleRedirect();

  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [address, setAddress] = useState<ShippingAddress | null>(null);
  const [total, setTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const totalParam = searchParams.get('total');
    const itemsParam = searchParams.get('items');
    const shippingAddressParam = searchParams.get('shippingAddress');
    const taxParam = searchParams.get('tax');
    const tipParam = searchParams.get('tip');

    // Intentar obtener datos de localStorage si los parámetros de búsqueda no están disponibles
    const localStorageOrder = localStorage.getItem('orderDetails');
    let parsedOrder = null;

    if (localStorageOrder) {
      try {
        parsedOrder = JSON.parse(localStorageOrder);
      } catch (err) {
        console.error('Error parsing order details from localStorage:', err);
      }
    }

    if (orderIdParam) setOrderId(orderIdParam);
    if (totalParam) setTotal(parseFloat(totalParam));
    if (taxParam) setTax(parseFloat(taxParam));
    if (tipParam) setTip(parseFloat(tipParam));

    // Parse items and address if available
    if (itemsParam) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
        setOrderItems(parsedItems);
      } catch (err) {
        console.error('Error parsing items:', err);
      }
    } else if (parsedOrder?.items) {
      setOrderItems(parsedOrder.items);
    }

    if (shippingAddressParam) {
      try {
        const parsedAddress = JSON.parse(decodeURIComponent(shippingAddressParam));
        setAddress(parsedAddress);
      } catch (err) {
        console.error('Error parsing shipping address:', err);
      }
    } else if (parsedOrder?.shippingAddress) {
      setAddress(parsedOrder.shippingAddress);
    }

    // Si no se obtuvieron datos de los parámetros de búsqueda, usar los de localStorage
    if (!orderIdParam && parsedOrder?.referenceCode) {
      setOrderId(parsedOrder.referenceCode);
      setReferenceCode(parsedOrder.referenceCode);
    }
    if (!totalParam && parsedOrder?.total) setTotal(parsedOrder.total);
    if (!taxParam && parsedOrder?.tax) setTax(parsedOrder.tax);
    if (!tipParam && parsedOrder?.tip) setTip(parsedOrder.tip);

    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    const localStorageOrder = localStorage.getItem('orderDetails');
    if (localStorageOrder) {
      try {
        const parsedOrder = JSON.parse(localStorageOrder);
        setOrderItems(parsedOrder.items);
        setAddress(parsedOrder.shippingAddress);
        setTotal(parsedOrder.total);
        setTax(parsedOrder.tax);
        setTip(parsedOrder.tip);
        setOrderId(parsedOrder.orderId);
        // ...otros datos que quieras mostrar
      } catch (err) {
        console.error('Error parsing order details from localStorage:', err);
      }
    }
  }, []);

  // Calculate the subtotal based on the items
  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      roleRedirect();
    }, 2000);
  };

  // Loading state rendering
  if (loading || !isLoaded) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-8">
          <Skeleton circle width={64} height={64} />
          <Skeleton width={300} height={32} className="mt-2" />
          <Skeleton width={200} height={24} className="mt-2" />
          <Skeleton width={250} height={24} className="mt-2" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column Skeleton */}
          <div>
            <Card className="mb-8">
              <CardHeader>
                <Skeleton width={200} height={24} />
              </CardHeader>
              <CardContent>
                <Skeleton count={3} height={20} className="mb-2" />
                <div className="rounded-md overflow-hidden border border-gray-200 mt-4">
                  <div className="bg-gray-100 p-2 text-sm text-gray-600">
                    <Skeleton width={200} height={20} />
                  </div>
                  <div className="relative w-full h-48">
                    <Skeleton height="100%" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Details Skeleton */}
            <div>
              <Skeleton width={200} height={24} className="mb-4" />
              <div className="space-y-6">
                <div>
                  <Skeleton width={150} height={20} className="mb-2" />
                  <Skeleton count={4} height={20} className="mb-1" />
                </div>
                <Separator />
                <div>
                  <Skeleton width={150} height={20} className="mb-2" />
                  <Skeleton count={5} height={20} className="mb-1" />
                </div>
                <Separator />
                <div>
                  <Skeleton width={150} height={20} className="mb-2" />
                  <Skeleton height={20} />
                </div>
                <Separator />
                <div className="mt-8">
                  <Skeleton width={250} height={20} />
                </div>
              </div>
            </div>
          </div>
          {/* Right Column Skeleton */}
          <div>
            <Card>
              <CardHeader>
                <Skeleton width={200} height={24} />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Item Skeletons */}
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between mb-2">
                        <Skeleton width={100} height={20} />
                        <Skeleton width={50} height={20} />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Skeleton circle width={100} height={100} />
                        <div>
                          <Skeleton width={150} height={20} className="mb-1"/>
                          <Skeleton width={100} height={20} className="mb-1"/>
                          <Skeleton width={100} height={20} className="mb-1"/>
                          <Skeleton width={100} height={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  {/* Cost Summary Skeletons */}
                  <div className="space-y-2">
                    <Skeleton width={150} height={20} className="mb-4"/>
                    <div className="flex justify-between">
                      <Skeleton width={100} height={20} />
                      <Skeleton width={100} height={20} />
                    </div>
                     <div className="flex justify-between">
                      <Skeleton width={100} height={20} />
                      <Skeleton width={100} height={20} />
                    </div>
                     <div className="flex justify-between">
                      <Skeleton width={100} height={20} />
                      <Skeleton width={100} height={20} />
                    </div>
                     <div className="flex justify-between">
                      <Skeleton width={100} height={20} />
                      <Skeleton width={100} height={20} />
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-xl font-bold">
                      <Skeleton width={100} height={24} />
                      <Skeleton width={100} height={24} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Skeleton width={"100%"} height={50} className="mt-4"/>
          </div>
        </div>
      </div>
    );
  }

  // Main content rendering
  try {
    return (
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">
            Confirmación N°{orderId || referenceCode || 'N/A'}
          </h1>
          <p className="text-light-xl text-green-500">
            Transacción Aprobada
          </p>
          <p className="text-xl">¡Gracias, {user?.firstName}!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Order Details */}
          <div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Tu pedido está confirmado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Recibirás en breve un correo electrónico de confirmación con tu número de pedido.
                </p>

                {/* Map section */}
                <div className="rounded-md overflow-hidden border border-gray-200 mt-4">
                   <div className="bg-gray-100 p-2 text-sm text-gray-600">
                     {/* Display address from parsed state if available, otherwise session user */}
                     <span className="font-medium">Ubicación de entrega:</span>{' '}
                     {address
                       ? `${address.address}, ${address.city}, ${address.province}`
                         : 'No disponible'}
                   </div>
                  <div className="relative w-full h-48">
                    {/*
                      NOTE: The iframe src URL below is not a valid Google Maps Embed URL
                      and will not display a map correctly. A valid URL requires
                      a base URL like https://www.google.com/maps/embed/v1/place
                      and a 'q' parameter with the encoded address, potentially
                      also a Google Maps API key if required by your project setup.
                      Keeping the original structure as requested but acknowledging it's non-functional.
                    */}
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      // Original non-functional URL - DO NOT RELY ON THIS FOR A WORKING MAP
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63123.96036467518!2d-72.53976233991576!3d7.889361541622373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e66459c645dd28b%3A0x26736c1ff4db5caa!2sC%C3%BAcuta%2C%20Norte%20de%20Santander%2C%20Colombia!5e0!3m2!1sen!2sus!4v1744663838510!5m2!1sen!2sus`}
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mb-4">Detalles del pedido</h2>

            <div className="space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="font-semibold mb-2">Información de contacto</h3>
                <p>{user?.firstName}</p>
                <p>{user?.lastName}</p>
                <p>{user?.primaryEmailAddress?.emailAddress}</p>
                <p>{user?.phoneNumbers?.[0]?.phoneNumber || 'Sin número de teléfono'}</p>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2">Dirección de envío</h3>
                {/* Display address from parsed state if available, otherwise session user */}
                <div className="space-y-1">
                   {address ? (
                      <>
                         <p>{address?.address}</p>
                         <p>{address?.apartment}</p>{/* Assuming apartment might not be in parsed address */}
                         <p>{address?.city}</p>
                         <p>{address?.province}</p>
                         <p>{address?.country}</p>
                         <p>{address?.postal}</p>{/* Assuming postal_code might not be in parsed address */}
                         <p>{address?.phone || 'Sin número de teléfono'}</p>
                      </>
                   ) : user ? (
                      <>
                         <p>{user?.phoneNumbers?.[0]?.phoneNumber || 'Sin número de teléfono'}</p>
                      </>
                   ) : (
                      <p>Dirección no disponible</p>
                   )}
                </div>
              </div>

              <Separator />

              {/* Shipping Method */}
              <div>
                <h3 className="font-semibold mb-2">Método de envío</h3>
                <p>Standard</p> {/* Hardcoded as in original */}
              </div>

              <Separator />

              {/* Help Link */}
              <div className="mt-8">
                <p className="font-medium">
                  ¿Necesitas ayuda?{' '}
                  <Link href="/contact" className="text-blue-600 hover:underline">
                    Ponte en contacto con nosotros
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Purchased Items */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Artículos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Render each item */}
                  {(orderItems || []).map((item, index) => (
                    <div key={index} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Cantidad</span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <div className="w-24 h-24 shrink-0 rounded-md border overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            ${item.price.toFixed(2)} c/u
                            {/* Display item options if available */}
                            {item.color && <span> - Color: {item.color}</span>}
                            {item.size && <span> - Talla: {item.size}</span>}
                            {item.sizeRange && <span> - Talla: {item.sizeRange}</span>}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Cost Summary */}
                  <div className="pt-4">
                    <h3 className="font-bold text-lg mb-4">Resumen de costos</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        {/* Calculate subtotal from order items */}
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Impuestos (19%)</span> {/* Tax percentage hardcoded as in original */}
                        {/* Display tax from search params */}
                        <span>${tax || '0.00'}</span> {/* Provide default if tax is null */}
                      </div>

                      <div className="flex justify-between">
                        <span>Propina</span>
                         {/* Display tip from search params */}
                        <span>${tip || '0.00'}</span> {/* Provide default if tip is null */}
                      </div>

                      <div className="flex justify-between">
                        <span>Envío</span>
                        <span>Gratis</span> {/* Shipping hardcoded as in original */}
                      </div>

                      <Separator className="my-2" />

                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                         {/* Display total from search params */}
                        <span className='font-bold'>${total || '0.00'}</span> {/* Provide default if total is null */}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Dashboard Button */}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg mt-4" disabled={false} onClick={handleDashboard}>
              {loading ? 'Procesando...' : 'Ir a Dashboard'}
            </Button>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg mt-2" asChild>
              <Link href="/pagina">Seguir comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return <div>Error en la página de agradecimiento: {String(error)}</div>;
  }
}

export const dynamic = "force-dynamic"; 
