"use client"

import { Button } from "@/components/ui/button"

interface OverlayPanelProps {
  isSignUp: boolean
  onToggle: () => void
}

export function OverlayPanel({ isSignUp, onToggle }: OverlayPanelProps) {
  return (
    <div
      className={`absolute top-0 w-1/2 h-full transition-transform duration-700 ease-in-out ${
        isSignUp ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* SVG Low-Poly Background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 500"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFEB3B" />
            <stop offset="50%" stopColor="#8BC34A" />
            <stop offset="100%" stopColor="#4CAF50" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect width="500" height="500" fill="url(#grad1)" />
        
        {/* Low-poly triangles */}
        <polygon points="0,0 100,50 50,100" fill="#CDDC39" opacity="0.7" />
        <polygon points="100,0 200,0 150,80" fill="#D4E157" opacity="0.6" />
        <polygon points="200,0 300,0 250,100" fill="#C0CA33" opacity="0.5" />
        <polygon points="300,0 400,0 350,80" fill="#AFB42B" opacity="0.6" />
        <polygon points="400,0 500,0 500,100 450,50" fill="#9E9D24" opacity="0.5" />
        
        <polygon points="0,100 100,50 100,150 50,200" fill="#AED581" opacity="0.6" />
        <polygon points="100,50 200,100 150,180 100,150" fill="#9CCC65" opacity="0.7" />
        <polygon points="150,80 250,100 200,200 150,180" fill="#8BC34A" opacity="0.6" />
        <polygon points="250,100 350,80 300,200 200,200" fill="#7CB342" opacity="0.5" />
        <polygon points="350,80 450,50 500,150 400,200 300,200" fill="#689F38" opacity="0.6" />
        
        <polygon points="0,200 50,200 100,300 50,350 0,300" fill="#81C784" opacity="0.7" />
        <polygon points="50,200 150,180 200,300 100,300" fill="#66BB6A" opacity="0.6" />
        <polygon points="150,180 200,200 250,320 200,300" fill="#4CAF50" opacity="0.7" />
        <polygon points="200,200 300,200 350,300 250,320" fill="#43A047" opacity="0.6" />
        <polygon points="300,200 400,200 450,300 350,300" fill="#388E3C" opacity="0.5" />
        <polygon points="400,200 500,150 500,350 450,300" fill="#2E7D32" opacity="0.6" />
        
        <polygon points="0,300 50,350 100,400 0,450" fill="#69F0AE" opacity="0.5" />
        <polygon points="50,350 100,300 200,400 100,400" fill="#00E676" opacity="0.6" />
        <polygon points="100,300 200,300 250,400 200,400" fill="#00C853" opacity="0.5" />
        <polygon points="200,300 250,320 300,420 250,400" fill="#2E7D32" opacity="0.7" />
        <polygon points="250,320 350,300 400,420 300,420" fill="#1B5E20" opacity="0.6" />
        <polygon points="350,300 450,300 500,450 400,420" fill="#33691E" opacity="0.5" />
        
        <polygon points="0,450 100,400 150,500 0,500" fill="#558B2F" opacity="0.6" />
        <polygon points="100,400 200,400 250,500 150,500" fill="#689F38" opacity="0.7" />
        <polygon points="200,400 250,400 300,500 250,500" fill="#7CB342" opacity="0.6" />
        <polygon points="250,400 300,420 350,500 300,500" fill="#8BC34A" opacity="0.5" />
        <polygon points="300,420 400,420 450,500 350,500" fill="#9CCC65" opacity="0.6" />
        <polygon points="400,420 500,450 500,500 450,500" fill="#AED581" opacity="0.7" />
      </svg>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
        <div
          className={`transition-all duration-500 delay-200 ${
            isSignUp
              ? "opacity-0 translate-y-4 pointer-events-none absolute"
              : "opacity-100 translate-y-0"
          }`}
        >
          <h2 className="text-3xl font-bold text-[#1a4d1a] mb-4 drop-shadow-sm">
            Welcome back !
          </h2>
          <p className="text-[#2d5a2d] mb-6 text-lg">
            si vous n{"'"}êtes pas
            <br />
            encore inscrit
          </p>
          <Button
            onClick={onToggle}
            variant="outline"
            className="bg-white/90 hover:bg-white text-[#2d5a2d] border-0 rounded-full px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            sign up
          </Button>
        </div>

        <div
          className={`transition-all duration-500 delay-200 ${
            isSignUp
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none absolute"
          }`}
        >
          <h2 className="text-3xl font-bold text-[#1a4d1a] mb-4 drop-shadow-sm">
            Bienvenue !
          </h2>
          <p className="text-[#2d5a2d] mb-6 text-lg">
            si vous avez déjà
            <br />
            un compte
          </p>
          <Button
            onClick={onToggle}
            variant="outline"
            className="bg-white/90 hover:bg-white text-[#2d5a2d] border-0 rounded-full px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            sign in
          </Button>
        </div>
      </div>
    </div>
  )
}
