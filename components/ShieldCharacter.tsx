"use client"
import React from "react"
import { motion } from "framer-motion"

type Tier = "standard" | "stealth" | "ultra"

interface Props {
  tier: Tier
  className?: string
  size?: number
  reducedMotion?: boolean
}

export default function ShieldCharacter({ tier, className = "", size = 160, reducedMotion = false }: Props) {
  const wiggle = { rotate: [0, -8, 6, 0] }
  const vanish = { opacity: [1, 0.15, 1] }
  const sheen = { translateX: [-40, 60] }
  const repeatSetting = reducedMotion ? 0 : Infinity

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0.98 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`flex items-center justify-center ${className}`}
      aria-hidden={false}
    >
      {tier === "standard" && (
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          whileHover={wiggle}
          transition={{ duration: 0.9 }}
        >
          <rect rx="28" width="160" height="160" fill="#FFF3E8" />
          <g transform="translate(20,20)">
            <circle cx="60" cy="50" r="28" fill="#FFD8A6" />
            <rect x="44" y="70" width="32" height="22" rx="6" fill="#8B5A2B" />
            <text x="60" y="48" textAnchor="middle" fontSize="10" fill="#2D3436" fontWeight="700">:)</text>
          </g>
        </motion.svg>
      )}

      {tier === "stealth" && (
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0.75 }}
          whileHover={{ opacity: 1, scale: 1.03 }}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <rect rx="28" width="160" height="160" fill="#FFF6EA" />
          <motion.g transform="translate(18,18)" opacity="0.85" whileHover={vanish} transition={{ duration: 0.9 }}>
            <ellipse cx="60" cy="54" rx="28" ry="26" fill="#FFDDB8" />
            <path d="M32 84 Q60 100 88 84" stroke="#2D3436" strokeWidth="3" fill="none" strokeOpacity="0.08" />
            <rect x="46" y="70" width="28" height="14" rx="6" fill="#2D3436" opacity="0.08" />
          </motion.g>
        </motion.svg>
      )}

      {tier === "ultra" && (
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          initial={{ scale: 0.96 }}
          whileHover={{ scale: 1.06 }}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <rect rx="28" width="160" height="160" fill="#FFF5E8" />
          <g transform="translate(18,18)">
            <circle cx="60" cy="44" r="30" fill="#FFE6B8" />
            <g transform="translate(36,62)">
              <rect width="48" height="26" rx="8" fill="#C59A46" />
              <path d="M4 6 L44 6" stroke="#FFD36B" strokeWidth="3" strokeOpacity="0.9" />
            </g>
            <motion.g
              animate={{ rotate: [0, 12, -6, 0] }}
              transition={{ repeat: repeatSetting, duration: 3 }}
              style={{ transformOrigin: "60px 44px" }}
            >
              <path d="M20 12 Q60 -4 100 12" stroke="#FFD36B" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.28" />
            </motion.g>

            <defs>
              <linearGradient id="sheenGrad" x1="0" x2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feBlend in="SourceGraphic" in2="b" />
              </filter>
            </defs>

            <motion.rect
              x={-30}
              y={8}
              width={80}
              height={52}
              rx={18}
              fill="url(#sheenGrad)"
              transform="rotate(18)"
              animate={{ x: [-30, 60] }}
              transition={{ repeat: repeatSetting, duration: 2.2, ease: "linear" }}
              style={{ mixBlendMode: "screen", opacity: 0.95 }}
            />

            <motion.ellipse
              cx="60"
              cy="44"
              rx="44"
              ry="44"
              fill="#FFB85A"
              opacity={0.06}
              filter="url(#softBlur)"
              animate={{ opacity: [0.06, 0.14, 0.06] }}
              transition={{ repeat: repeatSetting, duration: 3.2 }}
            />
          </g>
        </motion.svg>
      )}
    </motion.div>
  )
}
