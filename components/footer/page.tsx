"use client";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#282c31] text-white" id="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Company Description */}
          <div>
            <Image
              src="/tsb.png"
              alt="Texas Store Logo"
              width={200}
              height={60}
              className="mb-4"
            />
            <p className="text-sm">
              Texas Tienda es una empresa líder en la venta de artículos diversos por internet. Ubicados en Texas,
              EE.UU., ofrecemos una amplia gama de productos de calidad con envíos a todo el país. Nuestra misión es
              proporcionar una experiencia de compra excepcional con un servicio al cliente de primera clase.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-gray-300">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300">
                  Productos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contáctanos</h3>
            <p>123 Main St, Houston, TX 77001</p>
            <p>Teléfono: (555) 123-4567</p>
            <p>Email: info@texasstore.com</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-gray-300">
                <Facebook />
              </a>
              <a href="#" className="hover:text-gray-300">
                <Instagram />
              </a>
              <a href="#" className="hover:text-gray-300">
                <Twitter />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and Policies */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-center">
          <p>&copy; 2023 Texas Store. Todos los derechos reservados.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-gray-300">
              Términos de Servicio
            </a>
            <a href="#" className="hover:text-gray-300">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-gray-300">
              Política de Devoluciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
