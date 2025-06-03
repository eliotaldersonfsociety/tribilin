import type React from "react"
import "../globals.css"
import "./dashboard-variables.css"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
