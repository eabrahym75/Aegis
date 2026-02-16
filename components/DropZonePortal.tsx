"use client"
import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import ShieldCharacter from "./ShieldCharacter"

interface Props {
  onFileDrop: (file: File) => void
  isProcessing?: boolean
  tier?: "standard" | "stealth" | "ultra"
  reducedMotion?: boolean
}

export default function DropZonePortal({
  onFileDrop,
  isProcessing = false,
  tier = "standard",
  reducedMotion = false
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        onFileDrop(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileDrop(file)
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col items-center justify-center py-8"
    >
      {/* Rotating Portal Ring */}
      <motion.div
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
        className="relative w-64 h-64 mb-6"
      >
        {/* Outer portal border */}
        <div
          className={`absolute inset-0 rounded-full border-4 border-[#FF8C42]/40 transition-all duration-300 ${
            isDragging ? "border-[#FF8C42]/80 shadow-lg shadow-[#FF8C42]/20" : ""
          }`}
        />

        {/* Portal glow on drag */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={isDragging ? { opacity: [0.2, 0.5, 0.2] } : { opacity: 0 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(255,140,66,0.4), rgba(255,140,66,0.1) 50%, transparent)"
          }}
        />

        {/* Inner rotating accent */}
        <motion.div
          animate={reducedMotion ? {} : { rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear", direction: "reverse" }}
          className="absolute inset-8 rounded-full border-2 border-transparent border-t-[#FF8C42]/60 border-r-[#FF8C42]/40"
        />

        {/* Center drop zone - interactive portal */}
        <motion.div
          className="absolute inset-12 rounded-full flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF8C42]"
          animate={isDragging ? { scale: 1.12, backgroundColor: "#FFF9F3" } : { scale: 1, backgroundColor: "#FFFBF0" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if ((e.key === "Enter" || e.key === " ") && !isProcessing) {
              fileInputRef.current?.click()
            }
          }}
          role="button"
          tabIndex={isProcessing ? -1 : 0}
          aria-label="Upload image to portal"
          aria-disabled={isProcessing}
          style={{
            boxShadow: isDragging
              ? "0 0 40px rgba(255, 140, 66, 0.3), inset 0 0 20px rgba(255, 140, 66, 0.1)"
              : "inset 0 4px 20px rgba(0, 0, 0, 0.04)"
          }}
        >
          {!isProcessing ? (
            <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Portal icon */}
              <motion.div
                animate={reducedMotion ? {} : { y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl"
                aria-hidden="true"
              >
                🌀
              </motion.div>

              {/* Text */}
              <div className="text-center">
                <motion.p className="text-sm font-semibold text-[#2D3436]">
                  {isDragging ? "Drop to protect! 🛡️" : "Drag image here"}
                </motion.p>
                <p className="text-xs text-[#6B6E6E] mt-1">or click to browse</p>
              </div>

              {/* Upload button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-[#FF8C42] text-white rounded-full text-sm font-semibold shadow-lg shadow-orange-200/40 hover:shadow-orange-200/60 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF8C42]"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Choose File
              </motion.button>
            </motion.div>
          ) : (
            <motion.div className="flex flex-col items-center gap-4">
              {/* Character jumping into portal */}
              <motion.div
                animate={{ y: [0, -40, -80, -80] }}
                transition={{ duration: 1.2, times: [0, 0.4, 0.8, 1], repeat: Infinity }}
                className="w-20 h-20"
              >
                <ShieldCharacter tier={tier} size={80} reducedMotion={reducedMotion} />
              </motion.div>

              <p className="text-sm font-semibold text-[#2D3436] mt-4">Forging...</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="File input"
      />
    </div>
  )
}
