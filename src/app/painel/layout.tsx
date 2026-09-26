"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Menu,
  Orbit,
  Search,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import ClientSidebar from "@/components/dashboard/ClientSidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";
import { resolveClientEntryDestination } from "@/lib/clientEntry";

const API_URL = "/backend";

type OrbittaUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: "CLIENT" | "ADMIN";
  active: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: OrbittaUser;
};

const AuthContext =
  createContext<AuthContextType | null>(null);

export function useOrbittaUser() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useOrbittaUser precisa ser usado dentro do PainelLayout."
    );
  }

  return context.user;
}

type PainelLayoutProps = {
  children: ReactNode;
};

export default function PainelLayout({
  children,
}: PainelLayoutProps) {
  const {
    text,
  } = useLanguage();

  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] =
    useState<OrbittaUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          if (!cancelled) {
            router.replace(
              `/login?returnUrl=${encodeURIComponent(
                pathname
              )}`
            );
          }

          return;
        }

        if (!response.ok) {
          throw new Error(
            text("Não foi possível validar sua sessão.", "We could not validate your session.")
          );
        }

        const data: OrbittaUser =
          await response.json();

        if (
          data.role === "ADMIN"
        ) {
          if (!cancelled) {
            router.replace(
              "/admin"
            );
          }

          return;
        }

        const destination =
          await resolveClientEntryDestination();

        if (
          destination !==
          "/painel"
        ) {
          if (!cancelled) {
            router.replace(
              destination
            );
          }

          return;
        }

        if (!cancelled) {
          setUser(data);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar sessão Orbitta:",
          error
        );

        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Erro durante logout:",
        error
      );
    } finally {
      setUser(null);

      router.replace("/login");
      router.refresh();

      setLoggingOut(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] text-white">
        <div className="flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full border border-cyan-300/10" />

            <div className="absolute inset-2 animate-spin rounded-full border border-white/[0.06] border-t-cyan-300/60" />

            <Orbit
              size={22}
              className="text-cyan-300"
            />
          </div>

          <div className="mt-6 text-xs font-medium tracking-[0.2em] text-white/35">
            ORBITTA
          </div>

          <div className="mt-2 text-[10px] text-white/20">
            {text("Carregando seu espaço...", "Loading your workspace...")}
          </div>
        </div>
      </div>
    );
  }

  const initials =
    `${user.firstName?.charAt(0) ?? ""}${
      user.lastName?.charAt(0) ?? ""
    }`.toUpperCase();

  return (
    <AuthContext.Provider value={{ user }}>
      <div className="min-h-screen bg-[#050914] text-white">
        <ClientSidebar />

        <div className="min-h-screen lg:pl-[260px]">
          <header className="sticky top-0 z-30 flex h-20 items-center border-b border-white/[0.06] bg-[#050914]/80 px-5 backdrop-blur-2xl sm:px-7 lg:px-10">
            {/* MOBILE */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/50"
                aria-label={text("Abrir menu", "Open menu")}
              >
                <Menu size={18} />
              </button>

              <Link
                href="/"
                className="flex items-center gap-2"
              >
                <Orbit
                  size={20}
                  className="text-cyan-300"
                />

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
                  placeholder={text("Buscar produtos, faturas, domínios...", "Search products, invoices, domains...")}
                  className="h-10 w-full rounded-xl border border-white/[0.05] bg-white/[0.02] pl-11 pr-4 text-xs text-white/70 outline-none transition placeholder:text-white/18 focus:border-cyan-300/15 focus:bg-white/[0.03]"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <LanguageSwitcher compact />

              <div className="hidden items-center gap-2 rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-3 py-2 text-[10px] text-emerald-200/45 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                {text("Serviços operacionais", "Services operational")}
              </div>

              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/35 transition hover:text-white/70"
                aria-label={text("Notificações", "Notifications")}
              >
                <Bell size={16} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
              </button>

              {/* USER */}
              <div className="group relative">
                <Link
                  href="/painel/configuracoes"
                  title={`${user.firstName} ${user.lastName}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 text-xs font-bold text-[#06101b]"
                >
                  {initials || "OR"}
                </Link>

                <div className="pointer-events-none absolute right-0 top-[calc(100%+10px)] w-56 translate-y-[-5px] rounded-2xl border border-white/[0.07] bg-[#08101d]/95 p-3 opacity-0 shadow-2xl backdrop-blur-2xl transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="px-2 py-2">
                    <div className="truncate text-xs font-medium text-white/70">
                      {user.firstName}{" "}
                      {user.lastName}
                    </div>

                    <div className="mt-1 truncate text-[10px] text-white/25">
                      {user.email}
                    </div>
                  </div>

                  <div className="my-2 h-px bg-white/[0.05]" />

                  <Link
                    href="/painel/configuracoes"
                    className="flex h-9 items-center rounded-xl px-2 text-xs text-white/35 transition hover:bg-white/[0.04] hover:text-white/70"
                  >
                    {text("Configurações", "Settings")}
                  </Link>

                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={handleLogout}
                    className="mt-1 flex h-9 w-full items-center gap-2 rounded-xl px-2 text-left text-xs text-red-200/40 transition hover:bg-red-300/[0.04] hover:text-red-200/70 disabled:cursor-wait disabled:opacity-40"
                  >
                    <LogOut size={14} />

                    {loggingOut
                      ? text("Saindo...", "Signing out...")
                      : text("Sair da conta", "Sign out")}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main>{children}</main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}