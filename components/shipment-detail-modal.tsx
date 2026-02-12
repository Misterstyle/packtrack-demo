"use client"

import React, { useEffect, useCallback, useState, useRef } from "react"
import Image from "next/image"
import {
  X,
  MapPin,
  Navigation,
  Clock,
  Copy,
  Check,
  QrCode,
  Truck,
  CircleCheck,
  AlertCircle,
  Package,
  Upload,
  ArrowDown,
  ArrowUp,
  Tag,
  Camera,
  PackageCheck,
  Send,
  CalendarClock,
  Smartphone,
  Info,
} from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import {
  MondialRelayLogo,
  DHLLogo,
  PostNLLogo,
  DPDLogo,
  VintedGoLogo,
} from "@/components/carrier-logos"
import type { ShipmentData, Carrier } from "@/types/shipment"

const carrierLogos: Record<
  Carrier,
  React.ComponentType<{ className?: string }>
> = {
  "mondial-relay": MondialRelayLogo,
  dhl: DHLLogo,
  postnl: PostNLLogo,
  dpd: DPDLogo,
  "vinted-go": VintedGoLogo,
}

const carrierNames: Record<Carrier, string> = {
  "mondial-relay": "Mondial Relay",
  dhl: "DHL",
  postnl: "PostNL",
  dpd: "DPD",
  "vinted-go": "Vinted Go",
}

function getDeadlineInfo(deadline: string | undefined): { label: string; color: "red" | "orange" | "green" } | null {
  if (!deadline) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(deadline)
  target.setHours(0, 0, 0, 0)
  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: "Verlopen!", color: "red" }
  if (diffDays === 0) return { label: "Vandaag!", color: "red" }
  if (diffDays === 1) return { label: "Nog 1 dag", color: "orange" }
  if (diffDays <= 3) return { label: `Nog ${diffDays} dagen`, color: "orange" }
  return { label: `Nog ${diffDays} dagen`, color: "green" }
}

const deadlineDetailColors = {
  red: "bg-[hsl(0,84%,94%)] border-[hsl(0,84%,86%)] text-[hsl(0,84%,40%)]",
  orange: "bg-[hsl(30,92%,92%)] border-[hsl(30,92%,82%)] text-[hsl(30,80%,35%)]",
  green: "bg-[hsl(152,60%,92%)] border-[hsl(152,60%,82%)] text-[hsl(152,60%,30%)]",
}

