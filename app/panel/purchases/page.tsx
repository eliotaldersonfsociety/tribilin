// app/panel/purchases/page.tsx
"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PurchasesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/panel/purchases/cliente"); // o la ruta que corresponda
  }, [router]);
  return null;
}
