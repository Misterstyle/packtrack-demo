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
  Plug,
  ArrowDown,
  ArrowUp,
  Trash2,
  Archive,
  ArchiveRestore,
} from "lucide-react"
import { ShipmentCard } from "@/components/shipment-card"
import { isCompletedStatus } from "@/contexts/ShipmentContext"
import type { ShipmentData, ShipmentDirection } from "@/types/shipment"
import { AddParcelModal } from "@/components/add-parcel-modal"
import { ShipmentDetailModal } from "@/components/shipment-detail-modal"
import { RefreshTrackingButton } from "@/components/RefreshTrackingButton"
import { IntegrationsScreen } from "@/components/integrations-screen"
import { useShipments } from "@/contexts/ShipmentContext"


type ActiveTab = "dashboard" | "integrations"

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
  const { shipments, addShipment, updateShipment, archiveCompleted, isLoaded } = useShipments()
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")
  const [showArchived, setShowArchived] = useState(false)
  const [archiveToast, setArchiveToast] = useState<string | null>(null)
  const [directionFilter, setDirectionFilter] = useState<"all" | ShipmentDirection>("all")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<ShipmentData | null>(null)

  async function handleAddParcel(parcel: ShipmentData) {
    await addShipment(parcel)
  }

  // Active (non-archived) vs archived views
  const activeShipments = shipments.filter((s) => !s.archived)
  const archivedShipments = shipments.filter((s) => s.archived)
  const baseShipments = showArchived ? archivedShipments : activeShipments

  const filteredShipments = baseShipments.filter((s) => {
    const matchesDirection = directionFilter === "all" || (s.direction || "incoming") === directionFilter
    const matchesFilter = activeFilter === "all" || s.status === activeFilter
    const matchesSearch =
      searchQuery === "" ||
      s.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trackingCode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDirection && matchesFilter && matchesSearch
  })

  // Count of non-archived parcels with completed status (for "Ruim op" button)
  const completedCount = activeShipments.filter((s) => isCompletedStatus(s.status)).length

  async function handleCleanup() {
    const count = await archiveCompleted()
    if (count > 0) {
      setArchiveToast(`${count} ${count === 1 ? "pakket" : "pakketten"} gearchiveerd`)
      setTimeout(() => setArchiveToast(null), 3000)
    }
  }

  const statsSource = showArchived ? archivedShipments : activeShipments
  const stats = {
    total: statsSource.length,
    incoming: statsSource.filter((s) => (s.direction || "incoming") === "incoming").length,
    outgoing: statsSource.filter((s) => s.direction === "outgoing").length,
    inTransit: statsSource.filter((s) => s.status === "in-transit").length,
    pickup: statsSource.filter((s) => s.status === "ready-for-pickup").length,
    delivered: statsSource.filter((s) => s.status === "delivered").length,
    archived: archivedShipments.length,
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading your parcels...</span>
        </div>
      </div>
    )
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
              <span className="text-lg font-semibold text-card-foreground hidden sm:inline">PackTrack</span>
            </div>

            {/* Desktop tab switcher */}
            <nav className="hidden sm:flex items-center gap-1 rounded-lg bg-muted p-1" aria-label="Main navigation">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Pakketten
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("integrations")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "integrations"
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                <Plug className="w-3.5 h-3.5" />
                Integraties
              </button>
            </nav>

            <div className="flex items-center gap-2">
              <RefreshTrackingButton />
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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 sm:pb-8">
        {/* Integrations Tab */}
        {activeTab === "integrations" && <IntegrationsScreen />}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && <div className="py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">Totaal</span>
            <span className="text-2xl font-bold text-card-foreground">{stats.total}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ArrowDown className="w-3 h-3" /> Inkomend</span>
            <span className="text-2xl font-bold text-primary">{stats.incoming}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-[hsl(160,60%,80%)] bg-card p-4 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ArrowUp className="w-3 h-3" /> Uitgaand</span>
            <span className="text-2xl font-bold text-[hsl(160,60%,35%)]">{stats.outgoing}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">Onderweg</span>
            <span className="text-2xl font-bold text-[hsl(210,100%,40%)]">{stats.inTransit}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">Afgeleverd</span>
            <span className="text-2xl font-bold text-[hsl(152,60%,30%)]">{stats.delivered}</span>
          </div>
        </div>

        {/* Direction Filter Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {(
            [
              { key: "all" as const, label: "Alles", icon: Package },
              { key: "incoming" as const, label: "Inkomend", icon: ArrowDown },
              { key: "outgoing" as const, label: "Uitgaand", icon: ArrowUp },
            ] as const
          ).map((dir) => {
            const Icon = dir.icon
            const isActive = directionFilter === dir.key
            return (
              <button
                key={dir.key}
                type="button"
                onClick={() => setDirectionFilter(dir.key)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? dir.key === "outgoing"
                      ? "bg-[hsl(160,60%,42%)] text-[hsl(0,0%,100%)] shadow-sm"
                      : "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-card-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {dir.label}
              </button>
            )
          })}
        </div>

        {/* Archive Toggle + Ruim op row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Actief / Archief toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                !showArchived
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <Package className="w-3 h-3" />
              Actief
              <span className="ml-0.5 text-[10px] font-bold opacity-70">{activeShipments.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                showArchived
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              <Archive className="w-3 h-3" />
              Archief
              {stats.archived > 0 && (
                <span className="ml-0.5 text-[10px] font-bold opacity-70">{stats.archived}</span>
              )}
            </button>
          </div>

          {/* Ruim op button -- only visible when there are completed (non-archived) parcels */}
          {!showArchived && completedCount > 0 && (
            <button
              type="button"
              onClick={handleCleanup}
              className="flex items-center gap-2 rounded-lg border border-[hsl(152,60%,75%)] bg-[hsl(152,60%,96%)] px-3.5 py-2 text-xs font-semibold text-[hsl(152,60%,28%)] hover:bg-[hsl(152,60%,90%)] hover:border-[hsl(152,60%,60%)] active:scale-[0.98] transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Ruim op
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(152,60%,42%)] text-[hsl(0,0%,100%)] text-[10px] font-bold">{completedCount}</span>
            </button>
          )}
        </div>

        {/* Archive toast notification */}
        {archiveToast && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-[hsl(152,60%,95%)] border border-[hsl(152,60%,80%)] px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <ArchiveRestore className="w-4 h-4 text-[hsl(152,60%,35%)]" />
            <span className="text-sm font-medium text-[hsl(152,60%,25%)]">{archiveToast}</span>
          </div>
        )}

        {/* Archived view header */}
        {showArchived && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted/60 border border-border px-4 py-3">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Gearchiveerde pakketten ({archivedShipments.length})
            </span>
          </div>
        )}

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
                onClick={(s) => setSelectedShipment(s)}
                onUploadReceipt={(id, base64) => updateShipment(id, { receiptImage: base64 })}
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
        </div>}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/90 backdrop-blur-lg" aria-label="Mobile navigation">
        <div className="flex items-center justify-around h-16 px-4">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Pakketten</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("integrations")}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === "integrations" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Plug className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Integraties</span>
          </button>
        </div>
      </nav>

      {/* Add Parcel Modal */}
      <AddParcelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddParcel}
      />

      {/* Shipment Detail Modal */}
      {selectedShipment && (
        <ShipmentDetailModal
          isOpen={true}
          onClose={() => setSelectedShipment(null)}
          shipment={selectedShipment}
          onUpdateShipment={(id, updates) => {
            updateShipment(id, updates)
            setSelectedShipment((prev) => prev ? { ...prev, ...updates } : null)
          }}
        />
      )}
    </div>
  )
}
