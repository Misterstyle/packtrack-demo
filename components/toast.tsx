"use client"

import { useEffect, useState } from "react"
import { Check, X, AlertCircle } from "lucide-react"

export type ToastType = "success" | "error" | "info"

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade-out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColors = {
    success: "bg-[hsl(152,60%,95%)] border-[hsl(152,60%,80%)]",
    error: "bg-[hsl(0,84%,94%)] border-[hsl(0,84%,86%)]",
    info: "bg-[hsl(220,90%,95%)] border-[hsl(220,90%,80%)]",
  }

  const textColors = {
    success: "text-[hsl(152,60%,25%)]",
    error: "text-[hsl(0,84%,40%)]",
    info: "text-[hsl(220,90%,35%)]",
  }

  const iconBgColors = {
    success: "bg-[hsl(152,60%,42%)]",
    error: "bg-[hsl(0,84%,50%)]",
    info: "bg-[hsl(220,90%,50%)]",
  }

  const Icon = type === "success" ? Check : type === "error" ? X : AlertCircle

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div
        className={`flex items-center gap-3 rounded-xl border ${bgColors[type]} px-4 py-3 shadow-lg max-w-sm`}
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${iconBgColors[type]} shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <p className={`text-sm font-medium ${textColors[type]} flex-1`}>{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className={`${textColors[type]} hover:opacity-70 transition-opacity`}
          aria-label="Sluit notificatie"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast container for managing multiple toasts
interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const ToastContainer = () => (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ bottom: `${24 + index * 80}px` }}
          className="fixed right-6 z-50"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  )

  return { showToast, ToastContainer }
}
