import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aegis — Secure Image Protection",
  description: "Protect your images from unauthorized manipulation with invisible steganographic protection.",
  metadataBase: new URL('https://aegis-10z0.onrender.com'),
  openGraph: {
    title: "Aegis — Secure Image Protection",
    description: "Protect your images from unauthorized AI manipulation. Invisible steganographic shields that survive metadata stripping.",
    siteName: "Aegis Shield",
  },
};

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
