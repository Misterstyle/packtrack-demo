/**
 * Shipment Data Service -- "The Bridge"
 *
 * This layer separates data-fetching logic from UI rendering.
 * To connect a real carrier API later, only change the functions here.
 * The UI components import from ShipmentContext which calls these functions.
 */

import { createClient } from "@/lib/supabase/client"
import type { ShipmentData, ShipmentDirection, ShipmentStatus, Carrier } from "@/types/shipment"

// ── Supabase row <-> App type mapping ───────────────────────────────

interface ShipmentRow {
  id: string
  user_id: string
  item_name: string
  image: string
  status: string
  direction: string
  carrier: string
  tracking_code: string
  last_update: string
  pickup_location: Record<string, unknown> | null
  receipt_image: string | null
  packaging_photo: string | null
  packing_note: string | null
  shipping_deadline: string | null
  is_archived: boolean
  created_at: string
}

export function rowToShipment(row: ShipmentRow): ShipmentData {
  return {
    id: row.id,
    itemName: row.item_name,
    image: row.image,
    status: row.status as ShipmentStatus,
    direction: (row.direction || "incoming") as ShipmentDirection,
    carrier: row.carrier as Carrier,
    trackingCode: row.tracking_code,
    lastUpdate: row.last_update,
    pickupLocation: row.pickup_location
      ? (row.pickup_location as unknown as ShipmentData["pickupLocation"])
      : undefined,
    receiptImage: row.receipt_image ?? undefined,
    packagingPhoto: row.packaging_photo ?? undefined,
    packingNote: row.packing_note ?? undefined,
    shippingDeadline: row.shipping_deadline ?? undefined,
    archived: row.is_archived,
  }
}

// ── CRUD operations ─────────────────────────────────────────────────

export async function fetchShipments(userId: string): Promise<ShipmentData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as ShipmentRow[]).map(rowToShipment)
}

/**
 * Check if a tracking code already exists for this user
 */
export async function trackingCodeExists(
  userId: string,
  trackingCode: string,
): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("shipments")
    .select("id")
    .eq("user_id", userId)
    .eq("tracking_code", trackingCode)
    .limit(1)

  if (error) throw error
  return (data?.length ?? 0) > 0
}

export async function insertShipment(
  userId: string,
  shipment: Omit<ShipmentData, "id">,
): Promise<ShipmentData> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("shipments")
    .insert({
      user_id: userId,
      item_name: shipment.itemName,
      image: shipment.image || "/images/product-1.jpg",
      status: shipment.status,
      direction: shipment.direction || "incoming",
      carrier: shipment.carrier,
      tracking_code: shipment.trackingCode,
      last_update: shipment.lastUpdate || "Zojuist",
      pickup_location: shipment.pickupLocation
        ? JSON.parse(JSON.stringify(shipment.pickupLocation))
        : null,
      receipt_image: shipment.receiptImage ?? null,
      packaging_photo: shipment.packagingPhoto ?? null,
      packing_note: shipment.packingNote ?? null,
      shipping_deadline: shipment.shippingDeadline ?? null,
      is_archived: shipment.archived ?? false,
    })
    .select()
    .single()

  if (error) throw error
  return rowToShipment(data as ShipmentRow)
}

export async function updateShipmentRow(
  shipmentId: string,
  updates: Partial<ShipmentData>,
): Promise<void> {
  const supabase = createClient()
  // Map app fields to DB columns
  const dbUpdates: Record<string, unknown> = {}
  if (updates.itemName !== undefined) dbUpdates.item_name = updates.itemName
  if (updates.image !== undefined) dbUpdates.image = updates.image
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.direction !== undefined) dbUpdates.direction = updates.direction
  if (updates.carrier !== undefined) dbUpdates.carrier = updates.carrier
  if (updates.trackingCode !== undefined) dbUpdates.tracking_code = updates.trackingCode
  if (updates.lastUpdate !== undefined) dbUpdates.last_update = updates.lastUpdate
  if (updates.pickupLocation !== undefined)
    dbUpdates.pickup_location = updates.pickupLocation
      ? JSON.parse(JSON.stringify(updates.pickupLocation))
      : null
  if (updates.receiptImage !== undefined) dbUpdates.receipt_image = updates.receiptImage ?? null
  if (updates.packagingPhoto !== undefined) dbUpdates.packaging_photo = updates.packagingPhoto ?? null
  if (updates.packing_note !== undefined) dbUpdates.packing_note = updates.packingNote ?? null
  if (updates.shippingDeadline !== undefined) dbUpdates.shipping_deadline = updates.shippingDeadline ?? null
  if (updates.archived !== undefined) dbUpdates.is_archived = updates.archived

  const { error } = await supabase.from("shipments").update(dbUpdates).eq("id", shipmentId)
  if (error) throw error
}

export async function deleteShipmentRow(shipmentId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("shipments").delete().eq("id", shipmentId)
  if (error) throw error
}

export async function archiveCompletedRows(userId: string): Promise<number> {
  const supabase = createClient()
  const completedStatuses = ["delivered", "picked-up", "shipped"]

  const { data, error } = await supabase
    .from("shipments")
    .update({ is_archived: true })
    .eq("user_id", userId)
    .eq("is_archived", false)
    .in("status", completedStatuses)
    .select("id")

  if (error) throw error
  return data?.length ?? 0
}