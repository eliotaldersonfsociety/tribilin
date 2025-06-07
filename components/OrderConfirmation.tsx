"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from "@/components/ui/button";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useUser } from "@clerk/nextjs";
import useRoleRedirect from "@/hooks/useOrganization";

interface ShippingAddress {
  address: string;
  city: string;
  country: string;
  phone: string;
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
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pending');


  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderIdParam = searchParams.get('orderId');
      const statusParam = searchParams.get('status');
      if (!orderIdParam) {
        console.error('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/epayco/order/${orderIdParam}`);
        const orderData = await response.json();

        setStatus(statusParam || orderData.status || 'pending');
        
        setOrderItems(orderData.items || []);
        setAddress({
          address: orderData.shipping_address,
          city: orderData.shipping_city,
          country: orderData.shipping_country,
          phone: orderData.phone,
        });
        setTax(orderData.tax || 0);
        setTip(Number(orderData.tip) || 0);
        setOrderId(orderData.id || null);
        setReferenceCode(orderData.referenceCode || null);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams]);

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      roleRedirect();
    }, 2000);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + tax + tip;
  };


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
          <div>
            <Card className="mb-8">
              <CardHeader>
                <Skeleton width={200} height={24} />
              </CardHeader>
              <CardContent>
                <Skeleton count={3} height={20} className="mb-2" />
              </CardContent>
            </Card>
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
          <div>
            <Card>
              <CardHeader>
                <Skeleton width={200} height={24} />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between mb-2">
                        <Skeleton width={100} height={20} />
                        <Skeleton width={50} height={20} />
                      </div>
                      <div className="flex items-center space-x-4">
                        <Skeleton circle width={100} height={100} />
                        <div>
                          <Skeleton width={150} height={20} className="mb-1" />
                          <Skeleton width={100} height={20} className="mb-1" />
                          <Skeleton width={100} height={20} className="mb-1" />
                          <Skeleton width={100} height={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <Skeleton width={150} height={20} className="mb-4" />
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
            <Skeleton width={"100%"} height={50} className="mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex flex-col items-center text-center mb-8">
        {status === 'APPROVED' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
            <h1 className="text-3xl font-bold mb-2">Transacción Aprobada</h1>
            <p className="text-lg text-gray-600 mb-1">¡Gracias, {user?.firstName || 'cliente'}!</p>
            <p className="text-gray-600">Tu pedido está confirmado</p>
          </>
        ) : status === 'PENDING' ? (
          <>
            <Clock className="w-16 h-16 text-yellow-500 mb-2" />
            <h1 className="text-3xl font-bold mb-2">Transacción Pendiente</h1>
            <p className="text-gray-600">Estamos verificando tu pago</p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mb-2" />
            <h1 className="text-3xl font-bold mb-2">Transacción Fallida</h1>
            <p className="text-gray-600">Tu pedido no pudo ser procesado</p>
          </>
        )}
        {referenceCode && (
          <p className="text-sm text-gray-500 mt-2">Confirmación N°{referenceCode}</p>
        )}
        <p className="text-sm text-gray-500">Recibirás en breve un correo electrónico de confirmación con tu número de pedido.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ubicación de entrega</CardTitle>
            </CardHeader>
            <CardContent>
              {address ? (
                <>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.country}</p>
                  <p>{address.phone}</p>
          
                  {/* Mapa de Google Maps */}
                  <div className="mt-4 w-full h-64 rounded overflow-hidden border">
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(`${address.address}, ${address.city}, ${address.country}`)}&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa de entrega"
                    ></iframe>
                  </div>
                </>
              ) : (
                <p>No disponible</p>
              )}
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-4">Detalles del pedido</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Información de contacto</h3>
                <p>{user?.firstName || 'No disponible'}</p>
                <p>{user?.lastName || 'No disponible'}</p>
                <p>{user?.emailAddresses?.[0]?.emailAddress || 'No disponible'}</p>
                <p>{address?.phone || 'Sin número de teléfono'}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Dirección de envío</h3>
                {address ? (
                  <>
                    <p>{address.address}</p>
                    <p>{address.city}, {address.country}</p>
                    <p>{address.phone}</p>
                  </>
                ) : (
                  <p>Sin número de teléfono</p>
                )}
              </div>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Método de envío</h3>
                <p>Standard</p>
              </div>
              <Separator />
              <div className="mt-8">
                <p className="text-gray-600">¿Necesitas ayuda? Ponte en contacto con nosotros</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Artículos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    {item.image && (
                      <div className="relative w-20 h-20">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                      {item.size && <p className="text-sm text-gray-500">Talla: {item.size}</p>}
                      {item.sizeRange && <p className="text-sm text-gray-500">Rango de talla: {item.sizeRange}</p>}
                    </div>
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                ))}
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Subtotal</p>
                    <p>${calculateSubtotal().toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Impuestos (19%)</p>
                    <p>${tax.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Propina</p>
                    <p>${tip.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Envío</p>
                    <p>Gratis</p>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <p>Total</p>
                    <p>${calculateTotal().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 space-x-4 flex justify-center">
            <Button
              variant="default"
              onClick={handleDashboard}
            >
              Ir a Dashboard
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <Link href="/">Seguir comprando</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
