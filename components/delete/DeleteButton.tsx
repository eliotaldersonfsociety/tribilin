"use client";

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  id: string | number;
  className?: string;
}

export default function DeleteButton({ id, className }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (!id || (typeof id !== "string" && typeof id !== "number")) {
      alert("ID de producto inválido");
      return;
    }

    if (!confirm("¿Estás seguro que deseas eliminar este producto permanentemente?")) return;

    try {
      const numericId = Number(id);
      if (isNaN(numericId)) throw new Error("ID numérico inválido");

      const res = await fetch(`/api/product/${numericId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar el producto");
      }

      alert("Producto eliminado exitosamente");
      window.location.href = "/list";
    } catch (error) {
      console.error("Error completo:", error);
      alert(error instanceof Error ? error.message : "Error desconocido al eliminar");
    }
  };

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDelete}
      className={`gap-2 ${className}`}
    >
      <Trash className="h-4 w-4" />
      Eliminar Producto
    </Button>
  );
}
