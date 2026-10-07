"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Home() {
  const { text } = useLanguage();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050914] text-white">
      <Header />
      <Hero />
      <ProductShowcase />

      <footer className="border-t border-white/[0.06] px-6 py-8 text-xs text-white/25">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Orbitta Space</span>

          <div className="flex gap-5">
            <Link
              href="/termos"
              className="transition hover:text-white/60"
            >
              {text("Termos de Uso", "Terms of Use")}
            </Link>

            <Link
              href="/privacidade"
              className="transition hover:text-white/60"
            >
              {text("Privacidade", "Privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}