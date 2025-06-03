"use client";
import { Suspense } from "react";
import ThankYouRedirect from "@/components/ThankYouRedirect";

export default function ThankYouPage() {
  return (
    <Suspense>
      <ThankYouRedirect />
    </Suspense>
  );
}
