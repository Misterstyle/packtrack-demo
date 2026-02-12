"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Zap,
  Check,
  Loader2,
  ScanLine,
  Sparkles,
  ChevronRight,
  Mail,
  Smartphone,
  RefreshCw,
  Clock,
} from "lucide-react"
import { useShipments } from "@/contexts/ShipmentContext"
import { trackingCodeExists } from "@/lib/shipment-service"
import { useToast } from "@/components/toast"
import type { ShipmentData } from "@/types/shipment"

// ── Integration definition ──────────────────────────────────────────
interface Integration {
  id: string
  name: string
  category: "carrier" | "marketplace"
  active: boolean
  color: string
  textColor?: string
  abbr: string
  connectedSince?: string
}

const initialIntegrations: Integration[] = [
  { id: "postnl", name: "PostNL", category: "carrier", active: true, color: "#FF6600", abbr: "Post\nNL" },
  { id: "dhl", name: "DHL", category: "carrier", active: true, color: "#FFCC00", textColor: "#D40511", abbr: "DHL" },
  { id: "ups", name: "UPS", category: "carrier", active: false, color: "#351C15", abbr: "UPS" },
  { id: "dpd", name: "DPD", category: "carrier", active: false, color: "#DC0032", abbr: "DPD" },
  { id: "vinted", name: "Vinted", category: "marketplace", active: true, color: "#09B1BA", abbr: "V", connectedSince: "jan 2026" },
  { id: "bolcom", name: "Bol.com", category: "marketplace", active: false, color: "#0000A4", abbr: "bol." },
  { id: "amazon", name: "Amazon", category: "marketplace", active: false, color: "#FF9900", textColor: "#232F3E", abbr: "a" },
]

// ── Scan phases ─────────────────────────────────────────────────────
const scanPhases = [
  { label: "Verbinden met e-mail...", progress: 15, icon: Mail },
  { label: "PostNL berichten scannen...", progress: 30, icon: ScanLine },
  { label: "DHL tracking ophalen...", progress: 45, icon: ScanLine },
  { label: "Vinted bestellingen laden...", progress: 62, icon: Smartphone },
  { label: "Bol.com orders synchroniseren...", progress: 78, icon: Smartphone },
  { label: "Pakketten importeren...", progress: 92, icon: Sparkles },
  { label: "Synchronisatie voltooid!", progress: 100, icon: Check },
]

// ═══════════════════════════════════════════════════════════════════
// DATA LAYER — Replace these mock functions with real API calls later
// ═══════════════════════════════════════════════════════════════════

/**
 * Fetches shipments from Vinted (mock).
 * To connect to a real API, replace the body of this function
 * with a fetch() call and map the response to ShipmentData[].
 */
async function fetchVintedShipments(): Promise<ShipmentData[]> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 300))

  return [
    {
      id: `vinted-sync-${Date.now()}`,
      itemName: "Zara broek meisje 104",
      image: "/images/product-4.jpg",
      status: "awaiting-dropoff",
      direction: "outgoing",
      carrier: "vinted-go",
      trackingCode: "17709876543210987",
      lastUpdate: "Zojuist gesynchroniseerd",
      packingNote: "Vinted verkoop",
      shippingDeadline: "2026-02-10",
    },
  ]
}

/**
 * Fetches shipments from Bol.com (mock).
 */
async function fetchBolcomShipments(): Promise<ShipmentData[]> {
  await new Promise((r) => setTimeout(r, 200))

  return [
    {
      id: `bolcom-sync-${Date.now()}`,
      itemName: "Samsung USB-C Kabel 2m - Bol.com",
      image: "/images/product-5.jpg",
      status: "processing",
      direction: "incoming",
      carrier: "dhl",
      trackingCode: "DHL-5829174630",
      lastUpdate: "Zojuist gesynchroniseerd",
    },
  ]
}

/**
 * Orchestrates all data fetching from active integrations.
 * This is the single function to extend when adding new sources.
 */
async function fetchAllIntegrationShipments(
  activeIntegrationIds: string[],
): Promise<{ parcels: ShipmentData[]; sources: string[] }> {
  const parcels: ShipmentData[] = []
  const sources: string[] = []

  if (activeIntegrationIds.includes("vinted")) {
    const vinted = await fetchVintedShipments()
    parcels.push(...vinted)
    sources.push("Vinted")
  }

  if (activeIntegrationIds.includes("bolcom")) {
    const bolcom = await fetchBolcomShipments()
    parcels.push(...bolcom)
    sources.push("Bol.com")
  }

  return { parcels, sources }
}

// ═══════════════════════════════════════════════════════════════════
// UI LAYER
// ═══════════════════════════════════════════════════════════════════

