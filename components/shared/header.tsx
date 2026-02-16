import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { Github } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 glass border-b-0">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-90">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              href="https://github.com/ibraheem/PicProtect"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
              target="_blank"
            >
              <Github className="w-5 h-5 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

