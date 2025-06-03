import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const API_KEY = process.env.GOOGLE_CSE_API_KEY;
    const CX = process.env.GOOGLE_CSE_ID;

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(prompt)}&cx=${CX}&searchType=image&key=${API_KEY}&num=8`
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrls = data.items?.map((item: any) => item.link) || [];

    if (imageUrls.length === 0) {
      return NextResponse.json({ error: "No images found" }, { status: 404 });
    }

    return NextResponse.json({ images: imageUrls }, { status: 200 });
    
  } catch (error) {
    console.error("Error searching images:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}