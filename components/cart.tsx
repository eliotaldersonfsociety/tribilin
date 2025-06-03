"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cartStore";

const ClientCartProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    if (pathname === "/thx" || pathname === "/thankyou") {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <>{children}</>;
};

export default ClientCartProvider;
