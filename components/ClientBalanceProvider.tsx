"use client";
import { useUser } from "@clerk/nextjs";

export default function ClientBalanceProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser();
  if (!isLoaded) return null;
  return <>{children}</>;
}
