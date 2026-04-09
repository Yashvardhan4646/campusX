import React from 'react'

function GridPattern({ className = '' }) {
  return (
    <svg className={className} width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden>
      <rect width="100%" height="100%" fill="none" />
      <g stroke="#2a2a2a" strokeWidth="0.8" fill="#ffffff14">
        <circle cx="20" cy="20" r="2" />
        <circle cx="60" cy="40" r="2" />
        <circle cx="120" cy="30" r="2" />
        <circle cx="170" cy="70" r="2" />
        <circle cx="30" cy="120" r="2" />
        <circle cx="80" cy="160" r="2" />
      </g>
    </svg>
  )
}

function genRandomPattern(seed) {
  // for deterministic variation, but simple here
  return seed % 3
}

export function FeatureCard({ title, description, icon: Icon, index }) {
  const variant = genRandomPattern(index)
  return (
    <div className="relative p-6 bg-[#0f0f0f] rounded-3xl border border-white/5 group transform transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02]">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <GridPattern className="w-full h-full" />
      </div>

      {/* subtle hover sheen */}
      <span className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="absolute inset-0 bg-linear-to-br from-white/6 via-white/10 to-transparent mix-blend-screen blur-sm" />
      </span>

      <div className="relative z-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#1a1a1a] text-[hsl(var(--primary))]">
          {Icon ? <Icon className="w-6 h-6" /> : null}
        </div>

        <h3 className="mt-4 text-lg font-semibold text-[#f0f0f0]">{title}</h3>
        <p className="mt-2 text-sm text-[#f0f0f0]/70">{description}</p>
      </div>
    </div>
  )
}

export default FeatureCard
