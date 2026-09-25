"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: "CLIENT" | "ADMIN";
  active: boolean;
  createdAt: string;
};

type AdminLayoutProps = {
  children: ReactNode;
};

const API_URL = "/backend";

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function validateAdmin() {
      try {
        setLoading(true);
        setAccessDenied(false);
        setValidationError("");

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Erro ao validar sessão: ${response.status}`
          );
        }

        const user: User =
          await response.json();

        if (cancelled) {
          return;
        }

        if (
          user.role !== "ADMIN"
        ) {
          setAuthorized(false);
          setAccessDenied(false);
          router.replace(
            "/painel"
          );
          return;
        }

        if (!user.active) {
          setAuthorized(false);
          setAccessDenied(true);
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error(
          "Erro ao validar administrador:",
          error
        );

        if (!cancelled) {
          setAuthorized(false);
          setAccessDenied(false);
          setValidationError(
            "Não foi possível validar sua sessão agora. O servidor pode estar iniciando; tente novamente."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    validateAdmin();

    return () => {
      cancelled = true;
    };
  }, [router, retryVersion]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/[0.08] bg-violet-300/[0.03]">
            <Loader2
              size={20}
              className="animate-spin text-violet-200/60"
            />
          </div>

          <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Validando acesso administrativo
          </div>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] px-5 text-white">
        <div className="w-full max-w-md rounded-[28px] border border-amber-300/[0.08] bg-[#08101d] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/[0.10] bg-amber-300/[0.04] text-amber-200/60">
            <ShieldAlert size={23} />
          </div>

          <h1 className="mt-6 text-xl font-semibold tracking-[-0.03em]">
            Falha temporária de conexão
          </h1>

          <p className="mt-3 text-xs leading-6 text-white/30">
            {validationError}
          </p>

          <button
            type="button"
            onClick={() =>
              setRetryVersion(
                (current) =>
                  current + 1
              )
            }
            className="mt-7 h-11 w-full rounded-xl bg-white text-xs font-semibold text-[#07101c] transition hover:bg-violet-50"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050914] px-5 text-white">
        <div className="w-full max-w-md rounded-[28px] border border-red-300/[0.07] bg-[#08101d] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] text-red-200/50">
            <ShieldAlert size={23} />
          </div>

          <h1 className="mt-6 text-xl font-semibold tracking-[-0.03em]">
            Acesso restrito
          </h1>

          <p className="mt-3 text-xs leading-6 text-white/30">
            Esta área é exclusiva para administradores
            da Orbitta.
          </p>

          <button
            type="button"
            onClick={() =>
              router.replace("/painel")
            }
            className="mt-7 h-11 w-full rounded-xl bg-white text-xs font-semibold text-[#07101c] transition hover:bg-violet-50"
          >
            Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <AdminSidebar />

      <main className="min-h-screen lg:pl-[260px]">
        {children}
      </main>
    </div>
  );
}