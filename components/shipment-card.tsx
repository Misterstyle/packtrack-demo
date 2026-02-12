"use client"

import React, { useRef } from "react"
import Image from "next/image"
import {
  ChevronRight,
  Camera,
  Check,
  MapPin,
  ArrowDown,
  ArrowUp,
  Tag,
  QrCode,
  CalendarClock,
  Smartphone,
} from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { MondialRelayLogo, DHLLogo, PostNLLogo, DPDLogo, VintedGoLogo } from "@/components/carrier-logos"
import { isCompletedStatus } from "@/contexts/ShipmentContext"
import type { Carrier, ShipmentData } from "@/types/shipment"

const carrierLogos: Record<Carrier, React.ComponentType<{ className?: string }>> = {
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

function getDeadlineInfo(deadline: string | undefined): { label: string; color: "red" | "orange" | "green" | "muted" } | null {
  if (!deadline) return null
  const now = new Date()
  const target = new Date(deadline)

  // Use hours-based diff for more precise "today" and "< 24h" logic
  const diffMs = target.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 0) return { label: "Verlopen!", color: "red" }
  if (diffHours < 12) return { label: "Vandaag!", color: "red" }
  if (diffHours < 24) return { label: "Minder dan 24u", color: "orange" }
  if (diffDays === 1) return { label: "Nog 1 dag", color: "orange" }
  if (diffDays <= 3) return { label: `Nog ${diffDays} dagen`, color: "orange" }
  return { label: `Nog ${diffDays} dagen`, color: "green" }
}

const deadlineColors = {
  red: "bg-[hsl(0,84%,94%)] text-[hsl(0,84%,40%)] border-[hsl(0,84%,86%)]",
  orange: "bg-[hsl(30,92%,92%)] text-[hsl(30,80%,35%)] border-[hsl(30,92%,82%)]",
  green: "bg-[hsl(152,60%,92%)] text-[hsl(152,60%,30%)] border-[hsl(152,60%,82%)]",
  muted: "bg-muted text-muted-foreground border-border",
}

interface ShipmentCardProps {
  shipment: ShipmentData
  onClick?: (shipment: ShipmentData) => void
  onUploadReceipt?: (id: string, base64: string) => void
}

