"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  Clock3,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  Package,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

const API_URL = "/backend";

const TERMS_VERSION =
  "2026-09-24";

type CheckoutStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

type SubscriptionCheckout = {
  id: number;
  productId: number;
  planId: number;
  productName: string;
  planName: string;
  monthlyPrice: number;
  setupPrice: number;
  totalPrice: number;
  currency: string;
  status: CheckoutStatus;
  paymentProvider: string | null;
  externalReference: string | null;
  termsAcceptedAt: string | null;
  termsVersion: string | null;
  expiresAt: string;
  createdAt: string;
};

type CheckoutPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  }).format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusInfo(status: CheckoutStatus) {
  switch (status) {
    case "PENDING":
      return {
        label: "Aguardando pagamento",
        className:
          "border-amber-300/10 bg-amber-300/[0.05] text-amber-200/70",
      };

    case "PAYMENT_PENDING":
      return {
        label: "Pagamento em processamento",
        className:
          "border-blue-300/10 bg-blue-300/[0.05] text-blue-200/70",
      };

    case "APPROVED":
      return {
        label: "Pagamento aprovado",
        className:
          "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200/70",
      };

    case "REJECTED":
      return {
        label: "Pagamento recusado",
        className:
          "border-red-300/10 bg-red-300/[0.05] text-red-200/70",
      };

    case "CANCELLED":
      return {
        label: "Checkout cancelado",
        className:
          "border-white/10 bg-white/[0.04] text-white/50",
      };

    case "EXPIRED":
      return {
        label: "Checkout expirado",
        className:
          "border-red-300/10 bg-red-300/[0.05] text-red-200/70",
      };

    default:
      return {
        label: status,
        className:
          "border-white/10 bg-white/[0.04] text-white/50",
      };
  }
}

