import Link from "next/link"
import { Package, AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(0,84%,94%)]">
          <AlertCircle className="w-7 h-7 text-[hsl(0,84%,40%)]" />
        </div>
        <h1 className="text-2xl font-bold text-card-foreground">Authenticatie fout</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Er is iets misgegaan bij het inloggen. Probeer het opnieuw.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
        >
          <Package className="w-4 h-4" />
          Terug naar PackTrack
        </Link>
      </div>
    </main>
  )
}
