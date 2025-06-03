import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/components/header/page";
import EpaycoScript from "@/components/EpaycoScript";
import Footer from "@/components/footer/page";
import { UpdateHeaderHeight } from "@/components/UpdateHeaderHeight";
import ClientCartProvider from "@/components/cart";
import PageViewTracker from "@/components/PageViewTracker";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tienda Texas",
  description: "Ecommerce de productos al mayor y detal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <head>
          <EpaycoScript />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <PageViewTracker />
          <ClientCartProvider>
            <UpdateHeaderHeight />
            <Header />
            {children}
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} />
          </ClientCartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