export function ShipmentCard({ shipment, onClick, onUploadReceipt }: ShipmentCardProps) {
  const CarrierLogo = carrierLogos[shipment.carrier]
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isOutgoing = shipment.direction === "outgoing"
  const isReadyForPickup = shipment.status === "ready-for-pickup"
  const isCompleted = isCompletedStatus(shipment.status)
  const hasReceipt = !!shipment.receiptImage
  const needsLabel = isOutgoing && !hasReceipt

  function handleUploadClick(e: React.MouseEvent) {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      onUploadReceipt?.(shipment.id, base64)
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Card border accent color
  const borderClass = isOutgoing
    ? "border-[hsl(160,60%,80%)]/60 hover:border-[hsl(160,60%,50%)]/40"
    : "border-border hover:border-primary/20"

  return (
    <div
      className={`group relative flex flex-col rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${borderClass} ${isCompleted ? "opacity-60" : ""}`}
      onClick={() => onClick?.(shipment)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.(shipment)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Bekijk details voor ${shipment.itemName}`}
    >
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Upload screenshot of barcode or label"
      />

      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <Image
          src={shipment.image || "/placeholder.svg"}
          alt={shipment.itemName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top left: status badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={shipment.status} />
        </div>

        {/* Top right: direction badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${
              isOutgoing
                ? "bg-[hsl(160,60%,42%)]/90 text-[hsl(0,0%,100%)]"
                : "bg-[hsl(245,58%,51%)]/90 text-[hsl(0,0%,100%)]"
            }`}
          >
            {isOutgoing ? (
              <><ArrowUp className="w-2.5 h-2.5" /> Uitgaand</>
            ) : (
              <><ArrowDown className="w-2.5 h-2.5" /> Inkomend</>
            )}
          </span>

          {/* Receipt thumbnail */}
          {hasReceipt && (
            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-card shadow-md bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shipment.receiptImage || "/placeholder.svg"}
                alt="Barcode"
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[hsl(152,60%,42%)] flex items-center justify-center border border-card">
                <Check className="w-2.5 h-2.5 text-[hsl(0,0%,100%)]" />
              </div>
            </div>
          )}
        </div>

        {/* Outgoing accent stripe at bottom of image */}
        {isOutgoing && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[hsl(160,60%,42%)] to-[hsl(160,84%,50%)]" />
        )}

        {/* Completed overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-[hsl(152,60%,42%)]/10 flex items-center justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-[hsl(152,60%,42%)]/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-[hsl(0,0%,100%)]" />
              <span className="text-xs font-bold text-[hsl(0,0%,100%)]">Voltooid</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-card-foreground leading-snug line-clamp-2">
            {shipment.itemName}
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
        </div>

        {/* Packing note (outgoing only) */}
        {isOutgoing && shipment.packingNote && (
          <div className="flex items-center gap-1.5 rounded-md bg-[hsl(160,60%,95%)] px-2.5 py-1.5">
            <Tag className="w-3 h-3 text-[hsl(160,60%,35%)] shrink-0" />
            <span className="text-xs text-[hsl(160,60%,28%)] font-medium truncate">
              {shipment.packingNote}
            </span>
          </div>
        )}

        {/* Deadline countdown badge */}
        {(() => {
          const info = getDeadlineInfo(shipment.shippingDeadline)
          if (!info) return null
          return (
            <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${deadlineColors[info.color]}`}>
              <CalendarClock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-semibold">{info.label}</span>
              {shipment.shippingDeadline && (
                <span className="text-xs opacity-70 ml-auto">
                  {new Date(shipment.shippingDeadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          )
        })()}

        {/* Vinted Go digital label badge */}
        {shipment.carrier === "vinted-go" && (
          <div className="flex items-center gap-1.5 rounded-lg bg-[hsl(184,88%,94%)] border border-[hsl(184,88%,82%)] px-2.5 py-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[hsl(184,88%,30%)] shrink-0" />
            <span className="text-xs font-medium text-[hsl(184,88%,25%)]">Digitaal label (geen printer nodig)</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CarrierLogo className="w-7 h-7" />
            <span className="text-xs text-muted-foreground font-medium">
              {carrierNames[shipment.carrier]}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{shipment.lastUpdate}</span>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">{shipment.trackingCode}</p>
        </div>

        {/* Smart action button */}
        {needsLabel ? (
          /* Outgoing without label -- show "Add Label/QR" */
          <button
            type="button"
            onClick={handleUploadClick}
            className="flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold bg-[hsl(160,60%,42%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(160,60%,36%)] active:scale-[0.98] transition-all"
          >
            <QrCode className="w-4 h-4" />
            Verzendlabel toevoegen
          </button>
        ) : (
          /* Default upload screenshot button */
          <button
            type="button"
            onClick={handleUploadClick}
            className={`flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold active:scale-[0.98] transition-all ${
              hasReceipt
                ? "bg-[hsl(152,60%,92%)] text-[hsl(152,60%,30%)] hover:bg-[hsl(152,60%,86%)]"
                : isOutgoing
                  ? "bg-[hsl(160,60%,42%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(160,60%,36%)]"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {hasReceipt ? (
              <>
                <Check className="w-4 h-4" />
                {isOutgoing ? "Label geupload" : "Screenshot geupload"}
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Upload screenshot
              </>
            )}
          </button>
        )}

        {/* Afhaalbewijs shortcut - only for Ready for Pickup */}
        {isReadyForPickup && shipment.pickupLocation && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(shipment)
            }}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-[hsl(152,60%,92%)] py-2 text-xs font-semibold text-[hsl(152,60%,30%)] hover:bg-[hsl(152,60%,86%)] active:scale-[0.98] transition-all"
          >
            <MapPin className="w-3.5 h-3.5" />
            Bekijk afhaalbewijs
          </button>
        )}
      </div>
    </div>
  )
}
