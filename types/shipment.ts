export type Carrier = "mondial-relay" | "dhl" | "postnl" | "dpd" | "vinted-go"

export type ShipmentDirection = "incoming" | "outgoing"

export type ShipmentStatus =
  | "in-transit"
  | "ready-for-pickup"
  | "delivered"
  | "processing"
  | "exception"
  | "awaiting-dropoff"
  | "shipped"
  | "picked-up"

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

export interface ShipmentData {
  id: string
  itemName: string
  image: string
  status: ShipmentStatus
  direction: ShipmentDirection
  carrier: Carrier
  trackingCode: string
  lastUpdate: string
  pickupLocation?: PickupLocation
  receiptImage?: string
  packagingPhoto?: string
  packingNote?: string
  shippingDeadline?: string
  archived?: boolean
}
