import { Truck, MapPin, CircleCheck, Clock, AlertCircle, PackageCheck, Send, PackageOpen } from "lucide-react"
import type { ShipmentStatus } from "@/types/shipment"

const statusConfig: Record<
  ShipmentStatus,
  { label: string; bg: string; text: string; icon: typeof Truck }
> = {
  "in-transit": {
    label: "In Transit",
    bg: "bg-[hsl(210,100%,95%)]",
    text: "text-[hsl(210,100%,40%)]",
    icon: Truck,
  },
  "ready-for-pickup": {
    label: "Ready for Pickup",
    bg: "bg-[hsl(152,60%,92%)]",
    text: "text-[hsl(152,60%,30%)]",
    icon: MapPin,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-[hsl(152,60%,92%)]",
    text: "text-[hsl(152,60%,30%)]",
    icon: CircleCheck,
  },
  processing: {
    label: "Processing",
    bg: "bg-[hsl(38,92%,92%)]",
    text: "text-[hsl(38,70%,35%)]",
    icon: Clock,
  },
  exception: {
    label: "Exception",
    bg: "bg-[hsl(0,84%,94%)]",
    text: "text-[hsl(0,84%,40%)]",
    icon: AlertCircle,
  },
  "awaiting-dropoff": {
    label: "Naar afgifte",
    bg: "bg-[hsl(160,84%,93%)]",
    text: "text-[hsl(160,60%,28%)]",
    icon: PackageCheck,
  },
  shipped: {
    label: "Verzonden",
    bg: "bg-[hsl(160,60%,90%)]",
    text: "text-[hsl(160,60%,28%)]",
    icon: Send,
  },
  "picked-up": {
    label: "Opgehaald",
    bg: "bg-[hsl(152,60%,92%)]",
    text: "text-[hsl(152,60%,30%)]",
    icon: PackageOpen,
  },
}

interface StatusBadgeProps {
  status: ShipmentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

export { type ShipmentStatus } from "@/types/shipment"
