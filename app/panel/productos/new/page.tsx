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
import { DashboardLayouts } from "@/components/dashboard-layouts"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/products/schema"

type ProductForm = {
  title: string;
  description: string;
  price: string;
  compare: string;
  cost_per_item: string;
  vendor: string;
  type: string;
  status: boolean;
  category: string;
  tags: string;
  sku: string;
  barcode: string;
  quantity: number;
  track: boolean;
  images: string[];
  sizes: string[];
  range: { min: number; max: number };
  colors: string[];
};

const initialProduct: ProductForm = {
  title: "",
  description: "",
  price: "",
  compare: "",
  cost_per_item: "",
  vendor: "",
  type: "",
  status: true,
  category: "",
  tags: "",
  sku: "",
  barcode: "",
  quantity: 0,
  track: false,
  images: [],
  sizes: [],
  range: { min: 18, max: 45 },
  colors: [],
};

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

const camelToSnake = (str: string) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const nameMap: Record<string, string> = {
  productType: 'type',
  trackInventory: 'track',
  compare: 'compare',
  range: 'range',
  // otros mapeos si los necesitas
};

export default function NewProduct() {
  const [product, setProduct] = useState<ProductForm>(initialProduct)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [useSizes, setUseSizes] = useState(false)
  const [useSizeRange, setUseSizeRange] = useState(false)
  const [useColors, setUseColors] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleGenerateDescription = async () => {
    if (!product.title || !product.category) {
      toast({
        title: "Faltan datos",
        description: "Por favor, ingresa un título y una categoría antes de generar la descripción.",
        variant: "destructive"
      });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: product.title, category: product.category }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error en la respuesta del servidor: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      if (!data.description) {
        throw new Error("La IA no devolvió una descripción válida. Intenta de nuevo más tarde.");
      }
      setProduct((prev) => ({ ...prev, description: data.description }));
      toast({
        title: "Descripción generada",
        description: "La descripción fue generada exitosamente.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error generando la descripción",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    // Mapeo de nombre camelCase a nombre corto del estado
    const stateKey = nameMap[name] || name;
    setProduct(prev => ({ ...prev, [stateKey]: type === "checkbox" ? checked : value }));
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) {
      toast({
        title: "Archivo no seleccionado",
        description: "Por favor, selecciona una imagen para subir.",
        variant: "destructive"
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo inválido",
        description: "Solo se permiten imágenes JPG, PNG o WEBP.",
        variant: "destructive"
      });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 4MB.",
        variant: "destructive"
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);
    setUploading(true);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.secure_url) {
        setProduct((prev) => ({ ...prev, images: [...prev.images, data.secure_url] }));
        toast({
          title: "Imagen subida",
          description: "La imagen se subió correctamente.",
        });
      } else {
        toast({
          title: "Error al subir la imagen",
          description: data.error?.message || "No se pudo subir la imagen. Intenta de nuevo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error en la subida de imagen",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }

  const handleRemoveImage = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleGenerateImage = async () => {
    if (!product.title) {
      toast({
        title: "Falta el título",
        description: "Por favor, ingresa un título antes de generar la imagen.",
        variant: "destructive"
      });
      return;
    }
    setGeneratingImage(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: product.title }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
        throw new Error("La IA no devolvió imágenes válidas. Intenta de nuevo más tarde.");
      }
      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...data.images.slice(0, 4)],
      }));
      toast({
        title: "Imágenes generadas",
        description: "Las imágenes fueron generadas exitosamente.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error generando imágenes",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setGeneratingImage(false);
    }
  }

  const handleSizeRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const parsedValue = Number.parseInt(value, 10)
    if (!isNaN(parsedValue)) {
      setProduct((prev) => ({
        ...prev,
        range: {
          ...prev.range,
          [name]: parsedValue,
        },
      }))
    }
  }

  const handleColorToggle = (color: string) => {
    setProduct((prev) => {
      if (prev.colors.includes(color)) {
        return { ...prev, colors: prev.colors.filter((c) => c !== color) }
      } else {
        return { ...prev, colors: [...prev.colors, color] }
      }
    })
  }

  const handleSizeToggle = (size: string) => {
    setProduct((prev) => {
      if (prev.sizes.includes(size)) {
        return { ...prev, sizes: prev.sizes.filter((s) => s !== size) }
      } else {
        return { ...prev, sizes: [...prev.sizes, size] }
      }
    })
  }

  const handleSubmit = async () => {
    if (!product.title || !product.description || !product.price || !product.category) {
      toast({
        title: "Faltan campos obligatorios",
        description: "Completa título, descripción, precio y categoría antes de guardar.",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      console.log('[handleSubmit] Estado product antes de payload:', product);
      const payload = {
        title: product.title,
        description: product.description,
        price: Number(product.price),
        compare_at_price: Number(product.compare),
        cost_per_item: Number(product.cost_per_item),
        vendor: product.vendor,
        product_type: product.type,
        status: product.status ? 1 : 0,
        category: product.category,
        tags: product.tags,
        sku: product.sku,
        barcode: product.barcode,
        quantity: Number(product.quantity),
        track_inventory: !!product.track,
        images: Array.isArray(product.images) ? product.images : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        size_range: product.range ? JSON.stringify(product.range) : "{}",
        colors: Array.isArray(product.colors) ? product.colors : [],
      };
      console.log('[handleSubmit] PAYLOAD FINAL ENVIADO:', payload);

      const res = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error en la respuesta del servidor:", errorText);
        throw new Error(`Error en la respuesta del servidor: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      toast({
        title: "Producto guardado",
        description: "El producto fue guardado exitosamente.",
      });
      localStorage.removeItem('cached_products');
      setProduct(initialProduct);
      setUseSizes(false);
      setUseSizeRange(false);
      setUseColors(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.log('[handleSubmit][CATCH] Error:', errorMessage, '| Payload:', product);
      toast({
        title: "Error al guardar el producto",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayouts>
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <h1 className="ml-4 text-lg font-semibold">Añadir Producto</h1>
          <div className="ml-auto">
            <Button onClick={handleSubmit} disabled={uploading || saving}>
              {saving ? "Guardando..." : uploading ? "Subiendo..." : "Guardar"}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="media">Imágenes</TabsTrigger>
                <TabsTrigger value="pricing">Precios</TabsTrigger>
                <TabsTrigger value="variants">Variantes</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Producto</CardTitle>
                    <CardDescription>Ingresa la información básica sobre tu producto.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        name="title"
                        value={product.title}
                        onChange={handleChange}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        placeholder="Describe tu producto..."
                        className="min-h-32"
                      />
                      <Button
                        onClick={handleGenerateDescription}
                        disabled={generating || !product.title || !product.category}
                      >
                        {generating ? "Generando..." : "Generar Descripción con IA"}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productType">Tipo de producto</Label>
                      <Select
                        name="productType"
                        value={product.type}
                        onValueChange={(value) => setProduct({ ...product, type: value })}
                      >
                        <SelectTrigger id="productType">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">Producto físico</SelectItem>
                          <SelectItem value="digital">Producto digital</SelectItem>
                          <SelectItem value="service">Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Proveedor</Label>
                      <Input
                        id="vendor"
                        name="vendor"
                        value={product.vendor}
                        onChange={handleChange}
                        placeholder="Nombre del proveedor"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="media" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Imágenes del Producto</CardTitle>
                    <CardDescription>Añade imágenes desde tu dispositivo o genera con IA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <div className="flex gap-4 mb-6">
                          <input
                            type="file"
                            id="file-upload"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById("file-upload")?.click()}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ImagePlus className="mr-2 h-4 w-4" />
                            )}
                            Subir imágenes
                          </Button>

                          <Button
                            onClick={handleGenerateImage}
                            disabled={generatingImage || !product.title}
                            variant="outline"
                          >
                            {generatingImage ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ImagePlus className="mr-2 h-4 w-4" />
                            )}
                            Generar con IA
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground">Formatos soportados: JPG, PNG, WEBP (hasta 4MB)</p>
                      </div>

                      {(product.images.length > 0 || generatingImage) && (
                        <div className="mt-6">
                          <h3 className="mb-4 text-lg font-semibold">Galería de imágenes</h3>

                          {(generatingImage || uploading) && (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mb-6">
                              {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-lg" />
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-full">
                            {product.images.map((img, index) => (
                              <div
                                key={index}
                                className="group relative w-full aspect-square overflow-hidden rounded-lg border"
                              >
                                <img
                                  src={img || "/placeholder.svg"}
                                  alt={`Imagen del producto ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                                  }}
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center text-xs text-white">
                                  Imagen {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pricing" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Precios</CardTitle>
                    <CardDescription>Establece la información de precios para tu producto.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="price"
                          name="price"
                          value={product.price}
                          onChange={handleChange}
                          type="number"
                          step="0.01"
                          className="pl-7"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compareAtPrice">Comparar con precio</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="compareAtPrice"
                          name="compare"
                          value={product.compare}
                          onChange={handleChange}
                          type="number"
                          step="0.01"
                          className="pl-7"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Para mostrar un precio reducido, establece este valor más alto que el precio.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPerItem">Costo por artículo</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="costPerItem"
                          name="cost_per_item"
                          value={product.cost_per_item}
                          onChange={handleChange}
                          type="number"
                          step="0.01"
                          className="pl-7"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Los clientes no verán esto.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="variants" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Variantes del Producto</CardTitle>
                    <CardDescription>Define las tallas y colores disponibles para este producto.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch id="useSizes" checked={useSizes} onCheckedChange={setUseSizes} />
                        <Label htmlFor="useSizes">¿Usar tallas estándar?</Label>
                      </div>
                      {useSizes && (
                        <>
                          <Label className="text-base font-medium">Tallas Estándar</Label>
                          <div className="flex flex-wrap gap-2">
                            {sizeOptions.map((size) => (
                              <Button
                                key={size}
                                type="button"
                                variant={product.sizes.includes(size) ? "default" : "outline"}
                                onClick={() => handleSizeToggle(size)}
                                className="h-10 px-4"
                              >
                                {size}
                              </Button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch id="useSizeRange" checked={useSizeRange} onCheckedChange={setUseSizeRange} />
                        <Label htmlFor="useSizeRange">¿Usar rango de tallas?</Label>
                      </div>
                      {useSizeRange && (
                        <>
                          <Label className="text-base font-medium">Rango de Tallas (cm)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="min">Mínimo</Label>
                              <Input
                                id="min"
                                name="min"
                                type="number"
                                min="18"
                                max="45"
                                value={product.range.min}
                                onChange={handleSizeRangeChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="max">Máximo</Label>
                              <Input
                                id="max"
                                name="max"
                                type="number"
                                min="18"
                                max="45"
                                value={product.range.max}
                                onChange={handleSizeRangeChange}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Define el rango de tallas disponibles en centímetros (de 18 a 45 cm).
                          </p>
                        </>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Switch id="useColors" checked={useColors} onCheckedChange={setUseColors} />
                        <Label htmlFor="useColors">¿Usar colores disponibles?</Label>
                      </div>
                      {useColors && (
                        <>
                          <Label className="text-base font-medium">Colores Disponibles</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {colorOptions.map((color) => (
                              <div
                                key={color.value}
                                className={`flex items-center space-x-2 border rounded-md p-2 cursor-pointer ${
                                  product.colors.includes(color.value) ? "border-primary bg-primary/10" : "border-input"
                                }`}
                                onClick={() => handleColorToggle(color.value)}
                              >
                                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: color.value }} />
                                <span>{color.name}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="status" className="cursor-pointer">
                    Activo
                  </Label>
                  <Switch
                    id="status"
                    name="status"
                    checked={product.status}
                    onCheckedChange={(checked) => setProduct({ ...product, status: checked })}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Los productos activos son visibles para los clientes.
                </p>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Organización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    placeholder="Categoría del producto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={product.tags}
                    onChange={handleChange}
                    placeholder="verano, oferta, nuevo"
                  />
                  <p className="text-xs text-muted-foreground">Separa las etiquetas con comas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Inventario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Código de producto)</Label>
                  <Input id="sku" name="sku" value={product.sku} onChange={handleChange} placeholder="SKU-123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de barras (ISBN, UPC, GTIN, etc.)</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    value={product.barcode}
                    onChange={handleChange}
                    placeholder="123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    value={product.quantity}
                    onChange={handleChange}
                    type="number"
                    placeholder="0"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="trackInventory"
                    name="trackInventory"
                    checked={product.track}
                    onCheckedChange={(checked) => setProduct({ ...product, track: checked })}
                  />
                  <Label htmlFor="trackInventory">Seguimiento de inventario</Label>
                </div>
              </CardFooter>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resumen de Variantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tallas Seleccionadas</Label>
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.length > 0 ? (
                      product.sizes.map((size) => (
                        <div key={size} className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm">
                          {size}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay tallas seleccionadas</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rango de Tallas (cm)</Label>
                  <p className="text-sm">
                    {product.range.min} - {product.range.max} cm
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Colores Seleccionados</Label>
                  <div className="flex flex-wrap gap-1">
                    {product.colors.length > 0 ? (
                      product.colors.map((color) => (
                        <div
                          key={color}
                          className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded text-sm"
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                          <span>{colorOptions.find((c) => c.value === color)?.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay colores seleccionados</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
    </DashboardLayouts>
  )
}