export default function CheckoutPage({
  params,
}: CheckoutPageProps) {
  const { id } = use(params);

  const [checkout, setCheckout] =
    useState<SubscriptionCheckout | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function loadCheckout() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/checkout/subscriptions/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = `/login?returnUrl=${encodeURIComponent(
          `/checkout/${id}`
        )}`;
        return;
      }

      if (response.status === 404) {
        setCheckout(null);
        setError(
          "Este checkout não existe ou não pertence à sua conta."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar checkout: ${response.status}`
        );
      }

      const data: SubscriptionCheckout = await response.json();

      setCheckout(data);

      setTermsAccepted(
        Boolean(
          data.termsAcceptedAt &&
          data.termsVersion === TERMS_VERSION
        )
      );
    } catch (err) {
      console.error("Erro ao carregar checkout:", err);
      setCheckout(null);
      setError(
        "Não foi possível carregar os dados desta contratação."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCheckout();
  }, [id]);

  async function handlePayment() {
    if (paymentLoading) return;

    if (!termsAccepted) {
      setPaymentError(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar."
      );
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError(null);

      const csrfResponse = await fetch(`${API_URL}/api/csrf`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!csrfResponse.ok) {
        throw new Error("Não foi possível preparar o pagamento.");
      }

      const csrfData: { token: string; headerName: string } =
        await csrfResponse.json();

      const response = await fetch(
        `${API_URL}/api/checkout/subscriptions/${id}/payment`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            [csrfData.headerName]: csrfData.token,
          },
          body: JSON.stringify({
            accepted: true,
            termsVersion: TERMS_VERSION,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = `/login?returnUrl=${encodeURIComponent(
          `/checkout/${id}`
        )}`;
        return;
      }

      if (!response.ok) {
        let message = "Não foi possível iniciar o pagamento.";

        try {
          const data = await response.json();
          message =
            data.message ?? data.error ?? data.detail ?? message;
        } catch {
          // Mantém a mensagem padrão caso a API não retorne JSON.
        }

        throw new Error(message);
      }

      const data: { paymentUrl?: string } = await response.json();

      if (!data.paymentUrl) {
        throw new Error("O provedor de pagamento não retornou uma URL válida.");
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error("Erro ao iniciar pagamento:", err);
      setPaymentError(
        err instanceof Error
          ? err.message
          : "Não foi possível iniciar o pagamento."
      );
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050914] px-6 text-white">
        <div className="flex flex-col items-center">
          <LoaderCircle
            size={28}
            className="animate-spin text-white/50"
          />

          <p className="mt-4 text-xs text-white/30">
            Preparando seu checkout...
          </p>
        </div>
      </main>
    );
  }

  if (error || !checkout) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050914] px-6 text-white">
        <div className="w-full max-w-lg rounded-[28px] border border-white/[0.07] bg-[#08101d] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-300/10 bg-red-300/[0.04]">
            <ReceiptText size={22} className="text-red-200/50" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Não foi possível abrir o checkout
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/35">
            {error ?? "Checkout não encontrado."}
          </p>

          <Link
            href="/produtos"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c]"
          >
            Voltar aos produtos
          </Link>
        </div>
      </main>
    );
  }

  const status = getStatusInfo(checkout.status);

  const gatewayName =
    checkout.paymentProvider === "STRIPE" ||
    checkout.currency.toUpperCase() !== "BRL"
      ? "Stripe"
      : "Mercado Pago";

  const canPay =
    checkout.status === "PENDING" ||
    checkout.status === "PAYMENT_PENDING";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute left-[-180px] top-[-200px] h-[520px] w-[520px] rounded-full bg-violet-500/[0.06] blur-[150px]" />
      <div className="pointer-events-none absolute right-[-200px] top-[100px] h-[520px] w-[520px] rounded-full bg-cyan-400/[0.04] blur-[150px]" />

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-7 lg:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/produtos"
            className="flex items-center gap-2 text-xs text-white/35 transition hover:text-white/70"
          >
            <ArrowLeft size={14} />
            Voltar
          </Link>

          <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
            ORBITTA
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[30px] border border-white/[0.07] bg-[#08101d]/85 p-6 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-5 border-b border-white/[0.06] pb-7 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
                  Finalizar contratação
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
                  {checkout.productName}
                </h1>

                <p className="mt-2 text-sm text-white/35">
                  Revise os dados antes de continuar com o pagamento.
                </p>
              </div>

              <div
                className={`w-fit rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-wider ${status.className}`}
              >
                {status.label}
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
                  <Package size={17} className="text-white/45" />
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                    Plano selecionado
                  </div>

                  <div className="mt-1 text-sm font-medium text-white/75">
                    {checkout.planName}
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.018] px-5 py-4">
                  <div>
                    <div className="text-xs text-white/55">
                      Mensalidade
                    </div>

                    <div className="mt-1 text-[10px] text-white/20">
                      Cobrança recorrente mensal
                    </div>
                  </div>

                  <div className="text-sm font-medium text-white/75">
                    {formatCurrency(
                      checkout.monthlyPrice,
                      checkout.currency
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.018] px-5 py-4">
                  <div>
                    <div className="text-xs text-white/55">
                      Taxa de implantação
                    </div>

                    <div className="mt-1 text-[10px] text-white/20">
                      Pagamento único
                    </div>
                  </div>

                  <div className="text-sm font-medium text-white/75">
                    {checkout.setupPrice > 0
                      ? formatCurrency(
                          checkout.setupPrice,
                          checkout.currency
                        )
                      : "Grátis"}
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.05] bg-black/10 p-5">
              <div className="flex items-center gap-2 text-xs text-white/45">
                <Clock3 size={14} />
                Checkout reservado até
              </div>

              <div className="mt-2 text-sm font-medium text-white/70">
                {formatDateTime(checkout.expiresAt)}
              </div>
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-emerald-300/[0.07] bg-emerald-300/[0.025] p-5">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-300/55"
              />

              <div>
                <div className="text-xs font-medium text-white/60">
                  Contratação protegida
                </div>

                <p className="mt-1 text-[11px] leading-5 text-white/25">
                  Os valores desta contratação foram registrados no
                  servidor no momento em que o checkout foi criado.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="h-fit rounded-[30px] border border-white/[0.07] bg-[#08101d]/85 p-6"
          >
            <div className="flex items-center gap-2">
              <ReceiptText size={16} className="text-white/40" />

              <h2 className="text-sm font-medium text-white/70">
                Resumo
              </h2>
            </div>

            <div className="mt-6 space-y-4 border-b border-white/[0.06] pb-6">
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-white/30">
                  {checkout.planName}
                </span>

                <span className="text-white/60">
                  {formatCurrency(
                    checkout.monthlyPrice,
                    checkout.currency
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-xs">
                <span className="text-white/30">
                  Implantação
                </span>

                <span className="text-white/60">
                  {checkout.setupPrice > 0
                    ? formatCurrency(
                        checkout.setupPrice,
                        checkout.currency
                      )
                    : "R$ 0,00"}
                </span>
              </div>

            </div>

            <div className="flex items-end justify-between gap-4 py-6">
              <div>
                <div className="text-xs text-white/30">
                  Total hoje
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  Primeira cobrança
                </div>
              </div>

              <div className="text-2xl font-semibold tracking-[-0.04em]">
                {formatCurrency(
                  checkout.totalPrice,
                  checkout.currency
                )}
              </div>
            </div>

            {canPay ? (
              <>
                <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) =>
                      setTermsAccepted(
                        event.target.checked
                      )
                    }
                    className="mt-0.5 h-4 w-4 accent-cyan-300"
                  />

                  <span className="text-[11px] leading-5 text-white/35">
                    Li e aceito os{" "}
                    <Link
                      href="/termos"
                      target="_blank"
                      className="text-cyan-200/70 underline underline-offset-2"
                    >
                      Termos de Uso
                    </Link>
                    {" "}e a{" "}
                    <Link
                      href="/privacidade"
                      target="_blank"
                      className="text-cyan-200/70 underline underline-offset-2"
                    >
                      Política de Privacidade
                    </Link>
                    . Estou ciente da cobrança recorrente mensal e da taxa inicial indicada neste checkout.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={
                    paymentLoading ||
                    !termsAccepted
                  }
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#07101c] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                {paymentLoading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Ir para pagamento
                  </>
                )}
                </button>
              </>
            ) : checkout.status === "APPROVED" ? (
              <Link
                href="/painel/produtos"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#07101c] transition hover:bg-white/90"
              >
                <Check size={16} />
                Acessar meus produtos
              </Link>
            ) : (
              <Link
                href="/produtos"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-sm font-medium text-white/55 transition hover:bg-white/[0.05]"
              >
                Escolher outro plano
              </Link>
            )}

            {paymentError ? (
              <p className="mt-3 text-center text-[11px] leading-5 text-red-200/70">
                {paymentError}
              </p>
            ) : canPay ? (
              <p className="mt-3 text-center text-[10px] leading-4 text-white/20">
                Você será redirecionado para {gatewayName} para concluir a assinatura.
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.05] pt-5 text-[10px] text-white/20">
              <LockKeyhole size={11} />
              Ambiente seguro Orbitta
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
