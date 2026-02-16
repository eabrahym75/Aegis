import { VerificationForm } from "@/components/verification-form";
import { Shield, Lock, Search } from "lucide-react";

export default function VerifyPage() {
    return (
        <div className="flex-1 flex flex-col py-20 px-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto w-full relative z-10">
                <div className="text-center space-y-6 mb-24 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <Lock className="w-3.5 h-3.5" /> High-Fidelity Extraction
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none">
                        Verify <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Integrity</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                        Our advanced pixel-layer deep scan detects hidden Aegis-ID signatures that survive metadata stripping and AI manipulation.
                    </p>
                </div>

                <VerificationForm />

                {/* Features / Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                            <Search className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Sub-Pixel Analysis</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            We scan the Least Significant Bits (LSB) of the image data to extract hidden Ghost Layer IDs that survive most metadata stripping.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Cryptographic Proof</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Each Aegis-ID is a unique identifier tied to the original owner and protection timestamp, providing undisputed proof of ownership.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                            <Lock className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Privacy First</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Images are analyzed in-memory and immediately discarded. We never store or log your uploaded assets.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
