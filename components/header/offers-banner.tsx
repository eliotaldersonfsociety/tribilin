import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function OffersBanner() {
  return (
    <Link href="/offers" className="block w-full bg-gray-100 text-gray-800 py-2 hover:bg-gray-200 transition-colors">
      <div className="container mx-auto flex items-center justify-center">
        <span className="font-medium">Mira las últimas ofertas</span>
        <ArrowRight className="h-4 w-4 ml-2" />
      </div>
    </Link>
  )
}