function QRCodePlaceholder({ pinCode }: { pinCode: string }) {
  const seed = pinCode
    .split("")
    .reduce((acc, d) => acc + Number.parseInt(d), 0)
  const cells: boolean[][] = []
  for (let row = 0; row < 21; row++) {
    cells[row] = []
    for (let col = 0; col < 21; col++) {
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
        cells[row][col] = (row * 13 + col * 7 + seed) % 3 !== 0
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

const statusDetails: Record<
  string,
  { icon: typeof Truck; label: string; description: string }
> = {
  "in-transit": {
    icon: Truck,
    label: "Onderweg",
    description: "Je pakket is onderweg naar het afhaalpunt of bezorgadres.",
  },
  "ready-for-pickup": {
    icon: MapPin,
    label: "Klaar om op te halen",
    description: "Je pakket ligt klaar bij het afhaalpunt.",
  },
  delivered: {
    icon: CircleCheck,
    label: "Bezorgd",
    description: "Je pakket is succesvol afgeleverd.",
  },
  processing: {
    icon: Package,
    label: "Wordt verwerkt",
    description: "De verzending wordt voorbereid door de verkoper.",
  },
  exception: {
    icon: AlertCircle,
    label: "Probleem",
    description:
      "Er is een probleem met de bezorging. Neem contact op met de vervoerder.",
  },
  "awaiting-dropoff": {
    icon: PackageCheck,
    label: "Wacht op afgifte",
    description:
      "Breng je pakket naar het dichtstbijzijnde afgifte- of servicepunt.",
  },
  shipped: {
    icon: Send,
    label: "Verzonden",
    description: "Je pakket is afgegeven en wordt nu verwerkt door de vervoerder.",
  },
  "picked-up": {
    icon: CircleCheck,
    label: "Opgehaald",
    description: "Je pakket is succesvol opgehaald bij het afhaalpunt.",
  },
}

interface ShipmentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  shipment: ShipmentData
  onUpdateShipment?: (id: string, updates: Partial<ShipmentData>) => void
}

export function ShipmentDetailModal({
  isOpen,
  onClose,
  shipment,
  onUpdateShipment,
}: ShipmentDetailModalProps) {
  const [pinCopied, setPinCopied] = useState(false)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const receiptInputRef = useRef<HTMLInputElement>(null)
  const CarrierLogo = carrierLogos[shipment.carrier]
  const detail = statusDetails[shipment.status] ?? statusDetails.processing
  const StatusIcon = detail.icon
  const hasPickup =
    shipment.status === "ready-for-pickup" && shipment.pickupLocation
  const isOutgoing = shipment.direction === "outgoing"
  const showLabelSection = isOutgoing || shipment.status === "ready-for-pickup"

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
    if (!shipment.pickupLocation) return
    navigator.clipboard
      .writeText(shipment.pickupLocation.pinCode)
      .catch(() => {})
    setPinCopied(true)
    setTimeout(() => setPinCopied(false), 2000)
  }

  function handleOpenRoute() {
    if (!shipment.pickupLocation) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shipment.pickupLocation.lat},${shipment.pickupLocation.lng}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      onUpdateShipment?.(shipment.id, { receiptImage: base64 })
      setReceiptUploaded(true)
      setTimeout(() => setReceiptUploaded(false), 2000)
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border animate-in slide-in-from-bottom-4 sm:zoom-in-95 fade-in duration-200">
        {/* Header with product image */}
        <div className="relative">
          <div className="relative aspect-[16/9] bg-muted overflow-hidden rounded-t-2xl">
            <Image
              src={shipment.image || "/placeholder.svg"}
              alt={shipment.itemName}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

            {/* Direction badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ${
                  isOutgoing
                    ? "bg-[hsl(160,60%,42%)]/90 text-[hsl(0,0%,100%)]"
                    : "bg-[hsl(245,58%,51%)]/90 text-[hsl(0,0%,100%)]"
                }`}
              >
                {isOutgoing ? (
                  <>
                    <ArrowUp className="w-3 h-3" /> Uitgaand
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3 h-3" /> Inkomend
                  </>
                )}
              </span>
            </div>

            <div className="absolute bottom-4 left-5 right-12">
              <StatusBadge status={shipment.status} />
              <h2 className="text-lg font-bold text-[hsl(0,0%,100%)] leading-snug mt-2 text-balance">
                {shipment.itemName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-foreground/30 text-[hsl(0,0%,100%)] hover:bg-foreground/50 backdrop-blur-sm transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Section */}
        <div className="px-5 pt-5 pb-4">
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${
              isOutgoing
                ? "bg-[hsl(160,60%,95%)] border-[hsl(160,60%,80%)]"
                : "bg-accent/60 border-primary/10"
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                isOutgoing ? "bg-[hsl(160,60%,85%)]" : "bg-primary/10"
              }`}
            >
              <StatusIcon
                className={`w-5 h-5 ${isOutgoing ? "text-[hsl(160,60%,30%)]" : "text-primary"}`}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">
                {detail.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {detail.description}
              </p>
            </div>
          </div>
        </div>

        {/* Packing Note (outgoing) */}
        {isOutgoing && shipment.packingNote && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-[hsl(160,60%,42%)]" />
              <span className="text-sm font-semibold text-card-foreground">
                Inpaknota
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[hsl(160,60%,95%)] border border-[hsl(160,60%,80%)] p-4">
              <p className="text-sm text-[hsl(160,60%,28%)] font-medium">
                {shipment.packingNote}
              </p>
            </div>
          </div>
        )}

        {/* Shipping Deadline (outgoing) */}
        {isOutgoing && shipment.shippingDeadline && (() => {
          const info = getDeadlineInfo(shipment.shippingDeadline)
          if (!info) return null
          return (
            <div className="px-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock className="w-4 h-4 text-[hsl(160,60%,42%)]" />
                <span className="text-sm font-semibold text-card-foreground">Verzenddatum</span>
              </div>
              <div className={`flex items-center justify-between rounded-xl border p-4 ${deadlineDetailColors[info.color]}`}>
                <div>
                  <p className="text-sm font-bold">{info.label}</p>
                  <p className="text-xs opacity-80 mt-0.5">
                    Verzend voor {new Date(shipment.shippingDeadline).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                <CalendarClock className="w-6 h-6 opacity-50" />
              </div>
            </div>
          )
        })()}

        {/* Vinted Go Instruction */}
        {shipment.carrier === "vinted-go" && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-[hsl(184,88%,30%)]" />
              <span className="text-sm font-semibold text-card-foreground">Verzendinstructie</span>
            </div>
            <div className="rounded-xl border border-[hsl(184,88%,82%)] bg-[hsl(184,88%,94%)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(184,88%,85%)] shrink-0 mt-0.5">
                  <Smartphone className="w-4.5 h-4.5 text-[hsl(184,88%,25%)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(184,88%,20%)] leading-relaxed">
                    Laat de QR-code scannen bij een Vinted Go-punt. Zij printen het label voor je.
                  </p>
                  <p className="text-xs text-[hsl(184,88%,30%)] mt-2 opacity-80">
                    Digitaal label -- geen printer nodig
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Packaging Photo (outgoing) */}
        {isOutgoing && shipment.packagingPhoto && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-[hsl(160,60%,42%)]" />
              <span className="text-sm font-semibold text-card-foreground">
                Verpakkingsfoto
              </span>
            </div>
            <div className="rounded-xl border border-[hsl(160,60%,80%)] overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shipment.packagingPhoto || "/placeholder.svg"}
                  alt="Verpakking"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Carrier & Tracking */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <CarrierLogo className="w-9 h-9" />
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  {carrierNames[shipment.carrier]}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {shipment.trackingCode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {shipment.lastUpdate}
            </div>
          </div>
        </div>

        {/* Pickup Section - only for ready-for-pickup with location data */}
        {hasPickup && shipment.pickupLocation && (
          <>
            {/* QR Code */}
            <div className="px-5 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-card-foreground">
                  Afhaalbewijs
                </span>
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-center">
                  <div className="w-40 h-40 rounded-lg overflow-hidden border-2 border-muted">
                    <QRCodePlaceholder
                      pinCode={shipment.pickupLocation.pinCode}
                    />
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Toon deze QR-code bij het afhaalpunt
                </p>
              </div>
            </div>

            {/* PIN Code */}
            <div className="px-5 pb-4">
              <div className="flex items-center justify-between rounded-xl bg-accent/60 border border-primary/10 p-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Pincode
                  </p>
                  <p className="text-2xl font-bold tracking-[0.2em] text-card-foreground font-mono">
                    {shipment.pickupLocation.pinCode}
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
                      <span className="text-[hsl(152,60%,42%)]">
                        Gekopieerd
                      </span>
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
            <div className="px-5 pb-4">
              <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground">
                    {shipment.pickupLocation.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {shipment.pickupLocation.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {shipment.pickupLocation.postalCode}{" "}
                    {shipment.pickupLocation.city}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {shipment.pickupLocation.openingHours}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Button */}
            <div className="px-5 pb-4">
              <button
                type="button"
                onClick={handleOpenRoute}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Route naar afhaalpunt
              </button>
            </div>
          </>
        )}

        {/* Receipt / Label Image Section (dynamic for outgoing + pickup) */}
        {showLabelSection && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <QrCode
                className={`w-4 h-4 ${isOutgoing ? "text-[hsl(160,60%,42%)]" : "text-primary"}`}
              />
              <span className="text-sm font-semibold text-card-foreground">
                {isOutgoing ? "Verzendlabel" : "Ontvangstbewijs"}
              </span>
            </div>

            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*"
              onChange={handleReceiptUpload}
              className="sr-only"
              aria-label="Upload receipt or label"
            />

            {shipment.receiptImage ? (
              <div
                className={`rounded-xl border overflow-hidden ${
                  isOutgoing
                    ? "border-[hsl(160,60%,80%)]"
                    : "border-border"
                }`}
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shipment.receiptImage || "/placeholder.svg"}
                    alt={isOutgoing ? "Verzendlabel" : "Afhaalbewijs"}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[hsl(152,60%,42%)]" />
                    <span className="text-xs font-medium text-card-foreground">
                      {isOutgoing ? "Label geupload" : "Bewijs geupload"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => receiptInputRef.current?.click()}
                    className={`text-xs font-medium hover:underline ${
                      isOutgoing
                        ? "text-[hsl(160,60%,42%)]"
                        : "text-primary"
                    }`}
                  >
                    Vervangen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => receiptInputRef.current?.click()}
                className={`flex items-center gap-3 w-full rounded-xl border-2 border-dashed px-4 py-5 transition-colors ${
                  isOutgoing
                    ? "border-[hsl(160,60%,75%)] bg-[hsl(160,60%,97%)] text-muted-foreground hover:border-[hsl(160,60%,50%)] hover:text-card-foreground"
                    : "border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-card-foreground hover:bg-accent/30"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                    isOutgoing
                      ? "bg-[hsl(160,60%,90%)]"
                      : "bg-muted"
                  }`}
                >
                  <Upload
                    className={`w-4 h-4 ${
                      isOutgoing
                        ? "text-[hsl(160,60%,35%)]"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-card-foreground">
                    {isOutgoing
                      ? "Verzendlabel / QR toevoegen"
                      : "Upload afhaalbewijs"}
                  </p>
                  <p className="text-xs">
                    {isOutgoing
                      ? "Upload het label van PostNL, DHL, etc."
                      : "QR-code, barcode of ontvangstbewijs"}
                  </p>
                </div>
              </button>
            )}

            {receiptUploaded && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-[hsl(152,60%,92%)]">
                <Check className="w-3.5 h-3.5 text-[hsl(152,60%,30%)]" />
                <span className="text-xs font-medium text-[hsl(152,60%,30%)]">
                  Opgeslagen
                </span>
              </div>
            )}
          </div>
        )}

        {/* Non-outgoing, non-pickup: still show basic receipt section */}
        {!showLabelSection && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-card-foreground">
                Ontvangstbewijs
              </span>
            </div>

            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*"
              onChange={handleReceiptUpload}
              className="sr-only"
              aria-label="Upload receipt"
            />

            {shipment.receiptImage ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="relative aspect-[4/3] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shipment.receiptImage || "/placeholder.svg"}
                    alt="Ontvangstbewijs"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[hsl(152,60%,42%)]" />
                    <span className="text-xs font-medium text-card-foreground">
                      Bewijs geupload
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => receiptInputRef.current?.click()}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Vervangen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => receiptInputRef.current?.click()}
                className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-input bg-background px-4 py-5 text-muted-foreground hover:border-primary/40 hover:text-card-foreground hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-card-foreground">
                    Upload afhaalbewijs
                  </p>
                  <p className="text-xs">
                    QR-code, barcode of ontvangstbewijs toevoegen
                  </p>
                </div>
              </button>
            )}

            {receiptUploaded && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-[hsl(152,60%,92%)]">
                <Check className="w-3.5 h-3.5 text-[hsl(152,60%,30%)]" />
                <span className="text-xs font-medium text-[hsl(152,60%,30%)]">
                  Bewijs opgeslagen
                </span>
              </div>
            )}
          </div>
        )}

        {/* WhatsApp Share Button */}
        <div className="px-5 pb-3">
          <button
            type="button"
            onClick={() => {
              let text = ""
              if (isOutgoing) {
                text = `Hoi! Kun je dit pakketje voor me wegbrengen? Code: ${shipment.trackingCode}.`
                if (shipment.packingNote) {
                  text += ` Inpaknota: ${shipment.packingNote}.`
                }
              } else {
                text = `Hoi! Kun je dit pakketje voor me ophalen? Code: ${shipment.trackingCode}.`
                if (shipment.pickupLocation) {
                  text += ` Locatie: ${shipment.pickupLocation.name}.`
                }
              }
              const url = `https://wa.me/?text=${encodeURIComponent(text)}`
              window.open(url, "_blank", "noopener,noreferrer")
            }}
            className="flex items-center justify-center gap-2.5 w-full rounded-xl py-3.5 text-sm font-semibold bg-[hsl(152,60%,42%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(152,60%,36%)] active:scale-[0.98] transition-all"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Deel met partner
          </button>
        </div>

        {/* Close Button */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-full rounded-xl py-3 text-sm font-medium text-muted-foreground hover:text-card-foreground hover:bg-secondary border border-border transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  )
}
