'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import { useCart } from '@/hooks/useCart';
import { useEpaycoCheckout } from '@/hooks/useEpaycoCheckout';
import { DeliveryInfoForm } from './DeliveryInfoForm';
import { PaymentMethod } from './PaymentMethod';
import { OrderSummary } from './OrderSummary';
import { ShippingMethod } from './ShippingMethod';
import { TipSection } from './TipSection';

interface DeliveryInfo {
  name: string;
  address: string;
  phone: string;
  document: string;
  documentType: string;
  city: string;
}

interface CartItem {
  id: string;
  quantity: number;
  name: string;
  price: number;
  image?: string | string[];
  color?: string;
  size?: string;
  sizeRange?: string;
}

export default function Checkout() {
  const router = useRouter();
  const { user, isLoaded } = useUser(); // ¡Importante! Usar isLoaded
  const { getToken } = useAuth();
  const { cart, clearCart } = useCart();
  const { initializeCheckout } = useEpaycoCheckout();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('epayco');
  const [userSaldo, setUserSaldo] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tipAmount, setTipAmount] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
    address: '',
    phone: '',
    document: '',
    documentType: 'CC',
    city: ''
  });

  useEffect(() => {
    // ¡CRÍTICO! Solo ejecutar cuando Clerk esté completamente cargado
    if (!isLoaded) return;

    const checkAuth = async () => {
      console.log('🔍 Verificando autenticación con Clerk cargado...');
      
      if (!user) {
        console.log('❌ Usuario no autenticado, redirigiendo a sign-in');
        router.push('/sign-in');
        return;
      }

      console.log('✅ Usuario autenticado:', user.id);
      
       // Solo verificar carrito si el usuario está autenticado y no ha completado un pago
      if (cart.items.length === 0) {
        console.log('⚠️ Carrito vacío detectado');
        toast.info('Tu carrito está vacío');
        router.push('/');
        return;
      }
  
      console.log('✅ Carrito tiene productos:', cart.items.length);
    };

  checkAuth();
}, [isLoaded, user, cart.items.length, router, paymentSuccess]);

  useEffect(() => {
  if (!isLoaded || !user || paymentMethod !== 'saldo') return;

  const fetchSaldo = async () => {
    try {
      const res = await fetch('/api/user');
      if (!res.ok) {
        throw new Error('No se pudo obtener el saldo');
      }

      const data = await res.json();
      const saldoNumber = Number(data.saldo);
      setUserSaldo(saldoNumber);
    } catch (error) {
      console.error('Error al obtener saldo:', error);
      toast.error('Error al obtener saldo');
    }
  };

  fetchSaldo();
}, [isLoaded, user, paymentMethod]); // Dependencia de paymentMethod

  
  const validateDeliveryInfo = () => {
    const errors = [];
    if (!deliveryInfo.name?.trim()) errors.push('Nombre completo es requerido');
    if (!deliveryInfo.address?.trim()) errors.push('Dirección es requerida');
    if (!deliveryInfo.phone?.trim()) errors.push('Teléfono es requerido');
    if (!deliveryInfo.document?.trim()) errors.push('Documento es requerido');

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(deliveryInfo.phone?.replace(/\s+/g, '') || '')) {
      errors.push('Teléfono debe tener 10 dígitos');
    }

    const documentRegex = /^[0-9]{6,12}$/;
    if (!documentRegex.test(deliveryInfo.document?.replace(/\s+/g, '') || '')) {
      errors.push('Documento debe tener entre 6 y 12 dígitos');
    }

    return errors;
  };

  const handleDeliveryInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaldoPayment = async () => {
  if (isProcessing) return;

  try {
    setIsProcessing(true);

    // Validar carrito
    if (!cart.items || cart.items.length === 0) {
      toast.error('Tu carrito está vacío');
      setIsProcessing(false);
      return;
    }

    const validationErrors = validateDeliveryInfo();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      setIsProcessing(false);
      return;
    }

    // Limpiar datos del carrito
    const cleanCartItems = cart.items.map(item => ({
      id: item.id.toString(),
      name: item.name,
      price: parseFloat(item.price.toString()),
      image: typeof item.image === 'string' ? item.image : '',
      quantity: parseInt(item.quantity.toString(), 10),
      color: item.color || '',
      size: item.size || '',
      sizeRange: item.sizeRange || ''
    }));

    const finalTotal = parseFloat(cart.total.toString()) + calculateTip();

    const response = await fetch('/api/pagos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productos: cleanCartItems,
        total: finalTotal,
        tip: calculateTip(),
        address: deliveryInfo.address,
        city: deliveryInfo.city,
        name: deliveryInfo.name,
        phone: deliveryInfo.phone,
        document: deliveryInfo.document,
        documentType: deliveryInfo.documentType,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al procesar el pago con saldo');
    }

    const data = await response.json();
    setPaymentSuccess(true); // Establecer el estado de pago exitoso
    router.push(`/thankyou/saldo?orderId=${data.orderId}&status=APPROVED`);

        // Forzar la actualización del saldo después de la compra
    const res = await fetch('/api/user');
    if (!res.ok) {
      throw new Error('No se pudo obtener el saldo actualizado');
    }

    const updatedData = await res.json();
    setUserSaldo(Number(updatedData.saldo));

  
  } catch (error) {
    console.error('Error en pago con saldo:', error);
    toast.error('Error al procesar el pago con saldo. Por favor, intenta de nuevo.');
  } finally {
    setIsProcessing(false);
  }
};

  const handleEpaycoPayment = async () => {
  if (isProcessing) return;

  try {
    setIsProcessing(true);

    // Validate required fields
    if (!deliveryInfo.name || !deliveryInfo.address || !deliveryInfo.phone || !deliveryInfo.document || !deliveryInfo.documentType || !deliveryInfo.city) {
      toast.error('Por favor complete todos los campos requeridos');
      setIsProcessing(false);
      return;
    }

    // Validate email
    if (!user?.emailAddresses[0]?.emailAddress) {
      toast.error('Se requiere un correo electrónico válido');
      setIsProcessing(false);
      return;
    }

    const orderResponse = await fetch('/api/epayco/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.items,
        deliveryInfo: {
          ...deliveryInfo,
          clerk_id: user.id,
          email: user.emailAddresses[0].emailAddress
        },
        total: cart.total,
        tax: calculateTax(),
        tip: calculateTip()
      })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.error || 'Error al crear la orden');
    }

    const orderData = await orderResponse.json();
    console.log('Order Data:', orderData);

    // Validate and format the amount
    const formattedAmount = parseFloat(orderData.amount);
    console.log('Formatted Amount:', formattedAmount);
    
    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      throw new Error('El monto de la orden no es válido');
    }

    // Initialize ePayco Checkout
    const success = await initializeCheckout({
      amount: formattedAmount,
      tax: parseFloat(orderData.tax),
      name: deliveryInfo.name,
      description: 'Pago de pedido',
      email: user.emailAddresses[0].emailAddress,
      phone: deliveryInfo.phone,
      address: deliveryInfo.address,
      document: deliveryInfo.document,
      document_type: deliveryInfo.documentType,
      invoice: orderData.referenceCode
    });

    if (!success) {
      throw new Error('Error al inicializar el checkout de ePayco');
    }

  } catch (error) {
    console.error('Error en pago con ePayco:', error);
    toast.error(error instanceof Error ? error.message : 'Error al procesar el pago');
  } finally {
    setIsProcessing(false);
  }
};



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    switch (paymentMethod) {
      case 'saldo':
        await handleSaldoPayment();
        break;
      case 'epayco':
        await handleEpaycoPayment();
        break;
      default:
        toast.error('Método de pago no válido');
    }
  };

  const calculateTax = () => {
    return cart.total * 0.19; // 19% IVA
  };

  const calculateTip = () => {
    if (!tipAmount) return 0;
    return cart.total * (parseInt(tipAmount) / 100);
  };

  const calculateGrandTotal = () => {
    const tax = calculateTax();
    const tip = calculateTip();
    return cart.total + tax + tip;
  };

  // Mostrar loading mientras Clerk se carga
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, no renderizar nada (ya se redirigió)
  if (!user) {
    return null;
  }

  const isDeliveryInfoValid = () => {
    return validateDeliveryInfo().length === 0;
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5">
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <DeliveryInfoForm
              deliveryInfo={deliveryInfo}
              handleDeliveryInfoChange={handleDeliveryInfoChange}
              isProcessing={isProcessing}
            />

            <ShippingMethod />

            <PaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              isProcessing={isProcessing}
              userSaldo={userSaldo} // Pasar el saldo como prop
              isSignedIn={!!user}
            />

            <TipSection
              totalPrice={cart.total}
              tipAmount={tipAmount}
              setTipAmount={setTipAmount}
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 cursor-pointer disabled:cursor-not-allowed"
              disabled={isProcessing || cart.items.length === 0 || !isDeliveryInfoValid()}
            >
              {isProcessing ? 'Procesando...' : 'Realizar Pago'}
            </button>
          </form>
        </div>

        <OrderSummary
          cartItems={cart.items}
          totalPrice={cart.total}
          tip={calculateTip()}
          tax={calculateTax()}
          grandTotal={calculateGrandTotal()}
          currency="COP"
        />
      </div>
    </div>
  );
}
