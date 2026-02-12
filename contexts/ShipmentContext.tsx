"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { ShipmentData } from "@/types/shipment"
import {
  fetchShipments,
  insertShipment,
  updateShipmentRow,
  deleteShipmentRow,
  archiveCompletedRows,
} from "@/lib/shipment-service"

// ── Completed-status helpers (re-exported for convenience) ─────

const COMPLETED_STATUSES: ShipmentData["status"][] = [
  "delivered",
  "picked-up",
  "shipped",
]

export function isCompletedStatus(status: ShipmentData["status"]) {
  return COMPLETED_STATUSES.includes(status)
}

export { COMPLETED_STATUSES }

// ── Context shape ──────────────────────────────────────────────

interface ShipmentContextValue {
  shipments: ShipmentData[]
  addShipment: (shipment: ShipmentData) => Promise<ShipmentData | null>
  removeShipment: (id: string) => void
  updateShipment: (id: string, updates: Partial<ShipmentData>) => void
  archiveCompleted: () => Promise<number>
  isLoaded: boolean
  refreshShipments: () => Promise<void>
}

const ShipmentContext = createContext<ShipmentContextValue | null>(null)

export function useShipments() {
  const ctx = useContext(ShipmentContext)
  if (!ctx) throw new Error("useShipments must be used within ShipmentProvider")
  return ctx
}

// ── Provider ───────────────────────────────────────────────────

interface Props {
  children: ReactNode
  userId: string
}

export function ShipmentProvider({ children, userId }: Props) {
  const [shipments, setShipments] = useState<ShipmentData[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Fetch shipments from Supabase on mount
  const loadShipments = useCallback(async () => {
    try {
      const data = await fetchShipments(userId)
      setShipments(data)
    } catch (err) {
      console.error("[PackTrack] Failed to load shipments:", err)
    } finally {
      setIsLoaded(true)
    }
  }, [userId])

  useEffect(() => {
    loadShipments()
  }, [loadShipments])

  // Add a shipment -- INSERT into Supabase, then add to local state
  const addShipment = useCallback(
    async (shipment: ShipmentData): Promise<ShipmentData | null> => {
      try {
        const created = await insertShipment(userId, shipment)
        setShipments((prev) => [created, ...prev])
        return created
      } catch (err) {
        console.error("[PackTrack] Failed to add shipment:", err)
        return null
      }
    },
    [userId],
  )

  // Remove a shipment -- DELETE from Supabase, then remove from local state
  const removeShipment = useCallback(async (id: string) => {
    try {
      await deleteShipmentRow(id)
      setShipments((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error("[PackTrack] Failed to remove shipment:", err)
    }
  }, [])

  // Update a shipment -- UPDATE in Supabase, then patch local state
  const updateShipment = useCallback(async (id: string, updates: Partial<ShipmentData>) => {
    try {
      await updateShipmentRow(id, updates)
      setShipments((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      )
    } catch (err) {
      console.error("[PackTrack] Failed to update shipment:", err)
    }
  }, [])

  // Archive all completed shipments -- bulk UPDATE, then patch local state
  const archiveCompleted = useCallback(async (): Promise<number> => {
    try {
      const count = await archiveCompletedRows(userId)
      if (count > 0) {
        setShipments((prev) =>
          prev.map((s) =>
            !s.archived && isCompletedStatus(s.status)
              ? { ...s, archived: true }
              : s,
          ),
        )
      }
      return count
    } catch (err) {
      console.error("[PackTrack] Failed to archive:", err)
      return 0
    }
  }, [userId])

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        addShipment,
        removeShipment,
        updateShipment,
        archiveCompleted,
        isLoaded,
        refreshShipments: loadShipments,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  )
}
