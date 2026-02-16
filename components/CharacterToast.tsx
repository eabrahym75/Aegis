"use client"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ToastMessage {
  id: string
  message: string
  duration?: number
}

interface Props {
  messages: ToastMessage[]
  tier?: "standard" | "stealth" | "ultra"
  reducedMotion?: boolean
}

const tierEmojis = {
  standard: "🙂",
  stealth: "🥷",
  ultra: "🛡️"
}

const tierColors = {
  standard: "bg-[#FFE6CC]",
  stealth: "bg-[#E8E8E8]",
  ultra: "bg-[#FFE8B3]"
}

export default function CharacterToast({ messages, tier = "standard", reducedMotion = false }: Props) {
  const character = tierEmojis[tier]
  const bgColor = tierColors[tier]

  return (
    <AnimatePresence mode="popLayout">
      <div className="fixed bottom-4 left-4 space-y-2 max-w-xs z-50">
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            layout
            className="flex items-end gap-2 group"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Character avatar */}
            <motion.div
              className={`text-3xl ${bgColor} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}
              animate={reducedMotion ? {} : { scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {character}
            </motion.div>

            {/* Chat bubble */}
            <motion.div
              className="flex-1 bg-white rounded-3xl px-4 py-3 shadow-lg border-2 border-[#FFF6EA] group-hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="text-sm text-[#2D3436] font-medium leading-relaxed">{msg.message}</p>

              {/* Tail pointing to character */}
              <div className="absolute -left-2 bottom-3 w-4 h-4 bg-white border-2 border-[#FFF6EA] rounded-full" />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}
