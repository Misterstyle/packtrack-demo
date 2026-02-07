"use client"

import { useEffect, useCallback } from "react"
import {
  X,
  MapPin,
  Navigation,
  Clock,
  Copy,
  Check,
  QrCode,
} from "lucide-react"
import { useState } from "react"

export interface PickupLocation {
  name: string
  address: string
  city: string
  postalCode: string
  openingHours: string
  pinCode: string
  lat: number
  lng: number
}

interface PickupDetailModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  trackingCode: string
  pickupLocation: PickupLocation
}

function QRCodePlaceholder({ pinCode }: { pinCode: string }) {
  // Generate a deterministic QR-like pattern from the pin code
  const seed = pinCode.split("").reduce((acc, d) => acc + Number.parseInt(d), 0)
  const cells: boolean[][] = []
  for (let row = 0; row < 21; row++) {
    cells[row] = []
    for (let col = 0; col < 21; col++) {
      // Position detection patterns (top-left, top-right, bottom-left)
      const inTopLeft = row < 7 && col < 7
      const inTopRight = row < 7 && col > 13
      const inBottomLeft = row > 13 && col < 7

      if (inTopLeft || inTopRight || inBottomLeft) {
        const r = row < 7 ? row : row - 14
        const c = col < 7 ? col : col - 14
        const border = r === 0 || r === 6 || c === 0 || c === 6
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        cells[row][col] = border || inner
      } else {
        // Pseudo-random data pattern
        cells[row][col] = ((row * 13 + col * 7 + seed) % 3) !== 0
      }
    }
  }

  const cellSize = 8
  const size = 21 * cellSize

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full"
      aria-label="QR code for pickup verification"
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((row, ri) =>
        row.map((filled, ci) =>
          filled ? (
            <rect
              key={`${ri}-${ci}`}
              x={ci * cellSize}
              y={ri * cellSize}
              width={cellSize}
              height={cellSize}
              fill="hsl(240, 10%, 10%)"
            />
          ) : null,
        ),
      )}
    </svg>
  )
}

export function PickupDetailModal({
  isOpen,
  onClose,
  itemName,
  trackingCode,
  pickupLocation,
}: PickupDetailModalProps) {
  const [pinCopied, setPinCopied] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleKeyDown])

  function handleCopyPin() {
    navigator.clipboard.writeText(pickupLocation.pinCode).catch(() => {})
    setPinCopied(true)
    setTimeout(() => setPinCopied(false), 2000)
  }

  function handleOpenRoute() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pickupLocation.lat},${pickupLocation.lng}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose()
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
        {/* Header with gradient accent */}
        <div className="relative bg-primary px-6 pt-6 pb-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-5 h-5 text-primary-foreground/80" />
            <span className="text-sm font-medium text-primary-foreground/80">
              Afhaalbewijs
            </span>
          </div>
          <h2 className="text-xl font-bold text-primary-foreground leading-snug text-balance">
            {itemName}
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/70 font-mono">
            {trackingCode}
          </p>
        </div>

        {/* QR Code Section */}
        <div className="px-6 -mt-4">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="w-44 h-44 rounded-lg overflow-hidden border-2 border-muted">
                <QRCodePlaceholder pinCode={pickupLocation.pinCode} />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Toon deze QR-code bij het afhaalpunt
            </p>
          </div>
        </div>

        {/* PIN Code */}
        <div className="px-6 mt-4">
          <div className="flex items-center justify-between rounded-xl bg-accent/60 border border-primary/10 p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Pincode
              </p>
              <p className="text-2xl font-bold tracking-[0.2em] text-card-foreground font-mono">
                {pickupLocation.pinCode}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyPin}
              className="flex items-center gap-1.5 rounded-lg bg-card border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-card-foreground transition-colors"
            >
              {pinCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[hsl(152,60%,42%)]" />
                  <span className="text-[hsl(152,60%,42%)]">Gekopieerd</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Kopieer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="px-6 mt-4">
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground">
                {pickupLocation.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pickupLocation.address}
              </p>
              <p className="text-xs text-muted-foreground">
                {pickupLocation.postalCode} {pickupLocation.city}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {pickupLocation.openingHours}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pt-5 pb-6">
          <button
            type="button"
            onClick={handleOpenRoute}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Route naar afhaalpunt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-full mt-2 rounded-xl py-3 text-sm font-medium text-muted-foreground hover:text-card-foreground hover:bg-secondary transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  )
}