export function IntegrationsScreen() {
  const { addShipment, shipments, updateShipment, refreshShipments } = useShipments()
  const { showToast, ToastContainer } = useToast()
  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [smartSync, setSmartSync] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanPhaseIdx, setScanPhaseIdx] = useState(0)
  const [scanDone, setScanDone] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [importedSources, setImportedSources] = useState<string[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  // Get userId from shipments context (we'll need to pass it)
  // For now, we'll extract it from the first shipment if available
  const userId = shipments[0]?.id ? shipments[0].id.split("-")[0] : ""

  // Toggle individual integration
  function toggleIntegration(id: string) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, active: !i.active } : i)),
    )
  }

  // Smart Sync scanning animation
  const runScan = useCallback(() => {
    setScanning(true)
    setScanPhaseIdx(0)
    setScanDone(false)
    setImportedCount(0)
    setImportedSources([])
  }, [])

  useEffect(() => {
    if (!scanning) return
    if (scanPhaseIdx >= scanPhases.length - 1) {
      // Animation done -- now fetch the real data
      const timer = setTimeout(async () => {
        const activeIds = integrations.filter((i) => i.active).map((i) => i.id)
        // Activate Bol.com for the demo sync
        if (!activeIds.includes("bolcom")) activeIds.push("bolcom")

        const { parcels, sources } = await fetchAllIntegrationShipments(activeIds)

        let addedCount = 0
        let skippedCount = 0

        // Inject into app state with duplicate protection
        for (const p of parcels) {
          // Check if tracking code already exists
          const exists = await trackingCodeExists(userId, p.trackingCode)
          
          if (!exists) {
            const result = await addShipment({ ...p, id: `${p.id}-${Date.now()}` })
            if (result) {
              addedCount++
            }
          } else {
            skippedCount++
          }
        }

        // Simulate status update: Nike shoes were picked up at service point
        const nike = shipments.find(
          (s) => s.itemName.includes("Nike") && s.status === "ready-for-pickup"
        )
        if (nike) {
          updateShipment(nike.id, {
            status: "picked-up",
            lastUpdate: "Zojuist",
          })
        }

        const statusUpdates = nike ? 1 : 0
        const totalImported = addedCount + statusUpdates
        
        setImportedCount(totalImported)
        setImportedSources(sources)
        setScanning(false)
        setScanDone(true)
        setLastSyncTime(
          new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
        )

        // Refresh the shipments list from database
        await refreshShipments()

        // Show success toast
        if (totalImported > 0) {
          showToast(
            `${totalImported} ${totalImported === 1 ? "pakket" : "pakketten"} succesvol geïmporteerd`,
            "success"
          )
        } else if (skippedCount > 0) {
          showToast(
            "Alle pakketten waren al in je overzicht",
            "info"
          )
        }

        // Activate Vinted and Bol.com tiles
        setIntegrations((prev) =>
          prev.map((i) =>
            i.id === "vinted" || i.id === "bolcom"
              ? { ...i, active: true, connectedSince: i.connectedSince || "zojuist" }
              : i,
          ),
        )
      }, 600)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => {
      setScanPhaseIdx((prev) => prev + 1)
    }, 900)
    return () => clearTimeout(timer)
  }, [scanning, scanPhaseIdx, addShipment, updateShipment, shipments, integrations, userId, refreshShipments, showToast])

  function handleToggleSync() {
    if (smartSync) {
      setSmartSync(false)
      setScanDone(false)
      return
    }
    setSmartSync(true)
    runScan()
  }

  const currentPhase = scanPhases[scanPhaseIdx]
  const activeCount = integrations.filter((i) => i.active).length
  const vintedIntegration = integrations.find((i) => i.id === "vinted")

  return (
    <div className="py-8">
      <ToastContainer />
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-card-foreground tracking-tight text-balance">
          Integraties
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Koppel je accounts en automatiseer je tracking
        </p>
      </div>

      {/* ── Vinted Connected Banner ──────────────────────────── */}
      {vintedIntegration?.active && (
        <div className="mb-6 rounded-xl border border-[hsl(184,88%,78%)] bg-[hsl(184,88%,96%)] p-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#09B1BA] shrink-0">
              <span className="text-sm font-extrabold text-[hsl(0,0%,100%)]">V</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[hsl(184,88%,20%)]">Vinted Account Verbonden</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(152,60%,42%)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(0,0%,100%)]">
                  <Check className="w-2.5 h-2.5" /> Actief
                </span>
              </div>
              <p className="text-xs text-[hsl(184,88%,35%)] mt-0.5">
                {vintedIntegration.connectedSince
                  ? `Gekoppeld sinds ${vintedIntegration.connectedSince}`
                  : "Klaar om te synchroniseren"}
                {lastSyncTime && ` · Laatste sync: ${lastSyncTime}`}
              </p>
            </div>
            {lastSyncTime && (
              <button
                type="button"
                onClick={runScan}
                disabled={scanning}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-[hsl(184,88%,30%)] hover:bg-[hsl(184,88%,90%)] transition-colors disabled:opacity-50"
                aria-label="Opnieuw synchroniseren"
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Smart Sync Card ────────────────────────────────────── */}
      <div className="relative mb-10 rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-lg">
        {/* Glassmorphism backdrop glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 border border-primary/20">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-card-foreground">
                  Slimme synchronisatie
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Auto-import vanuit mail & apps
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              onClick={handleToggleSync}
              disabled={scanning}
              className={`relative inline-flex h-7 w-[52px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                smartSync ? "bg-primary" : "bg-muted"
              }`}
              role="switch"
              aria-checked={smartSync}
              aria-label="Slimme synchronisatie aan/uit"
            >
              <span
                className={`pointer-events-none block rounded-full bg-card shadow-lg ring-0 transition-transform duration-300 mt-[1px] ${
                  smartSync ? "translate-x-[26px]" : "translate-x-[2px]"
                }`}
                style={{ width: 22, height: 22 }}
              />
            </button>
          </div>

          {/* Scanning animation */}
          {scanning && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              {/* Progress bar */}
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${currentPhase.progress}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-pulse"
                  style={{ width: `${currentPhase.progress}%` }}
                />
              </div>

              {/* Phase label */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  {currentPhase.progress < 100 ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium text-card-foreground">
                  {currentPhase.label}
                </span>
              </div>

              {/* Scanning account lines */}
              <div className="flex flex-col gap-1.5 mt-1">
                {scanPhases.slice(0, scanPhaseIdx + 1).map((phase, idx) => {
                  const PhaseIcon = phase.icon
                  const isDone = idx < scanPhaseIdx
                  return (
                    <div
                      key={phase.label}
                      className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
                        isDone ? "text-muted-foreground" : "text-card-foreground font-medium"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 text-[hsl(152,60%,42%)]" />
                      ) : (
                        <PhaseIcon className="w-3 h-3" />
                      )}
                      {phase.label}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Success state */}
          {scanDone && !scanning && (
            <div className="flex items-center gap-3 rounded-xl bg-[hsl(152,60%,95%)] border border-[hsl(152,60%,80%)] p-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[hsl(152,60%,42%)] shrink-0">
                <Check className="w-4.5 h-4.5 text-[hsl(0,0%,100%)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(152,60%,25%)]">
                  {importedCount} {importedCount === 1 ? "pakket" : "pakketten"} geïmporteerd
                </p>
                <p className="text-xs text-[hsl(152,60%,35%)] mt-0.5">
                  {importedSources.length > 0
                    ? `${importedSources.join(" & ")} gesynchroniseerd`
                    : "Synchronisatie voltooid"}
                </p>
              </div>
            </div>
          )}

          {/* Idle state */}
          {!scanning && !scanDone && !smartSync && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg bg-muted/60 px-3 py-2.5">
              <ScanLine className="w-3.5 h-3.5" />
              Schakel de synchronisatie in om automatisch pakketten te importeren
            </div>
          )}
        </div>
      </div>

      {/* ── Integration Grid ──────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-card-foreground">
            Koppel je accounts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeCount} van {integrations.length} actief
          </p>
        </div>
      </div>

      {/* Carriers */}
      <div className="mb-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Vervoerders
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {integrations
            .filter((i) => i.category === "carrier")
            .map((integration) => (
              <IntegrationTile
                key={integration.id}
                integration={integration}
                onToggle={toggleIntegration}
              />
            ))}
        </div>
      </div>

      {/* Marketplaces */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Marktplaatsen
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {integrations
            .filter((i) => i.category === "marketplace")
            .map((integration) => (
              <IntegrationTile
                key={integration.id}
                integration={integration}
                onToggle={toggleIntegration}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

// ── Integration Tile ────────────────────────────────────────────────
function IntegrationTile({
  integration,
  onToggle,
}: {
  integration: Integration
  onToggle: (id: string) => void
}) {
  const { id, name, active, color, textColor, abbr, connectedSince } = integration

  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`group relative flex flex-col items-center gap-3 rounded-xl border p-5 transition-all duration-300 ${
        active
          ? "border-primary/30 bg-card shadow-md hover:shadow-lg"
          : "border-border bg-card/60 hover:bg-card hover:border-border"
      }`}
    >
      {/* Active indicator */}
      {active && (
        <div className="absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      {/* Logo */}
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 ${
          active ? "shadow-sm" : "grayscale opacity-40 group-hover:opacity-60 group-hover:grayscale-[50%]"
        }`}
        style={active ? { backgroundColor: color } : { backgroundColor: "#e2e8f0" }}
      >
        <span
          className="text-sm font-extrabold leading-tight text-center whitespace-pre-line"
          style={{ color: active ? (textColor || "#fff") : "#94a3b8" }}
        >
          {abbr}
        </span>
      </div>

      {/* Label */}
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`text-sm font-semibold transition-colors ${
            active ? "text-card-foreground" : "text-muted-foreground"
          }`}
        >
          {name}
        </span>
        {active && connectedSince ? (
          <span className="flex items-center gap-1 text-[10px] font-medium text-primary">
            <Clock className="w-2.5 h-2.5" />
            Sinds {connectedSince}
          </span>
        ) : (
          <span
            className={`text-[10px] font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground/60"
            }`}
          >
            {active ? "Gekoppeld" : "Niet verbonden"}
          </span>
        )}
      </div>

      {/* Connect arrow hint (inactive) */}
      {!active && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
    </button>
  )
}
