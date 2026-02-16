"use client"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Props {
  tier?: "standard" | "stealth" | "ultra"
  className?: string
  reducedMotion?: boolean
}

export default function ShieldHero({ tier = "standard", className = "", reducedMotion: reducedMotionProp }: Props) {
  const [reducedMotion, setReducedMotion] = useState(Boolean(reducedMotionProp))

  useEffect(() => {
    try {
      if (reducedMotionProp === undefined) {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
        setReducedMotion(mq.matches)
        const handler = (ev: any) => setReducedMotion(ev.matches)
        if (mq.addEventListener) mq.addEventListener('change', handler)
        else mq.addListener(handler)
      }
    } catch (e) {
      // ignore
    }
  }, [reducedMotionProp])

  const repeatSetting = reducedMotion ? 0 : Infinity

  return (
    <div className={`relative w-[280px] h-[280px] ${className}`} role="img" aria-label="Data-Blob protection hero animation">
      {/* Background container with soft gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FFFBF0] to-[#FFF6EA] shadow-lg" />

      {/* Data-Blob - nervous character */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
        transition={{ 
          opacity: { duration: 0.3 },
          y: { repeat: repeatSetting, duration: 2.4, ease: "easeInOut" }
        }}
        className="absolute left-8 top-12 flex items-center justify-center"
      >
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blob body */}
          <motion.g
            animate={reducedMotion ? {} : { scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
          >
            <circle cx="70" cy="65" r="38" fill="#FFD8A6" />
            <circle cx="55" cy="45" r="8" fill="#2D3436" />
            <circle cx="85" cy="45" r="8" fill="#2D3436" />
            {/* Nervous expression - wider mouth when scanning happens */}
            <motion.path 
              d="M50 75 Q70 88 90 75"
              stroke="#2D3436"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              animate={reducedMotion ? {} : { d: ["M50 75 Q70 88 90 75", "M50 75 Q70 85 90 75", "M50 75 Q70 88 90 75"] }}
              transition={{ repeat: Infinity, duration: 2.4, times: [0, 0.5, 1] }}
            />
          </motion.g>
          
          {/* Sweat drops when stressed */}
          <motion.circle 
            cx="52" cy="30" r="3" fill="#FFB3BA"
            initial={{ opacity: 0, y: -5 }}
            animate={reducedMotion ? {} : { opacity: [0, 1, 0], y: [0, 8, 16] }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 0.6 }}
          />
        </svg>
      </motion.div>

      {/* AI Eye Scanner from top-right - tries to scan */}
      <motion.div 
        className="absolute -top-4 -right-4 w-20 h-20"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
          {/* Scanner eye */}
          <motion.g
            animate={reducedMotion ? {} : { 
              x: [0, 24, 40, 24, 0],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <circle cx="40" cy="15" r="10" fill="#2D3436" />
            <circle cx="40" cy="15" r="6" fill="#FF8C42" opacity="0.8" />
            <circle cx="41" cy="13" r="2" fill="white" />
          </motion.g>

          {/* Scanning beam */}
          <motion.line 
            x1="40" y1="25" x2="35" y2="70"
            stroke="#FF8C42"
            strokeWidth="2.5"
            opacity="0.3"
            animate={reducedMotion ? {} : { 
              x1: [40, 64, 80, 64, 40],
              x2: [35, 59, 75, 59, 35],
              opacity: [0.1, 0.5, 0.8, 0.5, 0.1]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            strokeLinecap="round"
          />

          {/* Outer scanning ring */}
          <motion.circle
            cx="40"
            cy="40"
            r="15"
            stroke="#FF8C42"
            strokeWidth="1.5"
            opacity="0.2"
            animate={reducedMotion ? {} : { r: [15, 25, 15] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Protective Barrier - Glowing orange shield that blocks the scan */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Barrier glow pulse */}
        <motion.div
          className="absolute left-8 top-1/3 w-32 h-16 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FFB347]"
          animate={reducedMotion ? {} : { 
            scaleX: [0, 1, 0.95, 1, 0],
            opacity: [0, 0.6, 0.8, 0.6, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut"
          }}
          style={{ transformOrigin: 'center' }}
        />

        {/* Secondary protective ring */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-[#FF8C42]"
          animate={reducedMotion ? {} : { 
            opacity: [0.2, 0.6, 0.3, 0.2],
            scale: [0.8, 1.1, 0.95, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2.4,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Decorative shield accent */}
      <motion.div
        className="absolute -bottom-2 right-4 text-4xl"
        animate={reducedMotion ? {} : { rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.2 }}
        aria-hidden="true"
      >
        🛡️
      </motion.div>
    </div>
  )
}
