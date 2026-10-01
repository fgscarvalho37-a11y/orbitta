"use client";

import { Cookie, Settings2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Consent = "essential" | "all";

const COOKIE_NAME = "orbitta_cookie_consent";
const MAX_AGE = 60 * 60 * 24 * 180;

function readConsent(): Consent | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((item) =>
      item.startsWith(`${COOKIE_NAME}=`)
    );

  const value = match?.split("=")[1];

  return value === "essential" ||
    value === "all"
    ? value
    : null;
}

function saveConsent(value: Consent) {
  document.cookie =
    `${COOKIE_NAME}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax; Secure`;

  window.dispatchEvent(
    new CustomEvent("orbitta-cookie-consent", {
      detail: value,
    })
  );
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    setVisible(!readConsent());
  }, []);

  if (!visible) {
    return null;
  }

  function choose(value: Consent) {
    saveConsent(value);
    setVisible(false);
  }

  return (
    <aside
      aria-label="Preferências de cookies"
      className="fixed inset-x-4 bottom-4 z-[200] mx-auto max-w-3xl rounded-[24px] border border-white/[0.1] bg-[#08101d]/95 p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] text-cyan-200/65">
          <Cookie size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">
                Cookies e privacidade
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/42">
                A Orbitta usa cookies essenciais para login, sessão e segurança.
                Cookies opcionais de medição só podem ser ativados com sua escolha.
              </p>
            </div>

            <button
              type="button"
              onClick={() => choose("essential")}
              aria-label="Fechar e manter somente cookies essenciais"
              className="text-white/30 transition hover:text-white/70"
            >
              <X size={16} />
            </button>
          </div>

          {details && (
            <div className="mt-4 grid gap-2 text-[11px] leading-5 text-white/38 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <strong className="text-white/65">
                  Essenciais
                </strong>
                <p className="mt-1">
                  Autenticação, sessão, segurança e preferências básicas. Sempre ativos.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <strong className="text-white/65">
                  Medição opcional
                </strong>
                <p className="mt-1">
                  Reservado para analytics e métricas quando houver integração e consentimento.
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => choose("essential")}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              Somente essenciais
            </button>

            <button
              type="button"
              onClick={() => choose("all")}
              className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50"
            >
              Aceitar opcionais
            </button>

            <button
              type="button"
              onClick={() => setDetails((value) => !value)}
              className="ml-auto flex items-center gap-2 px-2 py-2 text-[11px] text-white/35 transition hover:text-white/70"
            >
              <Settings2 size={13} />
              {details ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
          </div>

          <p className="mt-3 text-[10px] text-white/24">
            Consulte a{" "}
            <Link
              href="/privacidade"
              className="underline underline-offset-2 transition hover:text-white/60"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </aside>
  );
}
