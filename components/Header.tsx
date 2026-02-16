import Link from "next/link";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b border-[#FF8C42]/10 bg-[#FFFBF0]/90 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Shield className="w-6 h-6 text-[#FF8C42]" />
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#FF8C42] to-[#00C897] bg-clip-text text-transparent">
          Aegis
        </span>
      </Link>

      <nav className="flex items-center gap-4">
        <Link href="/" className="text-sm font-medium text-[#2D3436]/70 hover:text-[#2D3436] transition-colors">
          Home
        </Link>
        <Link href="/verify" className="text-sm font-medium text-[#FF8C42] border border-[#FF8C42]/20 px-4 py-1.5 rounded-full hover:bg-[#FF8C42]/10 transition-all">
          Verify
        </Link>
        <Link href="/#app" className="text-sm font-medium text-white bg-[#FF8C42] px-4 py-2 rounded-full hover:bg-[#ff7a1a] transition-colors shadow-md shadow-orange-200/30">
          Upload
        </Link>
      </nav>
    </header>
  );
}
