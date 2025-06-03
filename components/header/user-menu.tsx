"use client"; // Este componente debe ejecutarse en el cliente

// Importaciones necesarias (asegúrate de que estas estén activas)
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { User as UserIcon } from "lucide-react"; // Icono de usuario.
import { Button } from "@/components/ui/button"; // Componente Button.

export default function UserMenu() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div>
      {!isLoaded ? (
        <span className="animate-pulse h-5 w-5 bg-gray-300 rounded-full" />
      ) : isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <SignInButton mode="modal">
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <UserIcon className="h-5 w-5" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
}