"use client"

import { useState } from "react"
import { AuthForm } from "@/components/auth-form"
import { OverlayPanel } from "@/components/overlay-panel"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true)

  return (
    <main className="min-h-screen bg-[#5dca5d] flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl h-[500px] bg-card rounded-lg shadow-2xl overflow-hidden">
        {/* Sign In Form - à gauche quand actif */}
        <div
          className={`absolute inset-0 w-1/2 transition-all duration-700 ease-in-out ${
            isSignUp ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
          }`}
        >
          <AuthForm mode="signin" />
        </div>

        {/* Sign Up Form - à droite quand actif */}
        <div
          className={`absolute left-1/2 inset-y-0 w-1/2 transition-all duration-700 ease-in-out ${
            isSignUp ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <AuthForm mode="signup" />
        </div>

        {/* Overlay Panel */}
        <OverlayPanel isSignUp={isSignUp} onToggle={() => setIsSignUp(!isSignUp)} />
      </div>
    </main>
  )
}
