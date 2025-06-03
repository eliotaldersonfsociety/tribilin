"use client"

import { useState } from "react"
import { Download, Home, LogOut, Package, User, Menu, X, Heart, ShoppingBasket, CirclePlus, SquarePen, BadgeDollarSignIcon, ChartColumnBigIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function AppSidebars() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(false)

  const routes = [
    { name: "Inicio", href: "/panel", icon: Home },
    { name: "Perfil", href: "", icon: User },
    { name: "Compras", href: "/panel/purchases", icon: ShoppingBasket },
    {
      name: "Productos",
      icon: Package,
      children: [
        { name: "Crear", href: "/panel/productos/new", icon: CirclePlus },
        { name: "Editar", href: "/panel/productos", icon: SquarePen },
      ],
    },
    { name: "Saldo", href: "/panel/saldo", icon: BadgeDollarSignIcon },
    { name: "Estadisticas", href: "/panel/estadisticas", icon: ChartColumnBigIcon },
  ]

  const isActive = (path: string) => pathname === path

  const handleOpenClerkProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.Clerk) {
      window.Clerk.openUserProfile();
    }
  };

  return (
    <div className="bg-black text-white border-b">
      {/* Menú hamburguesa solo en móvil */}
      <div className="flex md:hidden items-center justify-between px-4 py-2">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Abrir menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Link href="/panel" className="flex items-center">
          <Image
            src="/tsb.png"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Menú horizontal en escritorio */}
      <div className="hidden md:block">
        <div className="container mx-auto">
          <nav className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/panel" className="flex items-center">
                <Image
                  src="/tsb.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </Link>
              <div className="flex items-center gap-2">
                {routes
                  .filter(route => route.href)
                  .map((route) => (
                    <Link
                      key={route.href}
                      href={route.href!}
                      onClick={route.name === "Perfil" ? handleOpenClerkProfile : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive(route.href!) ? "bg-white text-orange-800" : "hover:bg-orange-700"
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      {route.name}
                    </Link>
                  ))}
              </div>
            </div>
            <Link
              href="/logout"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </Link>
          </nav>
        </div>
      </div>

      {/* Drawer lateral para móvil */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/40 md:hidden" onClick={() => setOpen(false)}>
          <nav
            className="fixed top-0 left-0 h-full w-64 bg-black text-white flex flex-col p-6 animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <Link href="/panel" className="flex items-center">
                <Image
                  src="/tsb.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {routes.map((route) =>
              route.children ? (
                <div key={route.name} className="relative">
                  <button
                    onClick={() => setOpenSubmenu(!openSubmenu)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      openSubmenu ? "bg-orange-700" : "hover:bg-orange-700"
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.name}
                  </button>
                  {openSubmenu && (
                    <div className="ml-6 mt-1 flex flex-col gap-1">
                      {route.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            pathname === child.href ? "bg-white text-orange-800" : "hover:bg-orange-700"
                          )}
                        >
                          <child.icon className="h-5 w-5" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === route.href ? "bg-white text-orange-800" : "hover:bg-orange-700"
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.name}
                </Link>
              )
            )}
            <div className="mt-8 border-t border-orange-700 pt-4">
              <Link
                href="/logout"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-white hover:bg-orange-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </Link>
            </div>
          </nav>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease;
        }
      `}</style>
    </div>
  )
}
