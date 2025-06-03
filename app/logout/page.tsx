"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Aquí iría la lógica para cerrar sesión
    // Por ejemplo: eliminar tokens, cookies, etc.

    // Redirigir al inicio después de cerrar sesión
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Cerrando sesión...</h1>
        <p className="mt-2">Serás redirigido en unos momentos.</p>
      </div>
    </div>
  )
}
