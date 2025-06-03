import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Validación de la API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("La variable de entorno GEMINI_API_KEY no está definida");
}

// Inicializar el cliente de Gemini
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `Actúa como un vendedor persuasivo que cambia las palabras por sinónimos cada vez que se envíe el texto.
      Además, agrega emoticones en lugares naturales en el texto, como para expresar emociones o enfatizar ciertos puntos.
      Utiliza una variedad de emoticones de manera aleatoria para cada mensaje.`,
});

const generationConfig = {
  temperature: 0.1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

/**
 * API Route en Next.js para generar descripciones con Gemini
 */
export async function POST(req: NextRequest) {
  try {
    const { title, category } = await req.json();

    if (!title || !category) {
      return NextResponse.json({ error: "Título y categoría son requeridos" }, { status: 400 });
    }

    console.log("📩 Recibido en API:", { title, category });

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(
      `Genera una descripción atractiva para un producto llamado "${title}" que pertenece a la categoría "${category}". La descripción debe ser persuasiva y destacar sus características.`
    );

    const description = result.response.text();
    console.log("📨 Respuesta de Gemini:", description);

    return NextResponse.json({ description });
  } catch (error) {
    console.error("❌ Error interno del servidor:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
