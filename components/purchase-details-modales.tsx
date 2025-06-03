"use client"

import { Package, User, CreditCard, MapPin, RefreshCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface PurchaseDetailsModalProps {
  purchase: any
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (newStatus: string) => void
}

export function PurchaseDetailsModal({ purchase, isOpen, onClose, onStatusChange }: PurchaseDetailsModalProps) {
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange) return
    try {
      setLoading(true)
      await onStatusChange(newStatus)
    } catch (error) {
      console.error('Error al cambiar el estado:', error)
    } finally {
      setLoading(false)
    }
  }

  // Lógica para parsear los productos
  let items: any[] = []
  if (Array.isArray(purchase?.items)) {
    items = purchase.items
  } else if (Array.isArray(purchase?.products)) {
    items = purchase.products
  } else if (typeof purchase?.products === "string") {
    try {
      items = JSON.parse(purchase.products)
    } catch {
      items = []
    }
  }

  const validItems = Array.isArray(items)
    ? items.filter((item: any) => item && typeof item === "object" && "name" in item)
    : []

  console.log("Modal recibe:", purchase)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalles de Compra #{purchase?.id || 'N/A'}
          </DialogTitle>
          <DialogDescription>
            {(() => {
              try {
                const timestamp = Number(purchase?.created_at) * 1000
                const date = new Date(timestamp)
                if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
                  return `Realizada el ${new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}`
                }
                return `Realizada el ${date.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}`
              } catch (error) {
                return 'Fecha no disponible'
              }
            })()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Estado de la compra */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado:</span>
            <Badge variant={(purchase?.transactionState === "Enviado" || purchase?.status === "Entregado") ? "default" : "outline"}>
              {purchase?.transactionState || purchase?.status || 'Pendiente'}
            </Badge>
          </div>

          <Separator />

          {/* Productos */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">Productos</h3>
            <div className="space-y-3">
              {validItems.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay productos en esta compra.</div>
              ) : (
                validItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="pr-2">
                      <p className="font-medium text-sm sm:text-base">{item.name || item.description || "Sin nombre"}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Cantidad: {item.quantity || 1}</p>
                    </div>
                    <p className="font-medium text-sm sm:text-base whitespace-nowrap">${item.price || item.total || 0}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Detalles de pago */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Detalles de Pago
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal:</span>
                <span>${purchase?.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Envío:</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Taxes:</span>
                <span>${purchase?.taxes?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Propina:</span>
                <span>${purchase?.tip?.toFixed(2) || '0.00'}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${purchase?.total?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium">Método de pago:</p>
                <p className="text-sm">{
                  purchase?.type === 'CARD' ? 'Tarjeta de Crédito/Débito' :
                  purchase?.type === 'CASH' ? 'Efectivo' :
                  purchase?.type === 'TRANSFER' ? 'Transferencia Bancaria' :
                  purchase?.type || 'No especificado'
                }</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Datos del usuario */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Datos del Cliente
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Nombre:</span> {purchase?.customer?.name || 'No disponible'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {purchase?.customer?.email || 'No disponible'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Dirección de envío */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección de Envío
            </h3>
            <div className="space-y-1 text-sm">
              {purchase?.customer?.address ? (
                <>
                  <p>{purchase.customer.address}</p>
                  {purchase.customer.house_apt && (
                    <p>Apt/Casa: {purchase.customer.house_apt}</p>
                  )}
                  {(purchase.customer.city || purchase.customer.state || purchase.customer.postal_code) && (
                    <p>
                      {[
                        purchase.customer.city,
                        purchase.customer.state,
                        purchase.customer.postal_code
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {purchase.customer.phone && (
                    <p>Teléfono: {purchase.customer.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Dirección no disponible</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
