"use client"

import React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Upload, ImageIcon, CheckCircle, ChevronDown } from "lucide-react"
import type { Carrier } from "@/components/shipment-card"
import {
  MondialRelayLogo,
  DHLLogo,
  PostNLLogo,
  DPDLogo,
} from "@/components/carrier-logos"
import type { ShipmentData } from "@/components/shipment-card"

const carriers: { value: Carrier; label: string; Logo: React.ComponentType<{ className?: string }> }[] = [
  { value: "mondial-relay", label: "Mondial Relay", Logo: MondialRelayLogo },
  { value: "dhl", label: "DHL", Logo: DHLLogo },
  { value: "postnl", label: "PostNL", Logo: PostNLLogo },
  { value: "dpd", label: "DPD", Logo: DPDLogo },
]

interface AddParcelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (parcel: ShipmentData) => void
}

export function AddParcelModal({ isOpen, onClose, onSave }: AddParcelModalProps) {
  const [itemName, setItemName] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState<Carrier | "">("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const resetForm = useCallback(() => {
    setItemName("")
    setTrackingNumber("")
    setCarrier("")
    setImagePreview(null)
    setFileName("")
    setShowSuccess(false)
    setIsDropdownOpen(false)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close modal on Escape key
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

  function handleSave() {
    if (!itemName.trim() || !trackingNumber.trim() || !carrier) return

    const newParcel: ShipmentData = {
      id: Date.now().toString(),
      itemName: itemName.trim(),
      image: imagePreview || "/images/product-1.jpg",
      status: "processing",
      carrier: carrier,
      trackingCode: trackingNumber.trim().toUpperCase(),
      lastUpdate: "Just now",
    }

    setShowSuccess(true)
    setTimeout(() => {
      onSave(newParcel)
      handleClose()
    }, 1500)
  }

  const isValid = itemName.trim() !== "" && trackingNumber.trim() !== "" && carrier !== ""
  const selectedCarrier = carriers.find((c) => c.value === carrier)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
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
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-card">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(152,60%,92%)] mb-4">
              <CheckCircle className="w-8 h-8 text-[hsl(152,60%,30%)]" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1">Parcel added!</h3>
            <p className="text-sm text-muted-foreground">Your shipment is now being tracked.</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Add New Parcel</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Enter your shipment details below
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
          {/* Item Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="item-name" className="text-sm font-medium text-card-foreground">
              Item Name
            </label>
            <input
              id="item-name"
              type="text"
              placeholder="e.g. Vintage Denim Jacket"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
          </div>

          {/* Tracking Number */}
          <div className="flex flex-col gap-2">
            <label htmlFor="tracking-number" className="text-sm font-medium text-card-foreground">
              Tracking Number
            </label>
            <input
              id="tracking-number"
              type="text"
              placeholder="e.g. MR-2849301847"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-card-foreground font-mono placeholder:font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
            />
          </div>

          {/* Carrier Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">
              Carrier
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
                  <span>Select a carrier</span>
                )}
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
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
          </div>

          {/* Photo Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">
              Product Photo <span className="text-muted-foreground font-normal">(optional)</span>
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
                  <p className="text-sm text-card-foreground font-medium truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Photo uploaded</p>
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
                  Upload a photo
                </div>
                <span className="text-xs">JPG, PNG or WebP</span>
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
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Parcel
          </button>
        </div>
      </div>
    </div>
  )
}
