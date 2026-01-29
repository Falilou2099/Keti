"use client";

import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased bg-white">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
