import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 mt-auto relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="transform origin-left scale-90">
                <Logo />
            </div>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              AI-powered image protection platform. Safeguard your images from
              unauthorized manipulation with metadata embedding and watermarking.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-200">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/ibraheem/PicProtect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#FF8C42] transition-colors"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-200">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                 <span className="text-slate-500 cursor-not-allowed">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-xs text-slate-500 text-center max-w-2xl mx-auto mb-4">
            <strong>Disclaimer:</strong> Aegis provides technical measures to help
            protect your images, but no solution is 100% foolproof. Always be mindful
            of what you share online.
          </p>
            <p className="text-xs text-slate-600 text-center">
            © {new Date().getFullYear()} Aegis. Image Protection Toolkit.
          </p>
        </div>
      </div>
    </footer>
  );
}

