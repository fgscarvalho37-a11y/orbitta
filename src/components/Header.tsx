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
          className="font-medium text-white/80 transition duration-200 hover:text-white"
          href="/produtos/pizzasystem"
        >
          PizzaSystem
        </a>

        <a
          className="transition duration-200 hover:text-white"
          href="/produtos/pizzasystem#planos"
        >
          {text("Planos", "Pricing")}
        </a>

        <a
          className="transition duration-200 hover:text-white"
          href="/produtos/condoflow"
        >
          CondoFlow
        </a>

        <a
          className="transition duration-200 hover:text-white"
          href="/produtos"
        >
          {text("Produtos", "Products")}
        </a>

        <a
          className="transition duration-200 hover:text-white"
          href="/sites-avulsos"
        >
          {text("Sites avulsos", "Standalone Sites")}
        </a>

        <a
          className="transition duration-200 hover:text-white"
          href="/landing-page"
        >
          {text("Landing Pages", "Landing Pages")}
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <LanguageSwitcher compact />

        <a
          href="/produtos/pizzasystem#planos"
          className="hidden rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50 sm:inline-flex"
        >
          {text("Ver planos", "View pricing")}
        </a>

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