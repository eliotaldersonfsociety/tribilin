// app/api/generatetoken/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { payuTokens } from '@/lib/payu_token/schema';

const secretJwt    = process.env.JWT_SECRET!;
const apiKey       = process.env.NEXT_PUBLIC_PAYU_API_KEY!;      // tu ApiKey de PayU
const merchantId   = process.env.NEXT_PUBLIC_PAYU_MERCHANT_ID!;  // tu MerchantID
const accountId    = process.env.NEXT_PUBLIC_PAYU_ACCOUNT_ID!;   // tu AccountID (ApiLogin)
console.log("Variables de Entorno PayU cargadas:");
console.log("PAYU_MERCHANT_ID:", merchantId);
console.log("PAYU_ACCOUNT_ID:", accountId);
console.log("PAYU_API_KEY:", apiKey); // También verifica la API Key


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extrae del body lo que necesites
    const {
      referenceCode,
      amount,
      currency,
      description,
      responseUrl,
      confirmationUrl,
      buyerEmail,
      buyerFullName,
      telephone,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingState, // si lo usas
      postalCode,    // si lo usas
    } = body;

    if (!referenceCode) {
      return NextResponse.json({ error: 'Falta referenceCode' }, { status: 400 });
    }

    // 1) Genera el JWT para tu propio tracking
    const token = jwt.sign({ referenceCode, amount, currency }, secretJwt, { expiresIn: '1h' });

    // 2) Calcula la firma que PayU espera (MD5)
    const signatureString = [apiKey, merchantId, referenceCode, amount, currency].join('~');
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    // 3) Guarda en BD tu JWT usando drizzle y el esquema correcto
    await db.payu.insert(payuTokens).values({
      referenceCode,
      token,
      createdAt: new Date().toISOString(),
    });

    // 4) Devuelve TODOS los campos que PayU necesita (incluida signature)
    return NextResponse.json({
      success: true,
      // credenciales necesarias para el form
      merchantId,
      accountId,
      referenceCode,
      amount,
      currency,
      signature,
      description,
      responseUrl,
      confirmationUrl,
      buyerEmail,
      buyerFullName,
      telephone,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingState,
      postalCode,
      // si quieres, reenvía aquí otros campos (buyerEmail, shipping…)
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
