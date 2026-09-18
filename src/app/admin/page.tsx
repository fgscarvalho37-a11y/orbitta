"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  CircleDollarSign,
  Clock3,
  Loader2,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";

type ClientCount = {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
};

type ProductCount = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
};

type InvoiceCount = {
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  cancelledInvoices: number;
};

type Invoice = {
  id: number;
  invoiceNumber: string;
  productId: number;
  productName: string;
  amount: number;
  status:
    | "PENDING"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED";
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value
    .substring(0, 10)
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(year, month - 1, day)
  );
}

function getInvoiceStatus(invoice: Invoice) {
  if (
    invoice.status === "PENDING" &&
    invoice.dueDate
  ) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const [year, month, day] =
      invoice.dueDate
        .substring(0, 10)
        .split("-")
        .map(Number);

    const dueDate = new Date(
      year,
      month - 1,
      day
    );

    if (dueDate < today) {
      return "OVERDUE";
    }
  }

  return invoice.status;
}

function statusLabel(status: string) {
  switch (status) {
    case "PAID":
      return "Paga";

    case "OVERDUE":
      return "Vencida";

    case "CANCELLED":
      return "Cancelada";

    default:
      return "Pendente";
  }
}

function statusClass(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200";

    case "OVERDUE":
      return "border-red-300/10 bg-red-300/[0.05] text-red-200";

    case "CANCELLED":
      return "border-white/[0.06] bg-white/[0.03] text-white/30";

    default:
      return "border-amber-300/10 bg-amber-300/[0.05] text-amber-200";
  }
}

