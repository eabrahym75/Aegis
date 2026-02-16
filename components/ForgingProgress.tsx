"use client"
import React from "react"
import { motion } from "framer-motion"

interface Props {
  progress: number
  isProcessing: boolean
  reducedMotion?: boolean
}

export default function ForgingProgress({ progress, isProcessing, reducedMotion = false }: Props) {
  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* Progress bar */}
      <div className="relative h-3 bg-gradient-to-r from-[#FFF3E8] to-[#FFF6EA] rounded-full overflow-hidden shadow-inner">
        {/* Fill bar with gradient */}
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF8C42] to-[#00C897] rounded-full shadow-lg"
          style={{ width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.3 }}
        />

        {/* Animated shine effect */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 h-full w-1/4 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
            animate={reducedMotion ? {} : { x: ["-100%", "500%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        )}
      </div>

      {/* Forging UI with hammer and anvil */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[#2D3436]">
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <span>Forging your armor...</span>
              <motion.div
                animate={reducedMotion ? {} : { x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-lg"
                aria-hidden="true"
              >
                🔨
              </motion.div>
            </div>
          ) : (
            <span className="text-[#6B6E6E]">Ready to protect</span>
          )}
        </div>

        {/* Progress percentage */}
        {isProcessing && (
          <motion.div className="text-sm font-bold text-[#FF8C42]">
            {progress}%
          </motion.div>
        )}
      </div>

      {/* Anvil strikes animation */}
      {isProcessing && (
        <div className="flex justify-center gap-1 mt-2">
          {[0, 1, 2].map((idx) => (
            <motion.div
              key={idx}
              className="text-lg"
              animate={reducedMotion ? {} : { y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: idx * 0.2
              }}
              aria-hidden="true"
            >
              ⚒️
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
