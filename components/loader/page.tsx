//@/app/components/loader/page.tsx
"use client"

import { useEffect, useState } from "react"

interface SVGCartLoaderProps {
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  loadingText?: string
  errorText?: string
  size?: "small" | "medium" | "large"
}

export function SVGCartLoader({
  primaryColor = "hsl(357, 86.00%, 28.00%)",
  backgroundColor = "hsl(223, 10%, 90%)",
  textColor = "hsl(223, 10%, 10%)",
  loadingText = "Cargando productos...",
  errorText = "Esto está tardando demasiado. Algo no va bien.",
  size = "medium",
}: SVGCartLoaderProps) {
  const [mounted, setMounted] = useState(false)

  // Size mapping for the SVG
  const sizeMap = {
    small: "6em",
    medium: "8em",
    large: "10em",
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="preloader">
      <svg
        className="cart"
        role="img"
        aria-label="Animación de carrito de compras"
        viewBox="0 0 128 128"
        width={sizeMap[size]}
        height={sizeMap[size]}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
          <g className="cart__track" stroke="currentColor" style={{ opacity: 0.1 }}>
            <polyline points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" />
            <circle cx="43" cy="111" r="13" />
            <circle cx="102" cy="111" r="13" />
          </g>
          <g className="cart__lines" stroke={primaryColor}>
            <polyline className="cart__top" points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" />
            <g className="cart__wheel1" transform="rotate(-90,43,111)">
              <circle className="cart__wheel-stroke" cx="43" cy="111" r="13" />
            </g>
            <g className="cart__wheel2" transform="rotate(90,102,111)">
              <circle className="cart__wheel-stroke" cx="102" cy="111" r="13" />
            </g>
          </g>
        </g>
      </svg>
      <div className="preloader__text">
        <p className="preloader__msg">{loadingText}</p>
        <p className="preloader__msg preloader__msg--last">{errorText}</p>
      </div>

      <style jsx global>{`
        .preloader {
          text-align: center;
          max-width: 20em;
          width: 100%;
        }
        .preloader__text {
          position: relative;
          height: 1.5em;
          color: ${textColor};
        }
        .preloader__msg {
          animation: msg 0.3s 13.7s linear forwards;
          position: absolute;
          width: 100%;
        }
        .preloader__msg--last {
          animation-direction: reverse;
          animation-delay: 14s;
          visibility: hidden;
        }
        .cart {
          display: block;
          margin: 0 auto 1.5em auto;
        }
        .cart__lines,
        .cart__top,
        .cart__wheel1,
        .cart__wheel2,
        .cart__wheel-stroke {
          animation: cartLines 2s ease-in-out infinite;
        }
        .cart__top {
          animation-name: cartTop;
          stroke-dasharray: 338 338;
          stroke-dashoffset: -338;
        }
        .cart__wheel1 {
          animation-name: cartWheel1;
          transform: rotate(-0.25turn);
          transform-origin: 43px 111px;
        }
        .cart__wheel2 {
          animation-name: cartWheel2;
          transform: rotate(0.25turn);
          transform-origin: 102px 111px;
        }
        .cart__wheel-stroke {
          animation-name: cartWheelStroke;
          stroke-dasharray: 81.68 81.68;
          stroke-dashoffset: 81.68;
        }

        /* Animations */
        @keyframes msg {
          from {
            opacity: 1;
            visibility: visible;
          }
          99.9% {
            opacity: 0;
            visibility: visible;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
        @keyframes cartLines {
          from,
          to {
            opacity: 0;
          }
          8%,
          92% {
            opacity: 1;
          }
        }
        @keyframes cartTop {
          from {
            stroke-dashoffset: -338;
          }
          50% {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: 338;
          }
        }
        @keyframes cartWheel1 {
          from {
            transform: rotate(-0.25turn);
          }
          to {
            transform: rotate(2.75turn);
          }
        }
        @keyframes cartWheel2 {
          from {
            transform: rotate(0.25turn);
          }
          to {
            transform: rotate(3.25turn);
          }
        }
        @keyframes cartWheelStroke {
          from,
          to {
            stroke-dashoffset: 81.68;
          }
          50% {
            stroke-dashoffset: 40.84;
          }
        }
      `}</style>
    </div>
  )
}
