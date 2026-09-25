"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle, AlertCircle, ArrowLeft } from "lucide-react";

const API_URL = "/backend";

type CsrfResponse = {
  token: string;
  headerName: string;
};

type CheckoutResponse = {
  id: number;
};

async function readMessage(response: Response) {
  const text = await response.text();

  if (!text) {
    return "Não foi possível iniciar a contratação.";
  }

  try {
    const data = JSON.parse(text);
    return data?.message ?? data?.error ?? text;
  } catch {
    return text;
  }
}

export default function CheckoutStartPage() {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) {
      return;
    }

    started.current = true;

    async function startCheckout() {
      try {
        const params = new URLSearchParams(window.location.search);
        const planId = Number(params.get("planId"));

        if (!Number.isInteger(planId) || planId <= 0) {
          throw new Error("Plano inválido.");
        }

        const currentPath =
          `/checkout/start?planId=${planId}`;

        const meResponse = await fetch(
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
          meResponse.status === 401 ||
          meResponse.status === 403
        ) {
          window.location.replace(
            `/login?returnUrl=${encodeURIComponent(currentPath)}`
          );
          return;
        }

        if (!meResponse.ok) {
          throw new Error(
            "Não foi possível validar sua sessão."
          );
        }

        const csrfResponse = await fetch(
          `${API_URL}/api/csrf`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!csrfResponse.ok) {
          throw new Error(
            "Não foi possível preparar a contratação."
          );
        }

        const csrf: CsrfResponse =
          await csrfResponse.json();

        const checkoutResponse = await fetch(
          `${API_URL}/api/checkout/subscriptions`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              [csrf.headerName]: csrf.token,
            },
            body: JSON.stringify({
              planId,
            }),
          }
        );

        if (
          checkoutResponse.status === 401 ||
          checkoutResponse.status === 403
        ) {
          window.location.replace(
            `/login?returnUrl=${encodeURIComponent(currentPath)}`
          );
          return;
        }

        if (!checkoutResponse.ok) {
          throw new Error(
            await readMessage(checkoutResponse)
          );
        }

        const checkout: CheckoutResponse =
          await checkoutResponse.json();

        window.location.replace(
          `/checkout/${checkout.id}`
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível iniciar a contratação."
        );
      }
    }

    startCheckout();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050914] px-6 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/[0.08] bg-[#08101d] p-8 text-center">
        {error ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/10 bg-red-300/[0.04] text-red-200/70">
              <AlertCircle size={20} />
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Não foi possível continuar
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/40">
              {error}
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 text-sm text-cyan-200/70 hover:text-cyan-100"
            >
              <ArrowLeft size={15} />
              Voltar para Orbitta
            </Link>
          </>
        ) : (
          <>
            <LoaderCircle
              size={30}
              className="mx-auto animate-spin text-cyan-300/70"
            />

            <h1 className="mt-5 text-xl font-semibold">
              Preparando seu checkout
            </h1>

            <p className="mt-3 text-sm text-white/35">
              Você será levado diretamente para a contratação.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
