"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    minutes: 15,
    seconds: 0,
  })

  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime.minutes === 0 && prevTime.seconds === 0) {
          clearInterval(timer)
          return prevTime
        }

        let newSeconds = prevTime.seconds - 1
        let newMinutes = prevTime.minutes

        if (newSeconds < 0) {
          newSeconds = 59
          newMinutes = newMinutes - 1
        }

        if (newMinutes < 5 && !isBlinking) {
          setIsBlinking(true)
        }

        return {
          minutes: newMinutes,
          seconds: newSeconds,
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isBlinking])

  return (
    <div className="w-full bg-red-600 text-white text-center h-8 flex items-center justify-center">
      <Clock className="h-4 w-4 mr-1" />
      <span className="font-medium text-xs sm:text-sm">¡Date prisa! Esta oferta termina en:</span>
      <span className={`font-bold tabular-nums ml-2 text-base sm:text-lg ${isBlinking ? "animate-pulse" : ""}`}>
        {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  )
}
