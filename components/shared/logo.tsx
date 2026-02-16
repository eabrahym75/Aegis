export function Logo({ className = "w-8 h-8", classNameText = "text-xl" }: { className?: string, classNameText?: string }) {
    return (
        <div className="flex items-center gap-2 group cursor-pointer">
            <div className={`relative ${className} transition-transform group-hover:scale-110 duration-300`}>
                {/* Shield Base */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                >
                    <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        className="fill-slate-900 stroke-indigo-500 stroke-2"
                    />
                    {/* Aperture Iris (Shutter) */}
                    <circle cx="12" cy="11" r="3" className="stroke-cyan-400 stroke-[1.5] fill-slate-800" />
                    <path d="M12 8L12 6" className="stroke-cyan-400 stroke-[1.5]" />
                    <path d="M12 14L12 16" className="stroke-cyan-400 stroke-[1.5]" />
                    <path d="M15 11L17 11" className="stroke-cyan-400 stroke-[1.5]" />
                    <path d="M9 11L7 11" className="stroke-cyan-400 stroke-[1.5]" />
                </svg>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full -z-10 group-hover:bg-indigo-500/40 transition-all" />
            </div>
            
            <div className={`font-bold tracking-tight ${classNameText}`}>
                <span className="text-white">Pic</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Protect</span>
            </div>
        </div>
    );
}
