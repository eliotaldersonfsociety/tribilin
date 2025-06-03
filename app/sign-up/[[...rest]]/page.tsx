// app/sign-up/[[...rest]]/page.tsx
"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <SignUp />
    </div>
  );
}