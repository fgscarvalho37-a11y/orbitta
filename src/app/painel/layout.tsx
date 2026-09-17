import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  Orbit,
  Search,
} from "lucide-react";

import ClientSidebar from "@/components/dashboard/ClientSidebar";

type PainelLayoutProps = {
  children: ReactNode;
};

export default function PainelLayout({
  children,
}: PainelLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <ClientSidebar />

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-white/[0.06] bg-[#050914]/80 px-5 backdrop-blur-2xl sm:px-7 lg:px-10">
          {/* MOBILE */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/50"
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <Orbit size={20} className="text-cyan-300" />

              <span className="text-xs font-semibold tracking-[0.18em]">
                ORBITTA
              </span>
            </Link>
          </div>

          {/* DESKTOP SEARCH */}
          <div className="hidden max-w-[420px] flex-1 lg:block">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
              />

              <input
                type="search"
                placeholder="Buscar produtos, faturas, domínios..."
                className="h-10 w-full rounded-xl border border-white/[0.05] bg-white/[0.02] pl-11 pr-4 text-xs text-white/70 outline-none transition placeholder:text-white/18 focus:border-cyan-300/15 focus:bg-white/[0.03]"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-3 py-2 text-[10px] text-emerald-200/45 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Serviços operacionais
            </div>

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/35 transition hover:text-white/70"
              aria-label="Notificações"
            >
              <Bell size={16} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
            </button>

            <Link
              href="/painel/configuracoes"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 text-xs font-bold text-[#06101b]"
            >
              FG
            </Link>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}