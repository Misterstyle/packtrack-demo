import type { ShipmentStatus } from "@/types/shipment"

/**
 * Simulated tracking API.
 * In production, this would call carrier APIs (DHL, PostNL, Mondial Relay, DPD).
 * For now it returns a randomized status update after a short delay.
 */

interface TrackingResult {
  status: ShipmentStatus
  lastUpdate: string
}

const possibleStatuses: ShipmentStatus[] = [
  "processing",
  "in-transit",
  "in-transit",
  "in-transit",
  "ready-for-pickup",
  "delivered",
]

export async function fetchTrackingUpdate(trackingCode: string): Promise<TrackingResult> {
  // Simulate network delay (500-1500ms)
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

  // Deterministic-ish pick based on tracking code + current minute
  // so it feels like it's "updating" but is stable within the same minute
  const seed =
    trackingCode.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) +
    Math.floor(Date.now() / 60000)
  const status = possibleStatuses[seed % possibleStatuses.length]

  const now = new Date()
  const lastUpdate = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

  return { status, lastUpdate: `Updated ${lastUpdate}` }
}
