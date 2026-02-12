"use client"

import React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  X,
  Upload,
  ImageIcon,
  CheckCircle,
  ChevronDown,
  QrCode,
  ArrowDown,
  ArrowUp,
  Camera,
  Tag,
  CalendarClock,
  Smartphone,
} from "lucide-react"
import type { Carrier, ShipmentData, ShipmentDirection } from "@/types/shipment"
import {
  MondialRelayLogo,
  DHLLogo,
  PostNLLogo,
  DPDLogo,
  VintedGoLogo,
} from "@/components/carrier-logos"

const carriers: {
  value: Carrier
  label: string
  Logo: React.ComponentType<{ className?: string }>
}[] = [
  { value: "mondial-relay", label: "Mondial Relay", Logo: MondialRelayLogo },
  { value: "dhl", label: "DHL", Logo: DHLLogo },
  { value: "postnl", label: "PostNL", Logo: PostNLLogo },
  { value: "dpd", label: "DPD", Logo: DPDLogo },
  { value: "vinted-go", label: "Vinted Go", Logo: VintedGoLogo },
]

interface AddParcelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (parcel: ShipmentData) => void | Promise<void>
}

export function AddParcelModal({ isOpen, onClose, onSave }: AddParcelModalProps) {
  const [direction, setDirection] = useState<ShipmentDirection>("incoming")
  const [itemName, setItemName] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState<Carrier | "">("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [receiptFileName, setReceiptFileName] = useState("")
  const [packagingPhoto, setPackagingPhoto] = useState<string | null>(null)
  const [packagingFileName, setPackagingFileName] = useState("")
  const [packingNote, setPackingNote] = useState("")
  const [shippingDeadline, setShippingDeadline] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [vintedGoAutoDetected, setVintedGoAutoDetected] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const receiptInputRef = useRef<HTMLInputElement>(null)
  const packagingInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const isOutgoing = direction === "outgoing"

  const resetForm = useCallback(() => {
    setDirection("incoming")
    setItemName("")
    setTrackingNumber("")
    setCarrier("")
    setImagePreview(null)
    setFileName("")
    setReceiptPreview(null)
    setReceiptFileName("")
    setPackagingPhoto(null)
    setPackagingFileName("")
    setPackingNote("")
    setShippingDeadline("")
    setShowSuccess(false)
    setVintedGoAutoDetected(false)
    setIsDropdownOpen(false)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  })

  if (!isOpen) return null

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handlePackagingChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPackagingFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPackagingPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSave() {
    if (!itemName.trim() || !trackingNumber.trim() || !carrier) return

    const newParcel: ShipmentData = {
      id: Date.now().toString(),
      itemName: itemName.trim(),
      image: imagePreview || "/images/product-1.jpg",
      status: isOutgoing ? "awaiting-dropoff" : "processing",
      direction,
      carrier: carrier,
      trackingCode: trackingNumber.trim().toUpperCase(),
      lastUpdate: "Zojuist",
      ...(receiptPreview ? { receiptImage: receiptPreview } : {}),
      ...(packagingPhoto ? { packagingPhoto } : {}),
      ...(packingNote.trim() ? { packingNote: packingNote.trim() } : {}),
      ...(shippingDeadline ? { shippingDeadline } : {}),
    }

    setShowSuccess(true)
    setTimeout(() => {
      onSave(newParcel)
      handleClose()
    }, 1500)
  }

  const isValid =
    itemName.trim() !== "" && trackingNumber.trim() !== "" && carrier !== ""
  const selectedCarrier = carriers.find((c) => c.value === carrier)

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add new parcel"
        className="relative z-10 w-full max-w-md mx-0 sm:mx-4 rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 fade-in duration-200 max-h-[92vh] overflow-y-auto"
      >
        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-card">
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isOutgoing ? "bg-[hsl(160,60%,92%)]" : "bg-[hsl(152,60%,92%)]"
              }`}
            >
              <CheckCircle
                className={`w-8 h-8 ${
                  isOutgoing
                    ? "text-[hsl(160,60%,28%)]"
                    : "text-[hsl(152,60%,30%)]"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1">
              {isOutgoing ? "Verzending aangemaakt!" : "Pakket toegevoegd!"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isOutgoing
                ? "Je uitgaande pakket wordt nu gevolgd."
                : "Je pakket wordt nu gevolgd."}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Nieuw pakket
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Voer de verzendgegevens in
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 p-6">
          {/* Direction Switcher */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">
              Type
            </label>
            <div className="flex rounded-lg bg-muted p-1 gap-1">
              <button
                type="button"
                onClick={() => setDirection("incoming")}
                className={`flex items-center justify-center gap-2 flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  !isOutgoing
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Inkomend
              </button>
              <button
                type="button"
                onClick={() => setDirection("outgoing")}
                className={`flex items-center justify-center gap-2 flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  isOutgoing
                    ? "bg-[hsl(160,60%,42%)] text-[hsl(0,0%,100%)] shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Uitgaand
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="item-name"
              className="text-sm font-medium text-card-foreground"
            >
              {isOutgoing ? "Wat verstuur je?" : "Omschrijving"}
            </label>
            <input
              id="item-name"
              type="text"
              placeholder={
                isOutgoing
                  ? "bijv. Zara jurk, maat M"
                  : "bijv. Vintage Denim Jacket"
              }
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
          </div>

          {/* Tracking Number */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="tracking-number"
              className="text-sm font-medium text-card-foreground"
            >
              Trackingcode
            </label>
            <input
              id="tracking-number"
              type="text"
              placeholder="bijv. 3SPOST029384756"
              value={trackingNumber}
              onChange={(e) => {
                const val = e.target.value
                setTrackingNumber(val)
                // Auto-detect Vinted Go: starts with 1770 and contains only digits (4+ chars)
                const cleaned = val.replace(/[\s-]/g, "")
                const looksLikeVinted = /^\d{4,}$/.test(cleaned) && cleaned.startsWith("1770")
                if (looksLikeVinted) {
                  if (carrier !== "vinted-go") {
                    setCarrier("vinted-go")
                    setVintedGoAutoDetected(true)
                  }
                } else if (vintedGoAutoDetected && carrier === "vinted-go") {
                  setCarrier("")
                  setVintedGoAutoDetected(false)
                }
              }}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-card-foreground font-mono placeholder:font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
            {vintedGoAutoDetected && (
              <div className="flex items-center gap-1.5 rounded-lg bg-[hsl(184,88%,94%)] border border-[hsl(184,88%,82%)] px-3 py-2">
                <Smartphone className="w-3.5 h-3.5 text-[hsl(184,88%,30%)]" />
                <span className="text-xs font-medium text-[hsl(184,88%,25%)]">Vinted Go automatisch herkend</span>
              </div>
            )}
          </div>

          {/* Carrier Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">
              Vervoerder
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center justify-between w-full rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  isDropdownOpen
                    ? "border-ring ring-2 ring-ring"
                    : "border-input hover:border-muted-foreground/50"
                } ${
                  selectedCarrier
                    ? "text-card-foreground bg-background"
                    : "text-muted-foreground bg-background"
                }`}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                {selectedCarrier ? (
                  <span className="flex items-center gap-2.5">
                    <selectedCarrier.Logo className="w-6 h-6" />
                    {selectedCarrier.label}
                  </span>
                ) : (
                  <span>Selecteer vervoerder</span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <ul
                  role="listbox"
                  className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-10 animate-in slide-in-from-top-1 fade-in duration-150"
                >
                  {carriers.map((c) => (
                    <li key={c.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={carrier === c.value}
                        onClick={() => {
                          setCarrier(c.value)
                          setIsDropdownOpen(false)
                        }}
                        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors ${
                          carrier === c.value
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        <c.Logo className="w-6 h-6" />
                        {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Vinted Go digital label info badge */}
            {carrier === "vinted-go" && (
              <div className="flex items-center gap-2 mt-2 rounded-lg bg-[hsl(184,88%,94%)] border border-[hsl(184,88%,82%)] px-3 py-2.5">
                <Smartphone className="w-4 h-4 text-[hsl(184,88%,30%)] shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[hsl(184,88%,20%)]">Digitaal label (geen printer nodig)</p>
                  <p className="text-[11px] text-[hsl(184,88%,30%)] mt-0.5">Laat de QR-code scannen bij een Vinted Go-punt.</p>
                </div>
              </div>
            )}
          </div>

          {/* Packing Note (outgoing only) */}
          {isOutgoing && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="packing-note"
                className="text-sm font-medium text-card-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[hsl(160,60%,42%)]" />
                  Inpaknota
                </span>
              </label>
              <input
                id="packing-note"
                type="text"
                placeholder="bijv. Blauwe doos, Zara jurk"
                value={packingNote}
                onChange={(e) => setPackingNote(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,42%)] focus:border-transparent transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Noteer hoe je het pakket hebt ingepakt, zodat je het later kunt herkennen.
              </p>
            </div>
          )}

          {/* Shipping Deadline (outgoing only) */}
          {isOutgoing && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="shipping-deadline"
                className="text-sm font-medium text-card-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-[hsl(160,60%,42%)]" />
                  Uiterste verzenddatum
                </span>
              </label>
              <input
                id="shipping-deadline"
                type="date"
                value={shippingDeadline}
                onChange={(e) => setShippingDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(160,60%,42%)] focus:border-transparent transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                De uiterste datum waarop dit pakket verzonden moet zijn.
              </p>
            </div>
          )}

          {/* Product Photo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">
              Productfoto{" "}
              <span className="text-muted-foreground font-normal">
                (optioneel)
              </span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Upload product photo"
            />
            {imagePreview ? (
              <div className="relative flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground font-medium truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Foto geupload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null)
                    setFileName("")
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors shrink-0"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-input bg-background px-4 py-6 text-muted-foreground hover:border-primary/40 hover:text-card-foreground hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  Upload een foto
                </div>
                <span className="text-xs">JPG, PNG of WebP</span>
              </button>
            )}
          </div>

          {/* Packaging Photo (outgoing only) */}
          {isOutgoing && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-card-foreground">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[hsl(160,60%,42%)]" />
                  Foto van verpakking
                  <span className="text-muted-foreground font-normal">
                    (optioneel)
                  </span>
                </span>
              </label>
              <input
                ref={packagingInputRef}
                type="file"
                accept="image/*"
                onChange={handlePackagingChange}
                className="sr-only"
                aria-label="Upload packaging photo"
              />
              {packagingPhoto ? (
                <div className="relative flex items-center gap-3 rounded-lg border border-[hsl(160,60%,80%)] bg-[hsl(160,60%,97%)] p-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={packagingPhoto || "/placeholder.svg"}
                      alt="Packaging preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground font-medium truncate">
                      {packagingFileName}
                    </p>
                    <p className="text-xs text-[hsl(160,60%,35%)] mt-0.5">
                      Verpakking vastgelegd
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPackagingPhoto(null)
                      setPackagingFileName("")
                      if (packagingInputRef.current)
                        packagingInputRef.current.value = ""
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors shrink-0"
                    aria-label="Remove packaging photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => packagingInputRef.current?.click()}
                  className="flex items-center gap-3 rounded-lg border-2 border-dashed border-[hsl(160,60%,75%)] bg-[hsl(160,60%,97%)] px-4 py-4 text-muted-foreground hover:border-[hsl(160,60%,50%)] hover:text-card-foreground transition-colors"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[hsl(160,60%,90%)] shrink-0">
                    <Camera className="w-4 h-4 text-[hsl(160,60%,35%)]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-card-foreground">
                      Foto van je verpakking
                    </p>
                    <p className="text-xs">
                      Bewijs dat je het pakket goed hebt ingepakt
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Receipt / QR / Label Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">
              {isOutgoing
                ? "Verzendlabel / QR-code"
                : "Afhaalbewijs / QR-code"}{" "}
              <span className="text-muted-foreground font-normal">
                (optioneel)
              </span>
            </label>
            <p
              className={`text-xs text-muted-foreground rounded-lg px-3 py-2 border leading-relaxed ${
                isOutgoing
                  ? "bg-[hsl(160,60%,95%)] border-[hsl(160,60%,80%)]"
                  : "bg-accent/60 border-primary/10"
              }`}
            >
              {isOutgoing
                ? "Tip: Upload het verzendlabel of de QR-code van PostNL, DHL of andere vervoerder."
                : "Tip: Maak een screenshot van de barcode in je mail en upload deze hier."}
            </p>
            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*"
              onChange={handleReceiptChange}
              className="sr-only"
              aria-label="Upload receipt or label"
            />
            {receiptPreview ? (
              <div className="relative flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receiptPreview || "/placeholder.svg"}
                    alt="Receipt preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground font-medium truncate">
                    {receiptFileName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isOutgoing ? "Label geupload" : "Bewijs geupload"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptPreview(null)
                    setReceiptFileName("")
                    if (receiptInputRef.current)
                      receiptInputRef.current.value = ""
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors shrink-0"
                  aria-label="Remove receipt"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => receiptInputRef.current?.click()}
                className={`flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-4 text-muted-foreground transition-colors ${
                  isOutgoing
                    ? "border-[hsl(160,60%,75%)] bg-[hsl(160,60%,97%)] hover:border-[hsl(160,60%,50%)] hover:text-card-foreground"
                    : "border-input bg-background hover:border-primary/40 hover:text-card-foreground hover:bg-accent/30"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                    isOutgoing
                      ? "bg-[hsl(160,60%,90%)]"
                      : "bg-muted"
                  }`}
                >
                  <QrCode
                    className={`w-4 h-4 ${
                      isOutgoing
                        ? "text-[hsl(160,60%,35%)]"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-card-foreground">
                    {isOutgoing
                      ? "Upload verzendlabel"
                      : "Upload afhaalbewijs"}
                  </p>
                  <p className="text-xs">
                    {isOutgoing
                      ? "Verzendlabel, QR-code of barcode"
                      : "QR-code, barcode of ontvangstbewijs"}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              isOutgoing
                ? "bg-[hsl(160,60%,42%)] text-[hsl(0,0%,100%)] hover:bg-[hsl(160,60%,36%)]"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isOutgoing ? "Verzending aanmaken" : "Pakket opslaan"}
          </button>
        </div>
      </div>
    </div>
  )
}
