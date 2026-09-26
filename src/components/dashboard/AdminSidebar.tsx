"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Orbit,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

const navigation = [
  {
    name: "Visão geral",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
  {
    name: "Produtos",
    href: "/admin/produtos",
    icon: Boxes,
  },
  {
    name: "Faturas",
    href: "/admin/faturas",
    icon: ReceiptText,
  },
  {
    name: "Suporte",
    href: "/admin/suporte",
    icon: CircleHelp,
  },
];

const secondaryNavigation = [
  {
    name: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
];

const NAV_EN: Record<string, string> = {
  "Visão geral": "Overview",
  "Clientes": "Clients",
  "Produtos": "Products",
  "Faturas": "Invoices",
  "Suporte": "Support",
  "Configurações": "Settings",
};

export default function AdminSidebar() {
  const {
    text,
  } = useLanguage();

  const pathname = usePathname();

  function navText(
    value: string
  ) {
    return text(
      value,
      NAV_EN[value] ?? value
    );
  }

  const [collapsed, setCollapsed] =
    useState(false);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-40 hidden border-r border-white/[0.06] bg-[#050914]/95 backdrop-blur-xl transition-[width] duration-300 lg:flex lg:flex-col ${
        collapsed ? "w-[92px]" : "w-[260px]"
      }`}
    >
      {/* LOGO */}

      <div
        className={`flex h-20 items-center border-b border-white/[0.05] ${
          collapsed
            ? "justify-center px-4"
            : "px-6"
        }`}
      >
        <Link
          href="/admin"
          className="flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/[0.06] text-violet-200">
            <Orbit size={20} />

            <span className="absolute right-[5px] top-[5px] h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.8)]" />
          </div>

          {!collapsed && (
            <div>
              <div className="text-sm font-semibold tracking-[0.18em]">
                ORBITTA
              </div>

              <div className="mt-1 text-[8px] uppercase tracking-[0.35em] text-violet-200/35">
                Admin Space
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* MENU */}

      <div className="flex-1 overflow-y-auto px-3 py-6">
        {!collapsed && (
          <div className="mb-3 px-3 text-[9px] uppercase tracking-[0.25em] text-white/20">
            {text("Administração", "Administration")}
          </div>
        )}

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={navText(item.name)}
                href={item.href}
                title={
                  collapsed
                    ? navText(item.name)
                    : undefined
                }
                className={`group relative flex h-11 items-center rounded-xl transition ${
                  collapsed
                    ? "justify-center px-0"
                    : "gap-3 px-3"
                } ${
                  active
                    ? "bg-violet-300/[0.07] text-violet-100"
                    : "text-white/35 hover:bg-white/[0.035] hover:text-white/70"
                }`}
              >
                {active && (
                  <span className="absolute -left-3 h-5 w-[2px] rounded-r-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.7)]" />
                )}

                <Icon
                  size={17}
                  className={`shrink-0 ${
                    active
                      ? "text-violet-300"
                      : ""
                  }`}
                />

                {!collapsed && (
                  <span className="text-sm">
                    {navText(item.name)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="my-6 h-px bg-white/[0.05]" />

        {!collapsed && (
          <div className="mb-3 px-3 text-[9px] uppercase tracking-[0.25em] text-white/20">
            Sistema
          </div>
        )}

        <nav className="space-y-1">
          {secondaryNavigation.map(
            (item) => {
              const Icon = item.icon;
              const active = isActive(
                item.href
              );

              return (
                <Link
                  key={navText(item.name)}
                  href={item.href}
                  title={
                    collapsed
                      ? item.name
                      : undefined
                  }
                  className={`group relative flex h-11 items-center rounded-xl transition ${
                    collapsed
                      ? "justify-center"
                      : "gap-3 px-3"
                  } ${
                    active
                      ? "bg-violet-300/[0.07] text-violet-100"
                      : "text-white/35 hover:bg-white/[0.035] hover:text-white/70"
                  }`}
                >
                  {active && (
                    <span className="absolute -left-3 h-5 w-[2px] rounded-r-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.7)]" />
                  )}

                  <Icon
                    size={17}
                    className={`shrink-0 ${
                      active
                        ? "text-violet-300"
                        : ""
                    }`}
                  />

                  {!collapsed && (
                    <span className="text-sm">
                      {navText(item.name)}
                    </span>
                  )}
                </Link>
              );
            }
          )}
        </nav>

        {/* ADMIN INDICATOR */}

        {!collapsed && (
          <div className="mt-7 rounded-2xl border border-violet-300/[0.07] bg-violet-300/[0.025] p-4">
            <div className="flex items-center gap-2 text-[10px] text-violet-200/50">
              <ShieldCheck size={13} />

              {text("Área administrativa", "Admin area")}
            </div>

            <p className="mt-2 text-[9px] leading-4 text-white/20">
              {text(
                "Gerenciamento interno da plataforma Orbitta.",
                "Internal management of the Orbitta platform."
              )}
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="border-t border-white/[0.05] p-3">
        {!collapsed && (
          <div className="mb-3">
            <LanguageSwitcher compact />
          </div>
        )}
        {!collapsed && (
          <div className="mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-cyan-300 text-xs font-bold text-[#06101b]">
                OA
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-white/75">
                  Orbitta Admin
                </div>

                <div className="mt-0.5 truncate text-[10px] text-violet-200/30">
                  {text("Administrador", "Administrator")}
                </div>
              </div>

              <Link
                href="/admin/configuracoes"
                className="text-white/20 transition hover:text-white/60"
                title={text("Configurações", "Settings")}
              >
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        )}

        <Link
          href="/"
          title={
            collapsed
              ? text("Voltar ao site", "Back to website")
              : undefined
          }
          className={`mb-1 flex h-10 items-center rounded-xl text-white/25 transition hover:bg-white/[0.035] hover:text-white/60 ${
            collapsed
              ? "justify-center"
              : "gap-3 px-3"
          }`}
        >
          <FileText size={16} />

          {!collapsed && (
            <span className="text-xs">
              {text("Voltar ao site", "Back to website")}
            </span>
          )}
        </Link>

        <Link
          href="/login"
          title={
            collapsed ? text("Sair", "Sign out") : undefined
          }
          className={`flex h-10 items-center rounded-xl text-white/25 transition hover:bg-red-400/[0.04] hover:text-red-200/60 ${
            collapsed
              ? "justify-center"
              : "gap-3 px-3"
          }`}
        >
          <LogOut size={16} />

          {!collapsed && (
            <span className="text-xs">
              Sair
            </span>
          )}
        </Link>
      </div>

      {/* COLLAPSE */}

      <button
        type="button"
        onClick={() =>
          setCollapsed(
            (value) => !value
          )
        }
        className="absolute -right-3 top-[94px] flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a111e] text-white/35 shadow-xl transition hover:border-violet-300/20 hover:text-violet-200"
        aria-label={
          collapsed
            ? "Expandir menu"
            : "Recolher menu"
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