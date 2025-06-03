"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCartStore } from "@/lib/cartStore"; // ✅ Nuevo import

import SearchBar from "@/components/header/search-bar";
import UserMenu from "@/components/header/user-menu";
import ShoppingCart from "@/components/header/shopping-cart";
import NavigationMenu from "@/components/header/navigation-menu";
import HotProductsBanner from "@/components/header/hot-products-banner";
import OffersBanner from "@/components/header/offers-banner";
import CountdownTimer from "@/components/countdown-timer";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const cartItems = useCartStore(state => state.cartItems);
  const addToCart = useCartStore(state => state.addToCart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const pathname = usePathname();
  const isProductPage = /^\/product\/[^/]+$/.test(pathname);

  const isLoggedIn = !!isSignedIn;

  return (
    <header className="border-b sticky top-0 bg-background z-50" id="site-header">
      <HotProductsBanner />

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/tsn.png"
              alt="Store Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4">
            <UserMenu />
            <ShoppingCart />
          </div>
        </div>

        <div className="md:hidden py-3">
          <SearchBar />
        </div>

        <NavigationMenu
          mobileMenuOpen={mobileMenuOpen}
          isLoggedIn={isLoggedIn}
        />
      </div>

      <OffersBanner />
      {isProductPage && <CountdownTimer />}
    </header>
  );
}
