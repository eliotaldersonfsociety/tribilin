"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { ArrowLeft, ImagePlus, Trash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import ProductList from '@/components/ProductList'

interface Product {
  title: string
  description: string
  price: string
  compareAtPrice: string
  costPerItem: string
  vendor: string
  productType: string
  status: boolean
  category: string
  tags: string
  sku: string
  barcode: string
  quantity: number
  trackInventory: boolean
  images: string[]
  sizes: string[]
  sizeRange: { min: number; max: number }
  colors: string[]
}

const initialProduct: Product = {
  title: "",
  description: "",
  price: "",
  compareAtPrice: "",
  costPerItem: "",
  vendor: "",
  productType: "",
  status: true,
  category: "",
  tags: "",
  sku: "",
  barcode: "",
  quantity: 0,
  trackInventory: false,
  images: [],
  sizes: [],
  sizeRange: { min: 18, max: 45 },
  colors: [],
}

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"]
const colorOptions = [
  { name: "Rojo", value: "#FF0000" },
  { name: "Verde", value: "#00FF00" },
  { name: "Azul", value: "#0000FF" },
  { name: "Amarillo", value: "#FFFF00" },
  { name: "Naranja", value: "#FFA500" },
  { name: "Púrpura", value: "#800080" },
  { name: "Negro", value: "#000000" },
  { name: "Blanco", value: "#FFFFFF" },
  { name: "Gris", value: "#808080" },
  { name: "Rosa", value: "#FFC0CB" },
  { name: "Marrón", value: "#A52A2A" },
  { name: "Turquesa", value: "#40E0D0" },
]

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nuestros Productos</h1>
      <ProductList />
    </main>
  )
}
