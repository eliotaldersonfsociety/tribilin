'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
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
  const { user } = useUser();
  const { cart, clearCart } = useCart();
  const { initializeCheckout } = useEpaycoCheckout();
  const [paymentMethod, setPaymentMethod] = useState('epayco');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tipAmount, setTipAmount] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
    address: '',
    phone: '',
    document: '',
    documentType: 'CC',
  });

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (cart.items.length === 0) {
      toast.info('Tu carrito está vacío');
      router.push('/');
    }
  }, [user, router, cart.items.length]);

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
      const validationErrors = validateDeliveryInfo();
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items,
          total: cart.total,
          deliveryInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pago con saldo');
      }

      const data = await response.json();
      clearCart();
      router.push(`/thankyou/saldo?orderId=${data.orderId}`);
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

      const userEmail = user?.emailAddresses?.[0]?.emailAddress;
      if (!userEmail) {
        throw new Error('No se encontró el email del usuario');
      }

      const validationErrors = validateDeliveryInfo();
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        setIsProcessing(false);
        return;
      }

      const orderDescription = cart.items
        .map(item => `${item.quantity}x ${item.name}`)
        .join(', ');

      const cleanPhone = deliveryInfo.phone?.replace(/\s+/g, '') || '';
      const cleanDocument = deliveryInfo.document?.replace(/\s+/g, '') || '';

      await initializeCheckout({
        amount: cart.total,
        tax: 0,
        name: deliveryInfo.name || '',
        description: orderDescription,
        email: userEmail.toLowerCase(),
        phone: cleanPhone,
        address: deliveryInfo.address || '',
        document: cleanDocument,
        document_type: deliveryInfo.documentType,
        invoice: Date.now().toString()
      });

    } catch (error) {
      console.error('Error en pago con ePayco:', error);
      toast.error('Error al iniciar el pago con ePayco. Por favor, intenta de nuevo.');
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

  if (!user) {
    return null;
  }

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
              isSignedIn={!!user}
              userSaldo={100} // Ejemplo de saldo de usuario
            />

            <TipSection
              totalPrice={cart.total}
              tipAmount={tipAmount}
              setTipAmount={setTipAmount}
            />
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
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 cursor-pointer disabled:cursor-not-allowed"
        disabled={isProcessing || cart.items.length === 0}
        onClick={handleSubmit}
      >
        {isProcessing ? 'Procesando...' : 'Realizar Pago'}
      </button>
    </div>
  );
}
