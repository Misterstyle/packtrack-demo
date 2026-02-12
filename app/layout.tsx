import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster" // Deze is essentieel!

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PackTrack - Multi-Carrier Tracking for Vinted',
  description: 'Track all your Vinted parcels in one calm view. Mondial Relay, DHL, PostNL and more.',
}

export const viewport: Viewport = {
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl">
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
        <Toaster /> {/* Hierdoor werken je meldingen overal in de app */}
      </body>
    </html>
  )
}