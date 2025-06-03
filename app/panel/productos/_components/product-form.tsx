"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, Upload } from "lucide-react"
import DeleteButton from "@/components/delete/DeleteButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ProductFormProps {
  initialData?: {
    id?: string | number
    title?: string
    description?: string
    price?: number
    compareAtPrice?: number
    costPerItem?: number
    vendor?: string
    productType?: string
    status?: number
    category?: string
    tags?: string[]
    sku?: string
    barcode?: string
    quantity?: number
    trackInventory?: boolean
    images?: string[]
    sizes?: string[]
    sizeRange?: { min: number; max: number }
    colors?: string[]
  }
  id?: string | number
}

interface FormData {
  title: string
  description: string
  price: string
  compareAtPrice: string
  costPerItem: string
  vendor: string
  productType: string
  status: number
  category: string
  tags: string
  sku: string
  barcode: string
  quantity: string
  trackInventory: boolean
  images: string[]
  sizes: string
  sizeRange: { min: number; max: number }
  colors: string
}

export default function ProductForm({ initialData, id }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const initialFormData: FormData = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    compareAtPrice: initialData?.compareAtPrice?.toString() || "",
    costPerItem: initialData?.costPerItem?.toString() || "",
    vendor: initialData?.vendor || "",
    productType: initialData?.productType || "",
    status: initialData?.status ?? 0,
    category: initialData?.category || "",
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : "",
    sku: initialData?.sku || "",
    barcode: initialData?.barcode || "",
    quantity: initialData?.quantity?.toString() || "",
    trackInventory: initialData?.trackInventory || false,
    images: initialData?.images || [],
    sizes: initialData?.sizes?.join(", ") || "",
    sizeRange: initialData?.sizeRange || { min: 18, max: 45 },
    colors: initialData?.colors?.join(", ") || "",
  }

  const [formData, setFormData] = useState<FormData>(initialFormData)

  const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    return `${src}?w=${width}&q=${quality || 75}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSizeRangeChange = (field: "min" | "max", value: string) => {
    const numValue = Number.parseInt(value) || 0
    setFormData(prev => ({
      ...prev,
      sizeRange: {
        ...prev.sizeRange,
        [field]: numValue,
      },
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === "string") {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result]
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const productId = initialData?.id || id
      const isEditing = !!productId
      const url = isEditing ? `/api/product/${productId}` : "/api/product"
      const method = isEditing ? "PUT" : "POST"

      const numericFields = {
        price: Number.parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number.parseFloat(formData.compareAtPrice) : null,
        costPerItem: formData.costPerItem ? Number.parseFloat(formData.costPerItem) : null,
        quantity: formData.quantity ? Number.parseInt(formData.quantity) : 0,
      }

      const sizes = formData.sizes
        .split(",")
        .map(size => size.trim())
        .filter(Boolean)
      const colors = formData.colors
        .split(",")
        .map(color => color.trim())
        .filter(Boolean)
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...numericFields,
          sizes,
          colors,
          tags,
          sizeRange: formData.sizeRange,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error guardando producto")
      }

      router.push("/panel/productos")
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      alert(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Sección de Título y Descripción */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descripción del producto"
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Imágenes */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Imágenes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border group">
                    <Image
                      loader={customLoader}
                      src={image}
                      alt={`Imagen del producto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <label className="border border-dashed rounded-md flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Subir imagen</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Agrega hasta 10 imágenes para mostrar tu producto desde diferentes ángulos.
              </p>
            </CardContent>
          </Card>

          {/* Sección de Precios */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Precios</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      className="pl-7"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="compareAtPrice">Precio comparativo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="compareAtPrice"
                      name="compareAtPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compareAtPrice}
                      onChange={handleChange}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="costPerItem">Costo por artículo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      id="costPerItem"
                      name="costPerItem"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPerItem}
                      onChange={handleChange}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Variantes */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Variantes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sizes">Tamaños</Label>
                  <Input
                    id="sizes"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    placeholder="S, M, L, XL"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separados por comas</p>
                </div>
                <div>
                  <Label htmlFor="colors">Colores</Label>
                  <Input
                    id="colors"
                    name="colors"
                    value={formData.colors}
                    onChange={handleChange}
                    placeholder="Rojo, Azul, Negro"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separados por comas</p>
                </div>
                <div className="sm:col-span-2">
                  <Label>Rango de tamaños numéricos</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="sizeRangeMin">Mínimo</Label>
                      <Input
                        id="sizeRangeMin"
                        type="number"
                        min="0"
                        value={formData.sizeRange.min}
                        onChange={(e) => handleSizeRangeChange("min", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sizeRangeMax">Máximo</Label>
                      <Input
                        id="sizeRangeMax"
                        type="number"
                        min="0"
                        value={formData.sizeRange.max}
                        onChange={(e) => handleSizeRangeChange("max", e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Define el rango de tamaños numéricos (ej: tallas de zapatos del 20 al 45)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Inventario */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Inventario</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="barcode">Código de barras</Label>
                  <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="trackInventory"
                    checked={formData.trackInventory}
                    onCheckedChange={(checked) => handleSwitchChange("trackInventory", checked)}
                  />
                  <Label htmlFor="trackInventory">Seguimiento de inventario</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha */}
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Estado</h3>
              <Select
                value={formData.status.toString()}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Activo</SelectItem>
                  <SelectItem value="0">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Organización</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productType">Tipo de producto</Label>
                  <Input
                    id="productType"
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="vendor">Proveedor</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Etiquetas</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Separadas por comas"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-4">
        {(initialData?.id || id) && <DeleteButton id={(initialData?.id || id)!} />}
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar producto" : "Crear producto"}
        </Button>
      </div>
    </form>
  )
}

function parseMaybeJSON(value: any, fallback: any = {}) {
  if (!value || value === "") return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function parseMaybeJSONOrCSV(value: any): string[] {
  if (!value || value === "") return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return typeof value === "string" ? value.split(",").map((v) => v.trim()) : [];
  }
}