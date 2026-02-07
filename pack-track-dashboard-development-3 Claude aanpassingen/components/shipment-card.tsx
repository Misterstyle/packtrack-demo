'use client';

import React from "react"
import Image from "next/image"
import { ChevronRight, MapPin } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import type { ShipmentStatus } from "@/components/status-badge"
import { MondialRelayLogo, DHLLogo, PostNLLogo, DPDLogo } from "@/components/carrier-logos"
import type { PickupLocation } from "@/components/pickup-detail-modal"

type Carrier = "mondial-relay" | "dhl" | "postnl" | "dpd"

const carrierLogos: Record<Carrier, React.ComponentType<{ className?: string }>> = {
  "mondial-relay": MondialRelayLogo,
  dhl: DHLLogo,
  postnl: PostNLLogo,
  dpd: DPDLogo,
}

const carrierNames: Record<Carrier, string> = {
  "mondial-relay": "Mondial Relay",
  dhl: "DHL",
  postnl: "PostNL",
  dpd: "DPD",
}

export interface ShipmentData {
  id: string
  itemName: string
  image: string
  status: ShipmentStatus
  carrier: Carrier
  trackingCode: string
  lastUpdate: string
  pickupLocation?: PickupLocation
}

interface ShipmentCardProps {
  shipment: ShipmentData
  onPickupDetail?: (shipment: ShipmentData) => void
}

export function ShipmentCard({ shipment, onPickupDetail }: ShipmentCardProps) {
  const CarrierLogo = carrierLogos[shipment.carrier]
  const isReadyForPickup = shipment.status === "ready-for-pickup" && shipment.pickupLocation

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <Image
          src={shipment.image || "/placeholder.svg"}
          alt={shipment.itemName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={shipment.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-card-foreground leading-snug line-clamp-2">
            {shipment.itemName}
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
        </div>

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

        {/* Afhaalbewijs Button - only for Ready for Pickup */}
        {isReadyForPickup && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPickupDetail?.(shipment)
            }}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-[hsl(152,60%,92%)] py-2.5 text-sm font-semibold text-[hsl(152,60%,30%)] hover:bg-[hsl(152,60%,86%)] active:scale-[0.98] transition-all"
          >
            <MapPin className="w-4 h-4" />
            Afhaalbewijs
          </button>
        )}
      </div>
    </div>
  )
}

export type { Carrier }
