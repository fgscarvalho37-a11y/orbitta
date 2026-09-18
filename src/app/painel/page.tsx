"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  MoreHorizontal,
  Pizza,
  ReceiptText,
  Server,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { useOrbittaUser } from "./layout";

type ClientProduct = {
  id: number;
  name: string;
  subtitle: string | null;
  planName: string;
  monthlyPrice: number;
  domain: string | null;
  systemUrl: string | null;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type InvoiceStatus =
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

type Invoice = {
  id: number;
  invoiceNumber: string;
  productId: number;
  productName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  }

  if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function parseLocalDate(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Não definida";
  }

  const date = value.includes("T")
    ? new Date(value)
    : parseLocalDate(value);

  return new Intl.DateTimeFormat("pt-BR").format(
    date
  );
}

function formatShortDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = parseLocalDate(value);

  const months = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ];

  return `${String(date.getDate()).padStart(
    2,
    "0"
  )} ${months[date.getMonth()]}`;
}

function formatLongDate(value: string | null) {
  if (!value) {
    return "Data não definida";
  }

  const date = parseLocalDate(value);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
  }).format(date);
}

function getProductStatusLabel(
  status: ClientProduct["status"]
) {
  switch (status) {
    case "ACTIVE":
      return "Ativo";

    case "SUSPENDED":
      return "Suspenso";

    case "CANCELLED":
      return "Cancelado";

    default:
      return status;
  }
}

function getEffectiveInvoiceStatus(
  invoice: Invoice
): InvoiceStatus {
  if (invoice.status !== "PENDING") {
    return invoice.status;
  }

  const today = new Date();

  const todayWithoutTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (
    parseLocalDate(invoice.dueDate).getTime() <
    todayWithoutTime.getTime()
  ) {
    return "OVERDUE";
  }

  return "PENDING";
}

function getInvoiceStatusLabel(
  status: InvoiceStatus
) {
  switch (status) {
    case "PAID":
      return "Pago";

    case "PENDING":
      return "Pendente";

    case "OVERDUE":
      return "Vencida";

    case "CANCELLED":
      return "Cancelada";

    default:
      return status;
  }
}

function InvoiceStatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  if (status === "PAID") {
    return (
      <span className="w-fit rounded-full border border-emerald-300/[0.06] bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] text-emerald-200/50">
        Pago
      </span>
    );
  }

  if (status === "OVERDUE") {
    return (
      <span className="w-fit rounded-full border border-red-300/[0.07] bg-red-300/[0.04] px-2.5 py-1 text-[9px] text-red-200/55">
        Vencida
      </span>
    );
  }

  if (status === "CANCELLED") {
    return (
      <span className="w-fit rounded-full border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[9px] text-white/30">
        Cancelada
      </span>
    );
  }

  return (
    <span className="w-fit rounded-full border border-amber-300/[0.07] bg-amber-300/[0.04] px-2.5 py-1 text-[9px] text-amber-200/50">
      Pendente
    </span>
  );
}

