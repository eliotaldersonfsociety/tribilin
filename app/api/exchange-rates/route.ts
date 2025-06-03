// app/api/exchange-rates/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { z } from 'zod';

const dataPath = path.join(process.cwd(), 'app/api/exchange-rates/data.json');
const CACHE_TIME = 3600; // 1 hora en segundos

const RateSchema = z.object({
  rates: z.record(z.number()),
  lastUpdated: z.string().datetime()
});

// Obtener tasas de una API pública
async function fetchLiveRates() {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
    const data = await res.json();
    
    return {
      success: data.result === 'success',
      rates: data.rates
    };
  } catch (error) {
    console.error('Error fetching rates:', error);
    return { success: false };
  }
}

// GET: Obtener tasas (con actualización automática)
export async function GET() {
  try {
    let fileData;
    
    // Leer datos existentes
    try {
      fileData = RateSchema.parse(JSON.parse(await fs.readFile(dataPath, 'utf-8')));
    } catch {
      fileData = null;
    }

    // Verificar si necesita actualización
    const lastUpdated = fileData?.lastUpdated 
      ? new Date(fileData.lastUpdated).getTime() 
      : 0;

    const shouldUpdate = (Date.now() - lastUpdated) > CACHE_TIME * 1000;

    if (!shouldUpdate && fileData) {
      return NextResponse.json(fileData);
    }

    // Obtener nuevas tasas
    const liveRates = await fetchLiveRates();
    
    if (!liveRates.success) {
      return NextResponse.json(fileData || { error: 'No rates available' });
    }

    // Filtrar solo las monedas de Latinoamérica
    const filteredRates = {
      COP: liveRates.rates.COP,
      MXN: liveRates.rates.MXN,
      BRL: liveRates.rates.BRL,
      CLP: liveRates.rates.CLP,
      PEN: liveRates.rates.PEN,
      ARS: liveRates.rates.ARS,
      USD: 1
    };

    // Guardar nuevos datos
    const newData = {
      lastUpdated: new Date().toISOString(),
      baseCurrency: 'USD',
      rates: filteredRates
    };

    await fs.writeFile(dataPath, JSON.stringify(newData, null, 2));
    
    return NextResponse.json(newData);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}