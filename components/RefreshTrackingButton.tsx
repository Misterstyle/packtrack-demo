"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { fetchTrackingUpdate } from "@/lib/tracking-api"
import { useShipments } from "@/contexts/ShipmentContext"

export function RefreshTrackingButton() {
  const { shipments, updateShipment } = useShipments()
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function handleRefresh() {
    if (isRefreshing) return
    setIsRefreshing(true)

    try {
      // Refresh all non-delivered shipments in parallel
      const active = shipments.filter(
        (s) => s.status !== "delivered" && s.status !== "exception",
      )

      const updates = await Promise.all(
        active.map(async (s) => {
          const result = await fetchTrackingUpdate(s.trackingCode)
          return { id: s.id, ...result }
        }),
      )

      for (const update of updates) {
        updateShipment(update.id, {
          status: update.status,
          lastUpdate: update.lastUpdate,
        })
      }
    } catch {
      // Fail silently for demo
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-muted-foreground hover:text-secondary-foreground hover:bg-muted transition-colors disabled:opacity-50"
      aria-label="Refresh tracking status"
    >
      <RefreshCw
        className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
      />
      <span className="hidden sm:inline">
        {isRefreshing ? "Updating..." : "Refresh"}
      </span>
    </button>
  )
}
