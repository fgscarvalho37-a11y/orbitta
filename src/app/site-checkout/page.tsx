"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CreditCard, Loader2, ShieldCheck, Wallet } from "lucide-react";
import Header from "@/components/Header";
import { secureFetch } from "@/lib/secureFetch";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCommercialSettings } from "@/hooks/useCommercialSettings";

const currencyForMarket = (market: string) =>
  market === "BR" ? "BRL" : market === "GB" ? "GBP" :
  market === "AU" ? "AUD" : market === "EU" ? "EUR" : "USD";
const money = (amount: number, locale: string, currency: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);

export default function WebsiteSubscriptionPage() {
  const { locale, text, market } = useLanguage();
  const currency = currencyForMarket(market);
  const { standaloneSiteMonthlyPriceUsd, bundleMonthlyPriceUsd } = useCommercialSettings();
  const [isBundle, setIsBundle] = useState(false);
  const monthly = Number(isBundle ? bundleMonthlyPriceUsd : standaloneSiteMonthlyPriceUsd) || 0;
  const enabled = monthly > 0;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsBundle(new URLSearchParams(window.location.search).get("plan") === "bundle");
  }, []);

  async function beginCheckout() {
    if (!enabled || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/backend/api/auth/me", {
        credentials: "include", cache: "no-store",
      });
      if (response.status === 401 || response.status === 403) {
        window.location.assign("/login?returnUrl=" +
          encodeURIComponent(isBundle ? "/site-checkout?plan=bundle" : "/site-checkout"));
        return;
      }
      if (!response.ok) throw new Error(text("Não foi possível validar sua conta.", "Could not verify your account."));

      const checkoutResponse = await secureFetch(
        isBundle ? "/backend/api/bundle-checkouts" : "/backend/api/site-checkouts",
        { method: "POST", credentials: "include", headers: { Accept: "application/json", "Content-Type":"application/json" }, body: JSON.stringify({ market }) }
      );
      if (!checkoutResponse.ok) {
        const detail = await checkoutResponse.json().catch(() => null);
        throw new Error(detail?.message ?? text("Não foi possível preparar a assinatura.", "Could not start subscription."));
      }
      const checkout: { id: number } = await checkoutResponse.json();
      window.location.assign(`/checkout/${checkout.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text("Erro ao iniciar o pagamento.", "Payment could not be started."));
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <Header />
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-16">
        <Link href="/#planos" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80">
          <ArrowLeft size={15} /> {text("Voltar aos três planos", "Back to the three plans")}
        </Link>
        <div className="mt-12 rounded-[32px] border border-cyan-300/15 bg-[#0b1423] p-7 shadow-[0_20px_90px_rgba(34,211,238,0.06)] sm:p-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-200/70">
            <Wallet size={17} /> Orbitta
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
            {isBundle ? text("Site + PizzaSystem", "Website + PizzaSystem") : text("Plano de site", "Website plan")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
            {text("Uma assinatura mensal, sem taxa inicial. Após a confirmação da primeira mensalidade, você preenche o briefing e fala diretamente com a Orbitta no chat privado.",
              "A monthly subscription with no setup fee. Once your first payment is approved, submit your brief and speak directly with Orbitta in your private chat.")}
          </p>
          <div className="mt-9 rounded-2xl border border-white/10 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <span className="text-sm text-white/60">{text("Mensalidade", "Monthly subscription")}</span>
              <strong className="text-3xl font-semibold text-cyan-100">
                {enabled ? money(monthly, locale, currency) : text("Em configuração", "Not yet available")}
                {enabled && <span className="ml-1 text-sm font-normal text-white/45">{text("/ mês", "/ month")}</span>}
              </strong>
            </div>
            <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-6 text-white/45">
              {text("Sem implantação e sem pagamento avulso. O preço mensal é fixado na moeda do país escolhido; a cobrança no Mercado Pago é apresentada em BRL quando aplicável.",
                "No setup fee or one-time charge. The monthly price uses your selected market currency; Mercado Pago presents settlement in BRL when applicable.")}
            </p>
          </div>
          {!enabled && <p className="mt-5 text-sm text-amber-100/70">
            {text("O administrador precisa definir a mensalidade deste plano antes de liberar a compra.",
              "The administrator must set this plan's monthly price before checkout is enabled.")}
          </p>}
          {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
          <button type="button" onClick={() => void beginCheckout()} disabled={!enabled || loading}
            className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-cyan-200 px-5 py-3 text-sm font-semibold text-[#07101c] disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
            {loading ? text("Preparando...", "Preparing...") : text("Assinar e ir para o checkout", "Subscribe and continue to checkout")}
            {!loading && <ArrowRight size={17} />}
          </button>
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-white/35">
            <ShieldCheck size={14} />
            {text("O briefing e o chat são liberados somente após pagamento confirmado.", "Your brief and chat unlock only after payment is approved.")}
          </p>
        </div>
      </section>
    </main>
  );
}
