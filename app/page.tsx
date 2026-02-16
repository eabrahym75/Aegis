"use client"
import React, { useState, useRef, useEffect } from "react"
import ShieldCharacter from "@/components/ShieldCharacter"
import ShieldHero from "@/components/ShieldHero"
import DropZonePortal from "@/components/DropZonePortal"
import ForgingProgress from "@/components/ForgingProgress"
import CharacterToast from "@/components/CharacterToast"
import { motion, AnimatePresence } from "framer-motion"

type Tier = "standard" | "stealth" | "ultra"

interface ToastMessage {
  id: string
  message: string
  duration?: number
}

const TIER_DESCRIPTIONS = {
  standard: "Standard shield. Basic protection against AI scanning.",
  stealth: "Stealth mode. Metadata stripped + quiet protection.",
  ultra: "Maximum armor. Full C2PA certification + advanced protection."
}

const TIER_MESSAGES = {
  standard: "Standard protection ready! Your data is safe.",
  stealth: "Stealth activated. Shh... no one will know. 🤫",
  ultra: "Ultimate armor engaged! Fully protected. ⚔️"
}

export default function Home() {
  const [tier, setTier] = useState<Tier>("standard")
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const toastIdRef = useRef(0)

  useEffect(() => {
    const onResize = () => setIsMobile(typeof window !== "undefined" ? window.innerWidth < 768 : false)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mq.matches)
      const handler = (ev: any) => setPrefersReducedMotion(ev.matches)
      if (mq.addEventListener) mq.addEventListener("change", handler)
      else mq.addListener(handler)
      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", handler)
        else mq.removeListener(handler)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  function addToast(message: string, duration = 3000) {
    const id = String(toastIdRef.current++)
    setToasts((prev) => [...prev, { id, message, duration }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }

  function handleTierSelect(newTier: Tier) {
    setTier(newTier)
    addToast(TIER_MESSAGES[newTier], 2500)
  }

  function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      addToast("That's not an image. Drop an image file! 📸", 3000)
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)
    addToast("Uploading and forging your armor...")

    const form = new FormData()
    form.append("file", file)
    form.append("level", tier)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/protect")

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.round((ev.loaded / ev.total) * 100)
        setUploadProgress(pct)
      }
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        setIsProcessing(false)
        if (xhr.status >= 200 && xhr.status < 300) {
          const disposition = xhr.getResponseHeader("Content-Disposition") || ""
          const filenameMatch = /filename="?(.+?)"?(?:;|$)/.exec(disposition)
          const filename = filenameMatch ? filenameMatch[1] : `protected-${file.name}`

          const blob = new Blob([xhr.response], {
            type: xhr.getResponseHeader("Content-Type") || "application/octet-stream"
          })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)

          addToast("Perfect! Your image is now armored. 🛡️", 3500)
        } else {
          addToast("Oops! Something went wrong. Please try again. 😞", 3500)
        }
        setUploadProgress(0)
      }
    }

    xhr.onerror = () => {
      setIsProcessing(false)
      setUploadProgress(0)
      addToast("Connection lost. Please try again.", 3500)
    }

    xhr.responseType = "arraybuffer"
    xhr.send(form)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBF0] via-[#FFFBF0] to-[#FFF6EA] text-[#2D3436]">

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Hero section with headline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            <span className="text-[#2D3436]">Don&apos;t let</span>{" "}
            <span className="bg-gradient-to-r from-[#FF8C42] to-[#FFB347] bg-clip-text text-transparent">AI undress</span>{" "}
            <span className="text-[#2D3436]">your data.</span>
          </h2>
          <p className="text-lg text-[#6B6E6E] max-w-2xl mx-auto">
            Protect your images with gamified, warm-hearted AI defense. Choose your armor tier and forge unbreakable protection.
          </p>
        </motion.section>

        {/* 3-Step Armoring Process */}
        <section className="space-y-8">
          {/* Step 1: Hero State - The Data-Blob */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-gradient-to-br from-[#FFFBF0] to-[#FFF9F3] p-8 md:p-12 shadow-lg ring-1 ring-[#FF8C42]/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center md:justify-start">
                <ShieldHero reducedMotion={prefersReducedMotion} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Step 1: Meet Your Data</h3>
                <p className="text-[#6B6E6E] mb-4 leading-relaxed">
                  This is your data-blob. A little nervous, but ready to be armored. Protect it from AI scanners by choosing a protection tier below.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-[#FF8C42]/10 text-[#FF8C42] rounded-full text-sm font-semibold">🎯 Nervous</span>
                  <span className="px-3 py-1 bg-[#00C897]/10 text-[#00C897] rounded-full text-sm font-semibold">🛡️ Ready to armor</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Tier Selector - Character Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Step 2: Choose Your Armor</h3>
            <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
              {(["standard", "stealth", "ultra"] as Tier[]).map((t, idx) => (
                <motion.button
                  key={t}
                  onClick={() => handleTierSelect(t)}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + idx * 0.1 }}
                  className={`rounded-3xl p-6 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF8C42] ${tier === t
                    ? "bg-gradient-to-br from-[#FF8C42]/20 to-[#FF8C42]/10 border-3 border-[#FF8C42] shadow-lg shadow-orange-200/30"
                    : "bg-white border-2 border-[#FFF6EA] hover:border-[#FF8C42]/50 shadow-md"
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      <ShieldCharacter tier={t} size={80} reducedMotion={prefersReducedMotion} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-1">{t.charAt(0).toUpperCase() + t.slice(1)} Shield</h4>
                      <p className="text-sm text-[#6B6E6E]">{TIER_DESCRIPTIONS[t]}</p>
                      {tier === t && (
                        <motion.div className="mt-3 inline-block px-3 py-1 bg-[#00C897]/20 text-[#00C897] rounded-full text-xs font-semibold">
                          ✓ Selected
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Step 3: Upload Portal - The Interaction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Step 3: Forge Your Protection</h3>
            <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-[#FF8C42]/10">
              <DropZonePortal
                onFileDrop={handleFileUpload}
                isProcessing={isProcessing}
                tier={tier}
                reducedMotion={prefersReducedMotion}
              />
            </div>
          </motion.div>

          {/* Forging Progress */}
          {(isProcessing || uploadProgress > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl bg-gradient-to-r from-[#FFF3E8] to-[#FFF6EA] p-8 shadow-lg"
            >
              <ForgingProgress
                progress={uploadProgress}
                isProcessing={isProcessing}
                reducedMotion={prefersReducedMotion}
              />
            </motion.div>
          )}
        </section>

        {/* Feature highlights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-16 border-t border-[#FF8C42]/10"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Why Choose Aegis Shield?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "🎮", title: "Gamified", description: "Make protection fun with cute characters and rewards" },
              { emoji: "🔒", title: "Secure", description: "Advanced AI detection & metadata stripping" },
              { emoji: "☁️", title: "Easy", description: "One-click protection cloud upload available" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="rounded-3xl p-6 bg-white shadow-md border border-[#FFF6EA] text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h4 className="font-bold mb-2">{feature.title}</h4>
                <p className="text-sm text-[#6B6E6E]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Character Toast Notifications */}
      <CharacterToast messages={toasts} tier={tier} reducedMotion={prefersReducedMotion} />

      {/* Background accent elements */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-[#FF8C42]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-40 left-10 w-96 h-96 bg-[#00C897]/3 rounded-full blur-3xl pointer-events-none -z-10" />
    </div>
  )
}