export default function AdminDashboardPage() {
  const [clientCount, setClientCount] =
    useState<ClientCount | null>(null);

  const [productCount, setProductCount] =
    useState<ProductCount | null>(null);

  const [invoiceCount, setInvoiceCount] =
    useState<InvoiceCount | null>(null);

  const [invoices, setInvoices] = useState<
    Invoice[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  async function loadDashboard(
    isRefresh = false
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [
        clientsResponse,
        productsResponse,
        invoicesCountResponse,
        invoicesResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/admin/clients/count`,
          {
            credentials: "include",
            cache: "no-store",
          }
        ),

        fetch(
          `${API_URL}/api/admin/client-products/count`,
          {
            credentials: "include",
            cache: "no-store",
          }
        ),

        fetch(
          `${API_URL}/api/admin/invoices/count`,
          {
            credentials: "include",
            cache: "no-store",
          }
        ),

        fetch(
          `${API_URL}/api/admin/invoices`,
          {
            credentials: "include",
            cache: "no-store",
          }
        ),
      ]);

      const responses = [
        clientsResponse,
        productsResponse,
        invoicesCountResponse,
        invoicesResponse,
      ];

      if (
        responses.some(
          (response) =>
            response.status === 401 ||
            response.status === 403
        )
      ) {
        window.location.href = "/login";
        return;
      }

      if (
        responses.some(
          (response) => !response.ok
        )
      ) {
        throw new Error(
          "Não foi possível carregar os dados administrativos."
        );
      }

      const [
        clientsData,
        productsData,
        invoicesCountData,
        invoicesData,
      ] = await Promise.all([
        clientsResponse.json(),
        productsResponse.json(),
        invoicesCountResponse.json(),
        invoicesResponse.json(),
      ]);

      setClientCount(clientsData);
      setProductCount(productsData);
      setInvoiceCount(invoicesCountData);

      setInvoices(
        Array.isArray(invoicesData)
          ? invoicesData
          : []
      );
    } catch (err) {
      console.error(
        "Erro ao carregar dashboard admin:",
        err
      );

      setError(
        "Não foi possível carregar o dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const monthlyValue = useMemo(() => {
    return invoices
      .filter(
        (invoice) =>
          getInvoiceStatus(invoice) ===
          "PENDING"
      )
      .reduce(
        (total, invoice) =>
          total + Number(invoice.amount),
        0
      );
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    return invoices.slice(0, 5);
  }, [invoices]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={22}
            className="animate-spin text-violet-300"
          />

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Carregando administração
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* HEADER */}

      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-violet-200/40">
            <ShieldCheck size={13} />
            Administração Orbitta
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            Visão geral
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/30">
            Acompanhe clientes, produtos e
            cobranças da plataforma em um só
            lugar.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadDashboard(true)
          }
          disabled={refreshing}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Atualizar
        </button>
      </header>

      {error && (
        <div className="mt-7 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.03] px-5 py-4 text-xs text-red-200/70">
          {error}
        </div>
      )}

      {/* CARDS */}

      <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Clientes"
          value={
            clientCount?.totalClients ?? 0
          }
          description={`${
            clientCount?.activeClients ?? 0
          } ativos`}
          icon={Users}
          href="/admin/clientes"
        />

        <DashboardCard
          title="Produtos"
          value={
            productCount?.totalProducts ?? 0
          }
          description={`${
            productCount?.activeProducts ?? 0
          } ativos`}
          icon={Boxes}
          href="/admin/produtos"
        />

        <DashboardCard
          title="Faturas pendentes"
          value={
            invoiceCount?.pendingInvoices ??
            0
          }
          description={`${
            invoiceCount?.overdueInvoices ??
            0
          } vencidas`}
          icon={ReceiptText}
          href="/admin/faturas"
        />

        <DashboardCard
          title="Valor pendente"
          value={formatCurrency(
            monthlyValue
          )}
          description="Em cobranças abertas"
          icon={CircleDollarSign}
          href="/admin/faturas"
        />
      </section>

      {/* CONTEÚDO */}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        {/* FATURAS */}

        <div className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]">
          <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
            <div>
              <h2 className="text-sm font-medium text-white/80">
                Faturas recentes
              </h2>

              <p className="mt-1 text-[10px] text-white/25">
                Últimas cobranças geradas
              </p>
            </div>

            <Link
              href="/admin/faturas"
              className="flex items-center gap-1.5 text-[10px] text-violet-200/45 transition hover:text-violet-200"
            >
              Ver todas
              <ArrowRight size={12} />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <ReceiptText
                size={22}
                className="mx-auto text-white/15"
              />

              <p className="mt-4 text-xs text-white/25">
                Nenhuma fatura cadastrada.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.045]">
              {recentInvoices.map(
                (invoice) => {
                  const status =
                    getInvoiceStatus(
                      invoice
                    );

                  return (
                    <div
                      key={invoice.id}
                      className="flex flex-col gap-4 px-6 py-5 transition hover:bg-white/[0.015] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-white/75">
                            {
                              invoice.productName
                            }
                          </span>

                          <span
                            className={`rounded-full border px-2 py-1 text-[8px] uppercase tracking-[0.12em] ${statusClass(
                              status
                            )}`}
                          >
                            {statusLabel(
                              status
                            )}
                          </span>
                        </div>

                        <div className="mt-2 text-[10px] text-white/25">
                          {
                            invoice.invoiceNumber
                          }
                          {" · "}
                          Vence em{" "}
                          {formatDate(
                            invoice.dueDate
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <div className="text-sm font-medium text-white/75">
                          {formatCurrency(
                            Number(
                              invoice.amount
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* RESUMO FINANCEIRO */}

        <div className="rounded-[26px] border border-white/[0.06] bg-[#08101d] p-6">
          <div className="flex items-center gap-2">
            <Clock3
              size={15}
              className="text-violet-300/60"
            />

            <h2 className="text-sm font-medium text-white/80">
              Financeiro
            </h2>
          </div>

          <div className="mt-7 space-y-5">
            <SummaryRow
              label="Total de faturas"
              value={
                invoiceCount?.totalInvoices ??
                0
              }
            />

            <SummaryRow
              label="Pendentes"
              value={
                invoiceCount?.pendingInvoices ??
                0
              }
            />

            <SummaryRow
              label="Pagas"
              value={
                invoiceCount?.paidInvoices ??
                0
              }
            />

            <SummaryRow
              label="Vencidas"
              value={
                invoiceCount?.overdueInvoices ??
                0
              }
              danger={
                (
                  invoiceCount?.overdueInvoices ??
                  0
                ) > 0
              }
            />

            <SummaryRow
              label="Canceladas"
              value={
                invoiceCount?.cancelledInvoices ??
                0
              }
            />
          </div>

          <div className="my-7 h-px bg-white/[0.05]" />

          <Link
            href="/admin/faturas"
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-300/[0.08] bg-violet-300/[0.035] text-xs text-violet-100/60 transition hover:bg-violet-300/[0.07] hover:text-violet-100"
          >
            Gerenciar faturas
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  href: string;
};

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  href,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-white/[0.06] bg-[#08101d] p-5 transition hover:border-violet-300/[0.1] hover:bg-[#091321]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/[0.07] bg-violet-300/[0.03] text-violet-200/50">
          <Icon size={17} />
        </div>

        <ArrowRight
          size={14}
          className="text-white/15 transition group-hover:translate-x-0.5 group-hover:text-violet-200/50"
        />
      </div>

      <div className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-white/90">
        {value}
      </div>

      <div className="mt-1 text-xs text-white/40">
        {title}
      </div>

      <div className="mt-3 text-[10px] text-white/20">
        {description}
      </div>
    </Link>
  );
}

type SummaryRowProps = {
  label: string;
  value: string | number;
  danger?: boolean;
};

function SummaryRow({
  label,
  value,
  danger = false,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/30">
        {label}
      </span>

      <span
        className={`text-sm font-medium ${
          danger
            ? "text-red-200"
            : "text-white/70"
        }`}
      >
        {value}
      </span>
    </div>
  );
}