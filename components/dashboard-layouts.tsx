"use client"

import type React from "react"
import { AppSidebars } from "./app-sidebars"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayouts({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppSidebars />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
