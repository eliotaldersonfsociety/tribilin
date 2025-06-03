// components/auth/login-dropdown-form.tsx
"use client"; // This component needs to run on the client

import { useState, useRef } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react"; // Use signIn here
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from 'react-toastify';

// Optional: You could add a prop here if you wanted to close the dropdown on success
// interface LoginDropdownFormProps {
//   onLoginSuccess?: () => void;
// }

export default function LoginDropdownForm(/* { onLoginSuccess }: LoginDropdownFormProps */) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleLogin = async () => {
    if (!recaptchaToken) {
      setError("Por favor, verifica que no eres un robot.");
      toast.error("Por favor, verifica que no eres un robot.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false, // Stay on the current page
      email,
      password,
      recaptchaToken,
    });

    setLoading(false);

    if (res?.error) {
      setError("Credenciales incorrectas. Inténtalo de nuevo."); // More specific error message
      // Reset reCAPTCHA after failed attempt
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } else {
      toast.success("¡Inicio de sesión exitoso!");
      router.push("/dashboard");
      router.refresh();
    }
  };

  // Allow login on Enter key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  return (
    // Use a div with padding matching the dropdown menu item padding
    <div className="p-2 space-y-3"> {/* Adjusted space-y for better spacing */}
        <h4 className="text-sm font-medium leading-none">Iniciar Sesión</h4> {/* Added a title */}
        <div className="space-y-2"> {/* Group inputs and button */}
            <Input
                placeholder="Correo electrónico" // More user-friendly placeholder
                type="email" // Use type="email" for better mobile keyboards/validation
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress} // Add key press handler
                disabled={loading} // Disable input while loading
            />
            <Input
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress} // Add key press handler
                disabled={loading} // Disable input while loading
            />
        </div>

        {/* ReCAPTCHA con tamaño reducido */}
        <div className="flex justify-center scale-75 origin-top">
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token) => {
                    setRecaptchaToken(token);
                    setError(null);
                }}
                onExpired={() => setRecaptchaToken(null)}
            />
        </div>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>} {/* Center error */}

        <Button onClick={handleLogin} className="w-full" disabled={loading || !recaptchaToken}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"} {/* Button text reflects state */}
        </Button>

        {/* Separator before create account link for clarity */}
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O</span>
        </div>

        <Link
            href="/auth?callbackUrl=/" // Optionally add a callback URL
            className="block text-center text-sm text-blue-500 hover:underline"
        >
            Crear cuenta
        </Link>
    </div>
  );
}