export default function PainelPage() {
  const user = useOrbittaUser();

  const [greeting, setGreeting] =
    useState(getGreeting());

  const [products, setProducts] = useState<
    ClientProduct[]
  >([]);

  const [invoices, setInvoices] = useState<
    Invoice[]
  >([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingInvoices, setLoadingInvoices] =
    useState(true);

  const [productsError, setProductsError] =
    useState<string | null>(null);

  const [invoicesError, setInvoicesError] =
    useState<string | null>(null);

  useEffect(() => {
    function updateGreeting() {
      setGreeting(getGreeting());
    }

    updateGreeting();

    const interval = window.setInterval(
      updateGreeting,
      60_000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoadingProducts(true);
        setProductsError(null);

        const response = await fetch(
          `${API_URL}/api/client/products`,
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
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Erro ao carregar produtos: ${response.status}`
          );
        }

        const data: ClientProduct[] =
          await response.json();

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setProductsError(
            "Não foi possível carregar seus produtos."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInvoices() {
      try {
        setLoadingInvoices(true);
        setInvoicesError(null);

        const response = await fetch(
          `${API_URL}/api/client/invoices`,
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
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Erro ao carregar faturas: ${response.status}`
          );
        }

        const data: Invoice[] =
          await response.json();

        if (!cancelled) {
          setInvoices(data);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setInvoicesError(
            "Não foi possível carregar suas faturas."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingInvoices(false);
        }
      }
    }

    loadInvoices();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) => product.status === "ACTIVE"
      ),
    [products]
  );

  const primaryProduct =
    activeProducts[0] ?? products[0] ?? null;

  const normalizedInvoices = useMemo(
    () =>
      invoices.map((invoice) => ({
        ...invoice,
        effectiveStatus:
          getEffectiveInvoiceStatus(invoice),
      })),
    [invoices]
  );

  const recentInvoices = useMemo(
    () =>
      [...normalizedInvoices]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 3),
    [normalizedInvoices]
  );

  const pendingInvoices = useMemo(
    () =>
      normalizedInvoices
        .filter(
          (invoice) =>
            invoice.effectiveStatus === "PENDING"
        )
        .sort(
          (a, b) =>
            parseLocalDate(a.dueDate).getTime() -
            parseLocalDate(b.dueDate).getTime()
        ),
    [normalizedInvoices]
  );

  const overdueInvoices = useMemo(
    () =>
      normalizedInvoices.filter(
        (invoice) =>
          invoice.effectiveStatus === "OVERDUE"
      ),
    [normalizedInvoices]
  );

  const nextInvoice =
    pendingInvoices[0] ?? null;

  const stats = useMemo(
    () => [
      {
        label: "Produtos ativos",
        value: String(activeProducts.length),
        detail:
          activeProducts.length > 0
            ? activeProducts
                .map((product) => product.name)
                .join(", ")
            : "Nenhum produto ativo",
        icon: Sparkles,
      },
      {
        label: "Próxima cobrança",
        value: nextInvoice
          ? formatShortDate(nextInvoice.dueDate)
          : "—",
        detail: nextInvoice
          ? formatCurrency(nextInvoice.amount)
          : "Nenhuma cobrança pendente",
        icon: CalendarDays,
      },
      {
        label: "Situação financeira",
        value:
          overdueInvoices.length > 0
            ? String(overdueInvoices.length)
            : "OK",
        detail:
          overdueInvoices.length > 0
            ? overdueInvoices.length === 1
              ? "1 fatura vencida"
              : `${overdueInvoices.length} faturas vencidas`
            : "Nenhuma fatura vencida",
        icon:
          overdueInvoices.length > 0
            ? AlertCircle
            : Activity,
      },
    ],
    [
      activeProducts,
      nextInvoice,
      overdueInvoices,
    ]
  );

  const services = useMemo(() => {
    if (!primaryProduct) {
      return [];
    }

    return [
      {
        name: "Aplicação",
        detail: primaryProduct.name,
        status:
          primaryProduct.status === "ACTIVE"
            ? "Online"
            : getProductStatusLabel(
                primaryProduct.status
              ),
        healthy:
          primaryProduct.status === "ACTIVE",
      },
      {
        name: "Banco de dados",
        detail: "Produção",
        status:
          primaryProduct.status === "ACTIVE"
            ? "Online"
            : "Indisponível",
        healthy:
          primaryProduct.status === "ACTIVE",
      },
      {
        name: "Domínio",
        detail:
          primaryProduct.domain ??
          "Não configurado",
        status: primaryProduct.domain
          ? "Ativo"
          : "Pendente",
        healthy: Boolean(primaryProduct.domain),
      },
    ];
  }, [primaryProduct]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-[20%] top-[-200px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.035] blur-[130px]" />

      <div className="pointer-events-none absolute right-[-100px] top-[150px] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.035] blur-[130px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        {/* WELCOME */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
          }}
          className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-cyan-300/45">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />

              Client Space
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              {greeting}, {user.firstName}.
            </h1>

            <p className="mt-3 text-sm text-white/30">
              Aqui está um resumo dos seus produtos e
              serviços Orbitta.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/25">
            <Clock3 size={14} />
            Última atualização: agora
          </div>
        </motion.section>

        {/* STATS */}

        <section className="mt-9 grid gap-3 md:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.08 + index * 0.07,
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#08101d]/70 p-5 transition hover:border-white/[0.1]"
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-300/[0.025] blur-[45px]" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="text-xs text-white/30">
                      {stat.label}
                    </div>

                    <div className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                      {loadingProducts ||
                      loadingInvoices
                        ? "..."
                        : stat.value}
                    </div>

                    <div className="mt-2 text-[11px] text-white/25">
                      {loadingProducts ||
                      loadingInvoices
                        ? "Carregando..."
                        : stat.detail}
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-cyan-200/50">
                    <Icon size={17} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* MAIN GRID */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          {/* PRODUCTS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
              <div>
                <div className="text-xs font-medium text-white/60">
                  Meus produtos
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  Produtos vinculados à sua conta
                </div>
              </div>

              <Link
                href="/painel/produtos"
                className="group flex items-center gap-2 text-xs text-white/30 transition hover:text-white/70"
              >
                Ver todos

                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {loadingProducts ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-[22px] border border-white/[0.06] bg-[#050914]">
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Carregando produtos...
                  </div>
                </div>
              ) : productsError ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-[22px] border border-red-300/[0.08] bg-[#050914] px-6 text-center">
                  <div className="text-xs text-red-200/50">
                    {productsError}
                  </div>
                </div>
              ) : !primaryProduct ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[22px] border border-white/[0.06] bg-[#050914] px-6 text-center">
                  <Sparkles
                    size={24}
                    className="text-white/15"
                  />

                  <div className="mt-4 text-sm text-white/50">
                    Nenhum produto vinculado
                  </div>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-white/20">
                    Quando um produto Orbitta for
                    vinculado à sua conta, ele aparecerá
                    aqui.
                  </p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#050914] p-5 sm:p-7">
                  <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-[80px]" />

                  <div className="relative flex flex-col gap-7">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-300 via-red-400 to-violet-500 text-[#090b12] shadow-[0_10px_35px_rgba(251,146,60,0.12)]">
                          <Pizza size={23} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold tracking-[-0.03em]">
                              {primaryProduct.name}
                            </h2>

                            <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] uppercase tracking-wider text-emerald-200/55">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                              {getProductStatusLabel(
                                primaryProduct.status
                              )}
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-white/25">
                            {primaryProduct.subtitle ??
                              "Produto Orbitta"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-white/25 transition hover:text-white/60"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 text-[10px] text-white/25">
                          <WalletCards size={13} />
                          Plano
                        </div>

                        <div className="mt-3 text-sm text-white/70">
                          {primaryProduct.planName}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 text-[10px] text-white/25">
                          <CreditCard size={13} />
                          Mensalidade
                        </div>

                        <div className="mt-3 text-sm text-white/70">
                          {formatCurrency(
                            primaryProduct.monthlyPrice
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                        <div className="flex items-center gap-2 text-[10px] text-white/25">
                          <CalendarDays size={13} />
                          Renovação
                        </div>

                        <div className="mt-3 text-sm text-white/70">
                          {formatDate(
                            primaryProduct.renewalDate
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-4 border-t border-white/[0.05] pt-5 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-xs text-white/25">
                        <Globe2 size={14} />

                        {primaryProduct.domain ??
                          "Domínio não configurado"}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {primaryProduct.systemUrl ? (
                          <a
                            href={
                              primaryProduct.systemUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2.5 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/75"
                          >
                            Preview

                            <ExternalLink
                              size={12}
                              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </a>
                        ) : null}

                        <Link
                          href={`/painel/produtos/${primaryProduct.id}`}
                          className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#07101c]"
                        >
                          Gerenciar

                          <ArrowRight
                            size={12}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* SERVICES */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.27,
            }}
            className="rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
              <div>
                <div className="text-xs font-medium text-white/60">
                  Infraestrutura
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  Status dos serviços
                </div>
              </div>

              <Server
                size={16}
                className="text-white/20"
              />
            </div>

            <div className="p-5">
              {services.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-white/[0.018] p-4"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            service.healthy
                              ? "bg-emerald-300/[0.04] text-emerald-200/50"
                              : "bg-amber-300/[0.04] text-amber-200/50"
                          }`}
                        >
                          {service.healthy ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <Clock3 size={15} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-white/55">
                            {service.name}
                          </div>

                          <div className="mt-1 truncate text-[10px] text-white/20">
                            {service.detail}
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 text-[9px] ${
                            service.healthy
                              ? "text-emerald-200/45"
                              : "text-amber-200/45"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              service.healthy
                                ? "bg-emerald-400"
                                : "bg-amber-400"
                            }`}
                          />

                          {service.status}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-cyan-300/[0.06] bg-cyan-300/[0.025] p-4">
                    <div className="flex gap-3">
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-cyan-200/50"
                      />

                      <div>
                        <div className="text-xs text-white/55">
                          Operação normal
                        </div>

                        <p className="mt-1.5 text-[10px] leading-5 text-white/25">
                          Os serviços vinculados à sua
                          conta estão disponíveis.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[250px] items-center justify-center text-center text-xs text-white/20">
                  Nenhuma infraestrutura disponível.
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* LOWER GRID */}

        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.42fr]">
          {/* INVOICES */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.32,
            }}
            className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
              <div>
                <div className="text-xs font-medium text-white/60">
                  Faturas recentes
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  Histórico financeiro da conta
                </div>
              </div>

              <Link
                href="/painel/faturas"
                className="group flex items-center gap-2 text-xs text-white/30 transition hover:text-white/70"
              >
                Ver histórico

                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {loadingInvoices ? (
              <div className="flex min-h-[210px] items-center justify-center">
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Carregando faturas...
                </div>
              </div>
            ) : invoicesError ? (
              <div className="flex min-h-[210px] items-center justify-center px-6 text-center">
                <div className="text-xs text-red-200/50">
                  {invoicesError}
                </div>
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="flex min-h-[210px] flex-col items-center justify-center">
                <ReceiptText
                  size={22}
                  className="text-white/15"
                />

                <div className="mt-3 text-xs text-white/25">
                  Nenhuma fatura encontrada
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[650px]">
                  <div className="grid grid-cols-[1.35fr_1fr_1fr_0.8fr_40px] border-b border-white/[0.04] px-6 py-3 text-[9px] uppercase tracking-[0.14em] text-white/18">
                    <span>Fatura</span>
                    <span>Vencimento</span>
                    <span>Valor</span>
                    <span>Status</span>
                    <span />
                  </div>

                  {recentInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="grid grid-cols-[1.35fr_1fr_1fr_0.8fr_40px] items-center border-b border-white/[0.035] px-6 py-4 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.025] text-white/25">
                          <ReceiptText size={14} />
                        </div>

                        <div>
                          <span className="block text-xs text-white/55">
                            {invoice.invoiceNumber}
                          </span>

                          <span className="mt-1 block text-[9px] text-white/20">
                            {invoice.productName}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-white/25">
                        {formatDate(invoice.dueDate)}
                      </span>

                      <span className="text-xs text-white/55">
                        {formatCurrency(
                          invoice.amount
                        )}
                      </span>

                      <InvoiceStatusBadge
                        status={
                          invoice.effectiveStatus
                        }
                      />

                      <Link
                        href="/painel/faturas"
                        className="text-white/20 transition hover:text-white/60"
                        aria-label={`Abrir fatura ${invoice.invoiceNumber}`}
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* NEXT PAYMENT */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.38,
            }}
            className="relative overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-violet-400/[0.06] blur-[70px]" />

            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/[0.08] bg-violet-300/[0.04] text-violet-200/55">
                <CreditCard size={17} />
              </div>

              <p className="mt-7 text-[10px] uppercase tracking-[0.2em] text-white/25">
                Próxima cobrança
              </p>

              {loadingInvoices ? (
                <div className="flex min-h-[170px] items-center justify-center">
                  <Loader2
                    size={17}
                    className="animate-spin text-white/25"
                  />
                </div>
              ) : nextInvoice ? (
                <>
                  <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    {formatCurrency(
                      nextInvoice.amount
                    )}
                  </div>

                  <div className="mt-2 text-xs text-white/25">
                    Vencimento em{" "}
                    {formatLongDate(
                      nextInvoice.dueDate
                    )}
                  </div>

                  <div className="my-6 h-px bg-white/[0.05]" />

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-xs text-white/30">
                        {nextInvoice.productName}
                      </span>

                      <span className="mt-1 block text-[9px] text-white/15">
                        {nextInvoice.invoiceNumber}
                      </span>
                    </div>

                    <InvoiceStatusBadge
                      status={
                        nextInvoice.effectiveStatus
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    —
                  </div>

                  <div className="mt-2 text-xs text-white/25">
                    Nenhuma cobrança pendente
                  </div>

                  <div className="my-6 h-px bg-white/[0.05]" />

                  <div className="flex items-center gap-2 text-xs text-emerald-200/40">
                    <CheckCircle2 size={13} />
                    Sem pagamentos pendentes
                  </div>
                </>
              )}

              <Link
                href="/painel/faturas"
                className="group mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                Ver faturas

                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}