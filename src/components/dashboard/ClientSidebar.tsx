"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LogOut,
  Orbit,
  ReceiptText,
  Settings,
  WalletCards,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Visão geral",
    href: "/painel",
    icon: LayoutDashboard,
  },
  {
    name: "Meus produtos",
    href: "/painel/produtos",
    icon: Boxes,
  },
  {
    name: "Assinaturas",
    href: "/painel/assinaturas",
    icon: WalletCards,
  },
  {
    name: "Pagamentos",
    href: "/painel/pagamentos",
    icon: CreditCard,
  },
  {
    name: "Faturas",
    href: "/painel/faturas",
    icon: ReceiptText,
  },
  {
    name: "Domínios",
    href: "/painel/dominios",
    icon: Globe2,
  },
];

const secondaryNavigation = [
  {
    name: "Suporte",
    href: "/painel/suporte",
    icon: CircleHelp,
  },
  {
    name: "Configurações",
    href: "/painel/configuracoes",
    icon: Settings,
  },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    if (href === "/painel") {
      return pathname === "/painel";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-40 hidden border-r border-white/[0.06] bg-[#050914]/95 backdrop-blur-xl transition-[width] duration-300 lg:flex lg:flex-col ${
        collapsed ? "w-[92px]" : "w-[260px]"
      }`}
    >
      <div
        className={`flex h-20 items-center border-b border-white/[0.05] ${
          collapsed ? "justify-center px-4" : "px-6"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200">
            <Orbit size={20} />

            <span className="absolute right-[5px] top-[5px] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
          </div>

          {!collapsed && (
            <div>
              <div className="text-sm font-semibold tracking-[0.18em]">
                ORBITTA
              </div>

              <div className="mt-1 text-[8px] uppercase tracking-[0.35em] text-white/25">
                Client Space
              </div>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        {!collapsed && (
          <div className="mb-3 px-3 text-[9px] uppercase tracking-[0.25em] text-white/20">
            Workspace
          </div>
        )}

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group relative flex h-11 items-center rounded-xl transition ${
                  collapsed
                    ? "justify-center px-0"
                    : "gap-3 px-3"
                } ${
                  active
                    ? "bg-cyan-300/[0.07] text-cyan-100"
                    : "text-white/35 hover:bg-white/[0.035] hover:text-white/70"
                }`}
              >
                {active && (
                  <span className="absolute -left-3 h-5 w-[2px] rounded-r-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" />
                )}

                <Icon
                  size={17}
                  className={`shrink-0 ${
                    active ? "text-cyan-300" : ""
                  }`}
                />

                {!collapsed && (
                  <span className="text-sm">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="my-6 h-px bg-white/[0.05]" />

        {!collapsed && (
          <div className="mb-3 px-3 text-[9px] uppercase tracking-[0.25em] text-white/20">
            Conta
          </div>
        )}

        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group relative flex h-11 items-center rounded-xl transition ${
                  collapsed
                    ? "justify-center"
                    : "gap-3 px-3"
                } ${
                  active
                    ? "bg-cyan-300/[0.07] text-cyan-100"
                    : "text-white/35 hover:bg-white/[0.035] hover:text-white/70"
                }`}
              >
                <Icon
                  size={17}
                  className={`shrink-0 ${
                    active ? "text-cyan-300" : ""
                  }`}
                />

                {!collapsed && (
                  <span className="text-sm">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/[0.05] p-3">
        {!collapsed && (
          <div className="mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 text-xs font-bold text-[#06101b]">
                FG
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-white/75">
                  Felipe
                </div>

                <div className="mt-0.5 truncate text-[10px] text-white/25">
                  Cliente Orbitta
                </div>
              </div>

              <Link
                href="/painel/configuracoes"
                className="text-white/20 transition hover:text-white/60"
              >
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        )}

        <Link
          href="/login"
          title={collapsed ? "Sair" : undefined}
          className={`flex h-10 items-center rounded-xl text-white/25 transition hover:bg-red-400/[0.04] hover:text-red-200/60 ${
            collapsed
              ? "justify-center"
              : "gap-3 px-3"
          }`}
        >
          <LogOut size={16} />

          {!collapsed && <span className="text-xs">Sair</span>}
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute -right-3 top-[94px] flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a111e] text-white/35 shadow-xl transition hover:border-cyan-300/20 hover:text-cyan-200"
        aria-label={
          collapsed ? "Expandir menu" : "Recolher menu"
        }
      >
        {collapsed ? (
          <ChevronRight size={13} />
        ) : (
          <ChevronLeft size={13} />
        )}
      </button>
    </aside>
  );
}