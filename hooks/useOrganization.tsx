"use client";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useRoleRedirect = () => {
  const { user } = useUser();
  const router = useRouter();

  return () => {
    console.log('useRoleRedirect: user:', user);
    if (user?.publicMetadata?.isAdmin) {
      console.log('Redirigiendo a /panel (admin)');
      router.push("/panel");
    } else {
      console.log('Redirigiendo a /dashboard (usuario)');
      router.push("/dashboard");
    }
  };
};

export default useRoleRedirect;