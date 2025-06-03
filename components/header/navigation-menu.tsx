"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavigationMenuProps {
  mobileMenuOpen: boolean;
  isLoggedIn: boolean;
}

export default function NavigationMenu({
  mobileMenuOpen,
  isLoggedIn,
}: NavigationMenuProps) {
  return (
    <nav
      className={cn(
        "pb-3 md:flex md:justify-center items-center space-x-6 text-sm font-medium",
        mobileMenuOpen ? "block" : "hidden md:flex"
      )}
    >
      <Link href="/" className="block py-2 md:py-0">
        Home
      </Link>
      <Link href="/categories" className="block py-2 md:py-0">
        Categories
      </Link>
      <Link href="/offers" className="block py-2 md:py-0 relative">
        Offers
        <Badge variant="outline" className="ml-1 bg-white text-primary">
          New
        </Badge>
      </Link>

      <div className="md:hidden flex flex-col space-y-2 pt-2 border-t mt-2">
        {!isLoggedIn && (
          <>
            <Link href="/login" className="block py-1">
              Login
            </Link>
            <Link href="/register" className="block py-1">
              Create account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
