"use client"

import { useState } from "react"
import {
  Package,
  Search,
  Bell,
  Filter,
  Truck,
  MapPin,
  CircleCheck,
  Clock,
  LogOut,
  Plus,
} from "lucide-react"
import { ShipmentCard } from "@/components/shipment-card"
import type { ShipmentData } from "@/components/shipment-card"
import { AddParcelModal } from "@/components/add-parcel-modal"
import { PickupDetailModal } from "@/components/pickup-detail-modal"

const initialShipments: ShipmentData[] = [
  {
    id: "1",
    itemName: "Vintage Denim Jacket - Levi's 501",
    image: "/images/product-1.jpg",
    status: "in-transit",
    carrier: "mondial-relay",
    trackingCode: "MR-2849301847",
    lastUpdate: "2h ago",
  },
  {
    id: "2",
    itemName: "Nike Air Max 90 - White",
    image: "/images/product-2.jpg",
    status: "ready-for-pickup",
    carrier: "dhl",
    trackingCode: "DHL-9483726150",
    lastUpdate: "30m ago",
    pickupLocation: {
      name: "DHL ServicePoint - Albert Heijn",
      address: "Kalverstraat 92",
      city: "Amsterdam",
      postalCode: "1012 PH",
      openingHours: "Ma-Za 08:00 - 22:00",
      pinCode: "847291",
      lat: 52.3702,
      lng: 4.8952,
    },
  },
  {
    id: "3",
    itemName: "Designer Handbag - Beige Leather",
    image: "/images/product-3.jpg",
    status: "delivered",
    carrier: "postnl",
    trackingCode: "3SPOST029384756",
    lastUpdate: "1d ago",
  },
  {
    id: "4",
    itemName: "Wool Scarf - Earth Tones",
    image: "/images/product-4.jpg",
    status: "processing",
    carrier: "mondial-relay",
    trackingCode: "MR-7392018463",
    lastUpdate: "5h ago",
  },
  {
    id: "5",
    itemName: "Vintage Watch - Seiko Automatic",
    image: "/images/product-5.jpg",
    status: "in-transit",
    carrier: "postnl",
    trackingCode: "3SPOST847291036",
    lastUpdate: "1h ago",
  },
  {
    id: "6",
    itemName: "Ray-Ban Aviator Sunglasses",
    image: "/images/product-6.jpg",
    status: "in-transit",
    carrier: "dhl",
    trackingCode: "DHL-1029384756",
    lastUpdate: "4h ago",
  },
]

type FilterType = "all" | "in-transit" | "ready-for-pickup" | "delivered" | "processing"

const filters: { key: FilterType; label: string; icon: typeof Truck }[] = [
  { key: "all", label: "All Parcels", icon: Package },
  { key: "in-transit", label: "In Transit", icon: Truck },
  { key: "ready-for-pickup", label: "Pickup", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CircleCheck },
  { key: "processing", label: "Processing", icon: Clock },
]

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [allShipments, setAllShipments] = useState<ShipmentData[]>(initialShipments)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pickupDetailShipment, setPickupDetailShipment] = useState<ShipmentData | null>(null)

  function handleAddParcel(parcel: ShipmentData) {
    setAllShipments((prev) => [parcel, ...prev])
  }

  const filteredShipments = allShipments.filter((s) => {
    const matchesFilter = activeFilter === "all" || s.status === activeFilter
    const matchesSearch =
      searchQuery === "" ||
      s.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trackingCode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: allShipments.length,
    inTransit: allShipments.filter((s) => s.status === "in-transit").length,
    pickup: allShipments.filter((s) => s.status === "ready-for-pickup").length,
    delivered: allShipments.filter((s) => s.status === "delivered").length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <Package className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-card-foreground">PackTrack</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Parcel</span>
              </button>
              <button
                type="button"
                className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-medium text-muted-foreground">Total Parcels</span>
            <span className="text-2xl font-bold text-card-foreground">{stats.total}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-medium text-muted-foreground">In Transit</span>
            <span className="text-2xl font-bold text-[hsl(210,100%,40%)]">{stats.inTransit}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-medium text-muted-foreground">Ready for Pickup</span>
            <span className="text-2xl font-bold text-[hsl(38,70%,35%)]">{stats.pickup}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-medium text-muted-foreground">Delivered</span>
            <span className="text-2xl font-bold text-[hsl(152,60%,30%)]">{stats.delivered}</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items or tracking codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0 mr-1" />
            {filters.map((filter) => {
              const Icon = filter.icon
              const isActive = activeFilter === filter.key
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Shipment Cards Grid */}
        {filteredShipments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShipments.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                shipment={shipment}
                onPickupDetail={(s) => setPickupDetailShipment(s)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-1">No parcels found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </main>

      {/* Add Parcel Modal */}
      <AddParcelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddParcel}
      />

      {/* Pickup Detail Modal */}
      {pickupDetailShipment?.pickupLocation && (
        <PickupDetailModal
          isOpen={true}
          onClose={() => setPickupDetailShipment(null)}
          itemName={pickupDetailShipment.itemName}
          trackingCode={pickupDetailShipment.trackingCode}
          pickupLocation={pickupDetailShipment.pickupLocation}
        />
      )}
    </div>
  )
}
