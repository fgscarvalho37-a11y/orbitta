"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Globe2,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

const API_URL = "/backend";

type GatewayStatus = {
  provider: string;
  displayName: string;
  configured: boolean;
  webhookReady: boolean;
  scope: string;
};

type PaymentStatusResponse = {
  mercadoPago: GatewayStatus;
  stripe: GatewayStatus;
  supportedCurrencies: string[];
  routingRule: string;
};

function StatusPill({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <span
      className={
        ok
          ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-300/10 bg-emerald-300/[0.05] px-2.5 py-1 text-[10px] text-emerald-100/70"
          : "inline-flex items-center gap-1.5 rounded-full border border-amber-300/10 bg-amber-300/[0.05] px-2.5 py-1 text-[10px] text-amber-100/70"
      }
    >
      {ok ? (
        <CheckCircle2 size={11} />
      ) : (
        <AlertTriangle size={11} />
      )}
      {label}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const { text } = useLanguage();

  const [data, setData] =
    useState<PaymentStatusResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (manual = false) => {
      try {
        manual
          ? setRefreshing(true)
          : setLoading(true);

        setError("");

        const response = await fetch(
          `${API_URL}/api/admin/payments/status`,
          {
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
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(
            text(
              "Não foi possível carregar o status dos pagamentos.",
              "Could not load payment status."
            )
          );
        }

        setData(await response.json());
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : text(
                "Não foi possível carregar os pagamentos.",
                "Could not load payments."
              )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [text]
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw
          size={22}
          className="animate-spin text-violet-200/50"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-violet-200/35">
              <WalletCards size={13} />
              {text("Cobranças Orbitta", "Orbitta billing")}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {text("Pagamentos", "Payments")}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/30">
              {text(
                "Acompanhe os gateways usados nas assinaturas e edite os preços internacionais do catálogo.",
                "Monitor subscription gateways and edit international catalog pricing."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            {text("Atualizar", "Refresh")}
          </button>
        </header>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-5 py-4 text-xs text-red-100/70">
            {error}
          </div>
        ) : null}

        {data ? (
          <>
            <section className="mt-8 grid gap-5 xl:grid-cols-2">
              <article className="rounded-[28px] border border-white/[0.06] bg-[#08101d] p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] text-cyan-200/60">
                    <CreditCard size={19} />
                  </div>

                  <StatusPill
                    ok={
                      data.mercadoPago
                        .configured
                    }
                    label={
                      data.mercadoPago
                        .configured
                        ? text(
                            "Configurado",
                            "Configured"
                          )
                        : text(
                            "Falta configurar",
                            "Setup required"
                          )
                    }
                  />
                </div>

                <h2 className="mt-6 text-xl font-semibold text-white/85">
                  Mercado Pago
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/30">
                  {text(
                    "Gateway principal para assinaturas cobradas em BRL.",
                    "Primary gateway for subscriptions billed in BRL."
                  )}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    label={text(
                      "Abrangência",
                      "Scope"
                    )}
                    value={
                      data.mercadoPago.scope
                    }
                  />

                  <InfoBox
                    label={text(
                      "Roteamento",
                      "Routing"
                    )}
                    value="BRL"
                  />
                </div>
              </article>

              <article className="rounded-[28px] border border-violet-300/[0.08] bg-[#08101d] p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-300/[0.04] text-violet-200/65">
                    <Globe2 size={19} />
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <StatusPill
                      ok={
                        data.stripe.configured
                      }
                      label={
                        data.stripe.configured
                          ? text(
                              "API configurada",
                              "API configured"
                            )
                          : text(
                              "Falta API",
                              "API required"
                            )
                      }
                    />

                    <StatusPill
                      ok={
                        data.stripe
                          .webhookReady
                      }
                      label={
                        data.stripe
                          .webhookReady
                          ? "Webhook OK"
                          : text(
                              "Falta webhook",
                              "Webhook required"
                            )
                      }
                    />
                  </div>
                </div>

                <h2 className="mt-6 text-xl font-semibold text-white/85">
                  Stripe
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/30">
                  {text(
                    "Gateway das assinaturas internacionais do Orbitta.",
                    "Gateway for Orbitta international subscriptions."
                  )}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    label={text(
                      "Abrangência",
                      "Scope"
                    )}
                    value={data.stripe.scope}
                  />

                  <InfoBox
                    label={text(
                      "Roteamento",
                      "Routing"
                    )}
                    value={text(
                      "Moedas diferentes de BRL",
                      "Currencies other than BRL"
                    )}
                  />
                </div>
              </article>
            </section>

            <section className="mt-5 rounded-[28px] border border-white/[0.06] bg-[#08101d] p-6 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/25">
                    <CircleDollarSign
                      size={13}
                    />
                    {text(
                      "Preços internacionais",
                      "International pricing"
                    )}
                  </div>

                  <h2 className="mt-3 text-xl font-semibold text-white/85">
                    {text(
                      "Edite tudo pelo catálogo",
                      "Edit everything from the catalog"
                    )}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/30">
                    {text(
                      "Cada plano pode ter sua própria moeda, mensalidade e taxa inicial. BRL vai para Mercado Pago; USD, EUR, GBP, CAD e outras moedas vão para Stripe.",
                      "Each plan can have its own currency, monthly price and setup fee. BRL routes to Mercado Pago; USD, EUR, GBP, CAD and other currencies route to Stripe."
                    )}
                  </p>
                </div>

                <Link
                  href="/admin/produtos"
                  className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50"
                >
                  {text(
                    "Editar produtos e preços",
                    "Edit products and prices"
                  )}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {data.supportedCurrencies.map(
                  (currency) => (
                    <span
                      key={currency}
                      className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium tracking-[0.08em] text-white/45"
                    >
                      {currency}
                    </span>
                  )
                )}
              </div>
            </section>

            <section className="mt-5 rounded-[24px] border border-emerald-300/[0.07] bg-emerald-300/[0.025] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-200/55"
                />

                <p className="text-xs leading-6 text-white/30">
                  {text(
                    "As chaves secretas não aparecem no painel. Aqui você vê apenas se cada integração está configurada. As credenciais continuam protegidas no servidor.",
                    "Secret keys are never shown in the dashboard. This page only reports whether each integration is configured; credentials remain protected on the server."
                  )}
                </p>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.018] px-4 py-3">
      <div className="text-[9px] uppercase tracking-[0.15em] text-white/18">
        {label}
      </div>
      <div className="mt-1.5 text-xs text-white/55">
        {value}
      </div>
    </div>
  );
}
