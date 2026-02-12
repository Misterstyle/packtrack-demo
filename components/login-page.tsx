"use client"

import React from "react"

import { useState } from "react"
import { Package, Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, Truck, MapPin, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type AuthMode = "login" | "signup" | "magic-link"

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Inloggen mislukt")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setSignUpSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registratie mislukt")
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setMagicLinkSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Magic link versturen mislukt")
    } finally {
      setLoading(false)
    }
  }

  // Success states
  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(152,60%,92%)]">
            <Mail className="w-7 h-7 text-[hsl(152,60%,35%)]" />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">Check je inbox</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We hebben een magic link gestuurd naar <strong className="text-card-foreground">{email}</strong>.
            Klik op de link in de e-mail om in te loggen.
          </p>
          <button
            type="button"
            onClick={() => { setMagicLinkSent(false); setMode("login") }}
            className="text-sm text-primary font-medium hover:underline mt-2"
          >
            Terug naar inloggen
          </button>
        </div>
      </div>
    )
  }

  if (signUpSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(152,60%,92%)]">
            <Mail className="w-7 h-7 text-[hsl(152,60%,35%)]" />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">Bevestig je e-mail</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We hebben een bevestigingsmail gestuurd naar <strong className="text-card-foreground">{email}</strong>.
            Klik op de link om je account te activeren.
          </p>
          <button
            type="button"
            onClick={() => { setSignUpSuccess(false); setMode("login") }}
            className="text-sm text-primary font-medium hover:underline mt-2"
          >
            Terug naar inloggen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground p-12 relative overflow-hidden">
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
              Al je pakketten, een helder overzicht.
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed">
              Track PostNL, DHL, DPD, Vinted Go en meer. Ontworpen voor Vinted power-users die grip willen op elke aankoop en verzending.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary-foreground/50">
              <Truck className="w-4 h-4" />
              <span className="text-sm">6+ Vervoerders</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/50">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Overal tracken</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/50">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm">Veilig & prive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-card">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:mb-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-card-foreground">PackTrack</span>
          </div>

          <h2 className="text-3xl font-bold text-card-foreground mb-2 text-balance">
            {mode === "login" ? "Welkom terug" : mode === "signup" ? "Account aanmaken" : "Magic Link"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {mode === "login"
              ? "Log in op je PackTrack dashboard"
              : mode === "signup"
                ? "Maak een gratis account aan"
                : "Log in met een link via e-mail"}
          </p>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1 mb-6">
            {(
              [
                { key: "login" as const, label: "Inloggen" },
                { key: "signup" as const, label: "Registreren" },
                { key: "magic-link" as const, label: "Magic Link" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setMode(tab.key); setError(null) }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                  mode === tab.key
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignUp : handleMagicLink}
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-email" className="text-sm font-medium text-card-foreground">E-mailadres</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Password (login/signup only) */}
            {mode !== "magic-link" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-password" className="text-sm font-medium text-card-foreground">Wachtwoord</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Minimaal 6 tekens"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-12 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                    aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Magic link info */}
            {mode === "magic-link" && (
              <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/10 px-3.5 py-3">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We sturen een inloglink naar je e-mail. Geen wachtwoord nodig.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-[hsl(0,84%,94%)] border border-[hsl(0,84%,86%)] px-3.5 py-3">
                <p className="text-xs text-[hsl(0,84%,40%)] font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all mt-1"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Inloggen" : mode === "signup" ? "Account aanmaken" : "Stuur magic link"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
