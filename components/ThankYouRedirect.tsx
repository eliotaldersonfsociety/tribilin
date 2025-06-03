"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ThankYouRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    router.replace(`/thankyou/ok${params ? "?" + params : ""}`);
  }, [router, searchParams]);

  return null;
}
