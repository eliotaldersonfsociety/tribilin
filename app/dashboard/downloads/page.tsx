import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Download, FileText, Music, Video, ImageIcon } from "lucide-react"

export default function DownloadsPage() {
  // Datos de ejemplo para las descargas
  const downloads = [
    {
      id: "1",
      name: "Manual de usuario.pdf",
      type: "document",
      size: "2.4 MB",
      date: "20/04/2025",
      icon: FileText,
    },
    {
      id: "2",
      name: "Tutorial de instalación.mp4",
      type: "video",
      size: "156 MB",
      date: "18/04/2025",
      icon: Video,
    },
    {
      id: "3",
      name: "Catálogo de productos.pdf",
      type: "document",
      size: "8.7 MB",
      date: "15/04/2025",
      icon: FileText,
    },
    {
      id: "4",
      name: "Tono de llamada.mp3",
      type: "audio",
      size: "3.2 MB",
      date: "10/04/2025",
      icon: Music,
    },
    {
      id: "5",
      name: "Fondo de pantalla.jpg",
      type: "image",
      size: "1.8 MB",
      date: "05/04/2025",
      icon: ImageIcon,
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <h2 className="text-2xl font-bold mb-4">Mis Descargas</h2>

        <div className="rounded-lg border shadow-sm mb-6">
          <div className="p-4 md:p-6">
            <p className="text-muted-foreground mb-4">
              Aquí encontrarás todos tus archivos descargados. Puedes descargarlos nuevamente o eliminarlos.
            </p>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Descargar todo
            </Button>
          </div>
        </div>

        <div className="rounded-lg border shadow-sm">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium">Nombre</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs sm:text-sm font-medium">Tipo</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs sm:text-sm font-medium">Tamaño</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs sm:text-sm font-medium">Fecha</th>
                    <th className="px-4 py-3 text-right text-xs sm:text-sm font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((download) => (
                    <tr key={download.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-xs sm:text-sm">
                        <div className="flex items-center">
                          {download.icon && <download.icon className="h-4 w-4 mr-2 flex-shrink-0" />}
                          <span className="truncate max-w-[150px] sm:max-w-none">{download.name}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm capitalize">{download.type}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm">{download.size}</td>
                      <td className="hidden md:table-cell px-4 py-3 text-xs sm:text-sm">{download.date}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Descargar</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
