"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, Users } from "lucide-react"
import { useEffect } from "react"

export default function RealTimeVisitors({ activeUsers, pageViews }: { activeUsers: number, pageViews: number }) {
  // El estado y la simulación ahora se controlan desde el padre
  // Solo renderiza los datos recibidos por props
  const trend = "stable" // Puedes mejorar esto si quieres pasar también la tendencia

  useEffect(() => {
    const sessionId = window.sessionStorage.getItem("sessionId") || crypto.randomUUID();
    window.sessionStorage.setItem("sessionId", sessionId);

    const ping = () => {
      fetch("/api/active-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    };

    ping();
    const interval = setInterval(ping, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="mr-4">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 flex items-center">
                {activeUsers}
                {/* Puedes agregar flechas de tendencia si lo deseas */}
              </h3>
              <p className="text-sm text-green-600 dark:text-green-500">Usuarios activos ahora</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="mr-4">
              <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">{pageViews}</h3>
              <p className="text-sm text-green-600 dark:text-green-500">Vistas de página / min</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-green-700 dark:text-green-500 mb-1">Actividad en tiempo real</div>
          <div className="flex space-x-1 overflow-hidden h-6">
            {Array.from({ length: Math.min(activeUsers, 25) }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-full rounded-full bg-green-500 opacity-80"
                style={{
                  height: `${Math.max(30, Math.random() * 100)}%`,
                  animationDelay: `${i * 0.1}s`,
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            ))}
            {activeUsers > 25 && (
              <div className="flex items-center text-xs text-green-700 dark:text-green-400">
                +{activeUsers - 25} más
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
