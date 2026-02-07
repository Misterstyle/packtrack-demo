"use client"

import React from "react"

import { useState } from "react"
import { Package, ArrowRight, Truck, MapPin, ShieldCheck } from "lucide-react"

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground p-12 relative overflow-hidden">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Decorative blurred orb */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary-foreground">PackTrack</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight text-primary-foreground mb-4 text-balance">
              All your parcels, one calm view.
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              Track Mondial Relay, PostNL, DHL, DPD, Hermes and more. Designed for Vinted power-users who need a clear overview of every purchase.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary-foreground/50">
              <Truck className="w-4 h-4" />
              <span className="text-sm">6+ Carriers</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/50">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Track from anywhere</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/50">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm">Private & secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-card">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-card-foreground">PackTrack</span>
          </div>

          <h2 className="text-3xl font-bold text-card-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your PackTrack dashboard</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-card-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-1"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {"Don't have an account? "}
            <button type="button" className="text-primary font-medium hover:underline">
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
