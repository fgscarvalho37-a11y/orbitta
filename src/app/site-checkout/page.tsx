"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CreditCard, Loader2, ShieldCheck, Wallet } from "lucide-react";
import Header from "@/components/Header";
import { secureFetch } from "@/lib/secureFetch";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCommercialSettings } from "@/hooks/useCommercialSettings";

const money = (n: number, locale: string) => new Intl.NumberFormat(locale, {
  style: "currency", currency: "USD",
}).format(n);

export default function StandaloneSiteCheckoutStart() {
  const { locale, text } = useLanguage();
  const { standaloneSitePriceUsd, standaloneSiteMonthlyPriceUsd } = useCommercialSettings();
  const setup = Number(standaloneSitePriceUsd ?? 0);
  const monthly = Number(standaloneSiteMonthlyPriceUsd ?? 0);
  const ready = setup > 0 || monthly > 0;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function beginCheckout() {
    if (!ready || loading) return;
    setLoading(true);
    setError("");
    try {
      const session = await fetch("/backend/api/auth/me", {
        credentials: "include", cache: "no-store",
      });
      if (session.status === 401 || session.status === 403) {
        window.location.assign("/login?returnUrl=" + encodeURIComponent("/site-checkout"));
        return;
      }
      if (!session.ok) throw new Error(text("Não foi possível validar seu login.", "Could not verify your account."));
      const response = await secureFetch("/backend/api/site-checkouts", {
        method: "POST", credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (response.status === 401 || response.status === 403) {
        window.location.assign("/login?returnUrl=" + encodeURIComponent("/site-checkout"));
        return;
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? text("Não foi possível preparar o checkout.", "Could not start checkout."));
      }
      const checkout: { id: number } = await response.json();
      window.location.assign(`/checkout/${checkout.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text("Falha ao iniciar a compra.", "Checkout could not be started."));
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <Header />
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-16">
        <Link href="/#planos" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80">
          <ArrowLeft size={15} />{text("Voltar aos planos", "Back to plans")}
        </Link>
        <div className="mt-12 rounded-[32px] border border-cyan-300/15 bg-[#0b1423] p-7 shadow-[0_20px_90px_rgba(34,211,238,0.06)] sm:p-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-200/70">
            <Wallet size={17} /> Orbitta Sites
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            {text("Contratar meu site", "Order my website")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
            {text("Você paga primeiro. Assim que o pagamento for aprovado, preenche o briefing e conversa diretamente com a equipe Orbitta para acompanhar e receber seu site.",
              "Pay first. Once payment is approved, complete your website brief and message Orbitta directly to track and receive your site.")}
          </p>
          <div className="mt-9 space-y-4 rounded-2xl border border-white/10 p-5">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-white/60">{text("Implantação configurada", "Configured setup fee")}</span>
              <span className="font-semibold">{money(setup, locale)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-white/60">{text("Mensalidade configurada", "Configured monthly charge")}</span>
              <span className="font-semibold">{money(monthly, locale)}{monthly > 0 ? text(" / mês", " / month") : ""}</span>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-white/70">{text("Primeiro pagamento", "First payment")}</span>
                <strong className="text-2xl text-cyan-100">{money(setup + monthly, locale)}</strong>
              </div>
              <p className="mt-3 text-xs text-white/40">
                {text("Valores exibidos em USD; o checkout confirma o valor convertido para BRL pelo provedor. Renovações seguem a modalidade configurada.",
                  "Prices displayed in USD; the checkout confirms the BRL converted charge. Renewals depend on the configured billing model.")}
              </p>
            </div>
          </div>
          {!ready && (
            <p className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-sm text-amber-100/70">
              {text("A contratação estará disponível quando a Orbitta configurar os valores.", "Ordering will open when Orbitta configures website pricing.")}
            </p>
          )}
          {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
          <button type="button" onClick={() => void beginCheckout()} disabled={!ready || loading}
            className="mt-7 flex h-13 w-full items-center justify-center gap-3 rounded-full bg-cyan-200 px-5 font-semibold text-[#07101c] disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? <Loader2 className="animate-spin" size={17} /> : <CreditCard size={17} />}
            {loading ? text("Preparando...", "Preparing...") : text("Continuar ao pagamento", "Continue to payment")}
            {!loading && <ArrowRight size={17} />}
          </button>
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-white/35">
            <ShieldCheck size={14} /> {text("Checkout seguro. O formulário e o chat são privados e liberados após aprovação.", "Secure checkout. Your project brief and chat are private and available after approval.")}
          </p>
        </div>
      </section>
    </main>
  );
}
