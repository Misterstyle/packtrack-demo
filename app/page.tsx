"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { LoginPage } from "@/components/login-page"
import { Dashboard } from "@/components/dashboard"
import { ShipmentProvider } from "@/contexts/ShipmentContext"
import { Package } from "lucide-react"

export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary animate-pulse">
            <Package className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <ShipmentProvider userId={user.id}>
      <Dashboard
        onLogout={async () => {
          await supabase.auth.signOut()
        }}
      />
    </ShipmentProvider>
  )
}
