"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import RealTimeVisitors from "./real-time-visitors"
import { usePageView } from "@/hooks/usePageView"

const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658", "#ff8042"]

export default function WebAnalytics() {
  usePageView();
  const [stats, setStats] = useState<{
    total: number;
    rutasCount: {[key: string]: number};
    countryCount: {[key: string]: number};
  } | null>(null);
  const [timeRange, setTimeRange] = useState("anual")

  // Estado para usuarios activos y vistas de página
  const [activeUsers, setActiveUsers] = useState(0)
  const [activePages, setActivePages] = useState(0)

  // PING para mantener la sesión activa (esto ya lo tienes en RealTimeVisitors)
  // Solo necesitas obtener el número real de usuarios activos:
  useEffect(() => {
    const sessionId = window.sessionStorage.getItem("sessionId") || crypto.randomUUID();
    window.sessionStorage.setItem("sessionId", sessionId);

    const ping = () => {
      fetch("/api/active-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, pathname: window.location.pathname }),
      });
    };

    ping();
    const interval = setInterval(ping, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cacheKey = "web-analytics-stats";
    const cacheTimeKey = "web-analytics-stats-time";
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

    const now = Date.now();
    const cachedStats = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cachedStats && cachedTime && now - Number(cachedTime) < CACHE_DURATION) {
      setStats(JSON.parse(cachedStats));
      return;
    }

    fetch("/api/visitas")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheTimeKey, now.toString());
      });
  }, []);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      const res = await fetch("/api/active-users")
      const data = await res.json()
      setActiveUsers(data.activeUsers)
      setActivePages(data.activePages)
    }
    fetchActiveUsers()
    const interval = setInterval(fetchActiveUsers, 5000)
    return () => clearInterval(interval)
  }, [])

  // Función para formatear números grandes
  const formatNumber = (number: number | undefined | null) => {
    if (typeof number !== "number" || isNaN(number)) return "0";
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M"
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K"
    }
    return number.toString();
  }

  if (!stats) return <div className="text-center py-10">Cargando estadísticas...</div>

  // Prepara los datos para el gráfico de rutas más visitadas
  const pageData = Object.entries(stats.rutasCount || {}).map(([name, visits]) => ({
    name,
    visits: Number(visits) || 0,
  }));

  // Prepara los datos para la gráfica de países
  const countryData = Object.entries(stats.countryCount || {}).map(([name, visits]) => ({
    name,
    visits: Number(visits) || 0,
  }));

  return (
    <div className="grid gap-6">
      {/* Panel de visitantes en tiempo real */}
      <RealTimeVisitors activeUsers={activeUsers} pageViews={stats.total} />
      <Tabs defaultValue="anual" className="w-full" onValueChange={setTimeRange}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold">Estadísticas de Tráfico</h2>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Gráfico 1: Total de Visitas */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Total de Visitas</CardTitle>
              <CardDescription>{formatNumber(stats?.total ?? 0)} visitas en total</CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="anual" className="mt-0">
                <div className="w-full h-[220px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: "Visitas", visits: stats?.total ?? 0 }]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={formatNumber} />
                      <Bar dataKey="visits" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </CardContent>
          </Card>

          {/* Gráfico 2: Páginas más Visitadas */}
          <Card className="md:col-span-3 lg:col-span-2">
            <CardHeader>
              <CardTitle>Páginas más Visitadas</CardTitle>
              <CardDescription>Rutas con mayor tráfico en el sitio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[220px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickFormatter={formatNumber} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Bar dataKey="visits" fill="#82ca9d">
                      {pageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico 3: Países con más visitas */}
          <Card className="md:col-span-3 lg:col-span-1">
            <CardHeader>
              <CardTitle>Países con más visitas</CardTitle>
              <CardDescription>Top países por visitas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[220px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Bar dataKey="visits" fill="#ffc658">
                      {countryData.map((entry, index) => {
                        // const ip = entry.name;
                        // let country = "Desconocido";
                        // try {
                        //   const geo = geoip.lookup(ip);
                        //   if (geo && geo.country) country = geo.country;
                        // } catch (e) {
                        //   console.log("[VISITAS] Error geoip para IP:", ip, e);
                        // }
                        return (
                          <Cell key={`cell-country-${index}`} fill={COLORS[index % COLORS.length]} />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  )
}
