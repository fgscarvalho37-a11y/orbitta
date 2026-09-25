"use client";

import { ArrowRight } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Header() {
  const { text } = useLanguage();

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-7 lg:px-12">
      <a href="#" className="group flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute h-9 w-9 rounded-full border border-violet-500/70 transition duration-300 group-hover:border-violet-400" />

          <div className="h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_28px_rgba(34,211,238,0.8)]" />
        </div>

        <div className="leading-none">
          <div className="text-sm font-semibold tracking-[0.22em]">
            ORBITTA
          </div>

          <div className="mt-1 text-[10px] tracking-[0.32em] text-white/40">
            SPACE
          </div>
        </div>
      </a>

      <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
        <a
          className="transition duration-200 hover:text-white"
          href="#produtos"
        >
          {text("Produtos", "Products")}
        </a>

        <span
          aria-disabled="true"
          className="flex cursor-not-allowed items-center gap-2 text-white/25"
          title={text("Disponível em breve", "Coming soon")}
        >
          {text("Soluções", "Solutions")}
          <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/20">
            {text("Em breve", "Coming soon")}
          </span>
        </span>

        <span
          aria-disabled="true"
          className="flex cursor-not-allowed items-center gap-2 text-white/25"
          title={text("Disponível em breve", "Coming soon")}
        >
          Orbitta
          <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/20">
            {text("Em breve", "Coming soon")}
          </span>
        </span>
      </nav>

      <div className="flex items-center gap-3">
        <LanguageSwitcher compact />

        <a
          href="/login"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium backdrop-blur-md transition duration-200 hover:border-white/20 hover:bg-white/[0.1]"
        >
          {text("Área do cliente", "Client area")}

          <ArrowRight
          size={15}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </a>
      </div>
    </header>
  );
}