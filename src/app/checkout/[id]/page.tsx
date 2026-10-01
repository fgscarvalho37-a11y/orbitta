"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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
  billingAmount: number;
  billingCycle: "MONTHLY" | "ANNUAL";
  setupPrice: number;
  totalPrice: number;
  currency: string;
  settlementAmount: number | null;
  settlementCurrency: string | null;
  fxRate: number | null;
  fxQuotedAt: string | null;
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

function formatCurrency(
  value: number,
  currency: string,
  locale: string
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "BRL",
  }).format(value);
}

function formatDateTime(
  value: string,
  locale: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusInfo(
  status: CheckoutStatus,
  isEnglish: boolean
) {
  switch (status) {
    case "PENDING":
      return {
        label: isEnglish ? "Awaiting payment" : "Aguardando pagamento",
        className:
          "border-amber-300/10 bg-amber-300/[0.05] text-amber-200/70",
      };

    case "PAYMENT_PENDING":
      return {
        label: isEnglish ? "Payment processing" : "Pagamento em processamento",
        className:
          "border-blue-300/10 bg-blue-300/[0.05] text-blue-200/70",
      };

    case "APPROVED":
      return {
        label: isEnglish ? "Payment approved" : "Pagamento aprovado",
        className:
          "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200/70",
      };

    case "REJECTED":
      return {
        label: isEnglish ? "Payment declined" : "Pagamento recusado",
        className:
          "border-red-300/10 bg-red-300/[0.05] text-red-200/70",
      };

    case "CANCELLED":
      return {
        label: isEnglish ? "Checkout canceled" : "Checkout cancelado",
        className:
          "border-white/10 bg-white/[0.04] text-white/50",
      };

    case "EXPIRED":
      return {
        label: isEnglish ? "Checkout expired" : "Checkout expirado",
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
  const { locale, isEnglish, text } =
    useLanguage();

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
          text("Este checkout não existe ou não pertence à sua conta.", "This checkout does not exist or does not belong to your account.")
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
        text("Não foi possível carregar os dados desta contratação.", "We could not load this subscription.")
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
        text(
          "Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.",
          "You must accept the Terms of Use and Privacy Policy to continue."
        )
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
        throw new Error(text("Não foi possível preparar o pagamento.", "We could not prepare the payment."));
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
        let message = text("Não foi possível iniciar o pagamento.", "We could not start the payment.");

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
        throw new Error(text("O provedor de pagamento não retornou uma URL válida.", "The payment provider did not return a valid checkout URL."));
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error("Erro ao iniciar pagamento:", err);
      setPaymentError(
        err instanceof Error
          ? err.message
          : text("Não foi possível iniciar o pagamento.", "We could not start the payment.")
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
            {text("Preparando seu checkout...", "Preparing your checkout...")}
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
            {text("Não foi possível abrir o checkout", "We could not open the checkout")}
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/35">
            {error ?? text("Checkout não encontrado.", "Checkout not found.")}
          </p>

          <Link
            href="/produtos"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c]"
          >
            {text("Voltar aos produtos", "Back to products")}
          </Link>
        </div>
      </main>
    );
  }

  const status = getStatusInfo(
    checkout.status,
    isEnglish
  );

  const gatewayName =
    checkout.paymentProvider === "STRIPE"
      ? "Stripe"
      : "Mercado Pago";

  const isUsdCheckout =
    checkout.currency.toUpperCase() === "USD";

  const isAnnual =
    checkout.billingCycle === "ANNUAL";

  const hasBrlSettlement =
    isUsdCheckout &&
    checkout.settlementAmount !== null &&
    checkout.settlementCurrency?.toUpperCase() === "BRL";

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
            {text("Voltar", "Back")}
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">
              ORBITTA
            </div>
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
                  {text("Finalizar contratação", "Complete subscription")}
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">
                  {checkout.productName}
                </h1>

                <p className="mt-2 text-sm text-white/35">
                  {text("Revise os dados antes de continuar com o pagamento.", "Review the details before continuing to payment.")}
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
                    {text("Plano selecionado", "Selected plan")}
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
                      {isAnnual
                        ? text("Plano anual", "Annual plan")
                        : text("Mensalidade", "Monthly price")}
                    </div>

                    <div className="mt-1 text-[10px] text-white/20">
                      {isAnnual
                        ? text(
                            "12 meses de acesso pelo valor equivalente a 10 mensalidades.",
                            "12 months of access for the price of 10 monthly payments."
                          )
                        : isUsdCheckout
                          ? text(
                              "Primeiro mês pago uma vez; renovação recorrente será ativada depois.",
                              "First month is a one-time payment; recurring renewal will be activated later."
                            )
                          : text(
                              "Cobrança recorrente mensal",
                              "Recurring monthly charge"
                            )}
                    </div>
                  </div>

                  <div className="text-sm font-medium text-white/75">
                    {formatCurrency(
                      isAnnual
                        ? checkout.billingAmount
                        : checkout.monthlyPrice,
                      checkout.currency,
                      locale
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.018] px-5 py-4">
                  <div>
                    <div className="text-xs text-white/55">
                      {text("Taxa de implantação", "Setup fee")}
                    </div>

                    <div className="mt-1 text-[10px] text-white/20">
                      {text("Pagamento único", "One-time charge")}
                    </div>
                  </div>

                  <div className="text-sm font-medium text-white/75">
                    {checkout.setupPrice > 0
                      ? formatCurrency(
                          checkout.setupPrice,
                          checkout.currency,
                          locale
                        )
                      : text("Grátis", "Free")}
                  </div>
                </div>

                {hasBrlSettlement ? (
                  <div className="rounded-2xl border border-cyan-300/[0.08] bg-cyan-300/[0.025] px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-white/55">
                          {text(
                            "Cobrança no Mercado Pago",
                            "Mercado Pago charge"
                          )}
                        </div>

                        <div className="mt-1 text-[10px] leading-4 text-white/25">
                          {text(
                            "US$ 79,90 é convertido para reais no início deste checkout e o valor fica travado até ele expirar.",
                            "US$79.90 is converted to BRL when this checkout starts, and the converted amount stays locked until it expires."
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold text-cyan-100/80">
                          {formatCurrency(
                            checkout.settlementAmount ?? 0,
                            "BRL",
                            "pt-BR"
                          )}
                        </div>

                        {checkout.fxRate ? (
                          <div className="mt-1 text-[9px] text-white/20">
                            1 USD = {Number(checkout.fxRate).toFixed(4)} BRL
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.05] bg-black/10 p-5">
              <div className="flex items-center gap-2 text-xs text-white/45">
                <Clock3 size={14} />
                {text("Checkout reservado até", "Checkout reserved until")}
              </div>

              <div className="mt-2 text-sm font-medium text-white/70">
                {formatDateTime(checkout.expiresAt, locale)}
              </div>
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-emerald-300/[0.07] bg-emerald-300/[0.025] p-5">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-emerald-300/55"
              />

              <div>
                <div className="text-xs font-medium text-white/60">
                  {text("Contratação protegida", "Protected subscription")}
                </div>

                <p className="mt-1 text-[11px] leading-5 text-white/25">
                  {text("Os valores desta contratação foram registrados no servidor no momento em que o checkout foi criado.", "The price and currency were locked on the server when this checkout was created.")}
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
                {text("Resumo", "Summary")}
              </h2>
            </div>

            <div className="mt-6 space-y-4 border-b border-white/[0.06] pb-6">
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-white/30">
                  {checkout.planName}
                </span>

                <span className="text-white/60">
                  {formatCurrency(
                    isAnnual
                      ? checkout.billingAmount
                      : checkout.monthlyPrice,
                    checkout.currency,
                    locale
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-xs">
                <span className="text-white/30">
                  {text("Implantação", "Setup")}
                </span>

                <span className="text-white/60">
                  {checkout.setupPrice > 0
                    ? formatCurrency(
                        checkout.setupPrice,
                        checkout.currency,
                        locale
                      )
                    : formatCurrency(
                        0,
                        checkout.currency,
                        locale
                      )}
                </span>
              </div>

            </div>

            <div className="flex items-end justify-between gap-4 py-6">
              <div>
                <div className="text-xs text-white/30">
                  {text("Total hoje", "Total today")}
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  {text("Primeira cobrança", "First charge")}
                </div>
              </div>

              <div className="text-2xl font-semibold tracking-[-0.04em]">
                {formatCurrency(
                  checkout.totalPrice,
                  checkout.currency,
                  locale
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
                    {text("Li e aceito os", "I have read and accept the")}{" "}
                    <Link
                      href="/termos"
                      target="_blank"
                      className="text-cyan-200/70 underline underline-offset-2"
                    >
                      {text("Termos de Uso", "Terms of Use")}
                    </Link>
                    {" "}{text("e a", "and the")}{" "}
                    <Link
                      href="/privacidade"
                      target="_blank"
                      className="text-cyan-200/70 underline underline-offset-2"
                    >
                      {text("Política de Privacidade", "Privacy Policy")}
                    </Link>
                    . {isAnnual
                      ? text(
                          "Estou ciente de que o plano anual é pago antecipadamente, concede 12 meses de acesso e custa o equivalente a 10 mensalidades, além de eventual taxa inicial indicada neste checkout.",
                          "I understand that the annual plan is prepaid, provides 12 months of access, and costs the equivalent of 10 monthly payments, plus any setup fee shown in this checkout."
                        )
                      : isUsdCheckout
                        ? text(
                            "Estou ciente de que o primeiro mês será pago uma única vez pelo Mercado Pago em BRL, após conversão do valor exibido em USD.",
                            "I understand that the first month will be paid once through Mercado Pago in BRL after converting the displayed USD amount."
                          )
                        : text(
                            "Estou ciente da cobrança recorrente mensal e da taxa inicial indicada neste checkout.",
                            "I understand the recurring monthly charge and the setup fee shown in this checkout."
                          )}
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
                    {text("Redirecionando...", "Redirecting...")}
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    {gatewayName === "Mercado Pago"
                      ? text(
                          "Pagar com Mercado Pago",
                          "Pay with Mercado Pago"
                        )
                      : text(
                          "Ir para pagamento",
                          "Continue to payment"
                        )}
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
                {text("Acessar meus produtos", "Access my products")}
              </Link>
            ) : (
              <Link
                href="/produtos"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-sm font-medium text-white/55 transition hover:bg-white/[0.05]"
              >
                {text("Escolher outro plano", "Choose another plan")}
              </Link>
            )}

            {paymentError ? (
              <p className="mt-3 text-center text-[11px] leading-5 text-red-200/70">
                {paymentError}
              </p>
            ) : canPay ? (
              <p className="mt-3 text-center text-[10px] leading-4 text-white/20">
                {isAnnual
                  ? text(
                      `Você será redirecionado para ${gatewayName} para concluir o pagamento anual antecipado.`,
                      `You will be redirected to ${gatewayName} to complete the prepaid annual payment.`
                    )
                  : isUsdCheckout
                    ? text(
                        `Você será redirecionado para ${gatewayName}. A primeira cobrança será processada em BRL.`,
                        `You will be redirected to ${gatewayName}. The first charge will be processed in BRL.`
                      )
                    : text(
                        `Você será redirecionado para ${gatewayName} para concluir a assinatura.`,
                        `You will be redirected to ${gatewayName} to complete your subscription.`
                      )}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.05] pt-5 text-[10px] text-white/20">
              <LockKeyhole size={11} />
              {text("Ambiente seguro Orbitta", "Secure Orbitta checkout")}
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
