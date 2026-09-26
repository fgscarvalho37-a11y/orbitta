"use client";

import {
  CheckCircle2,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL = "/backend";

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const [year, month, day] =
    value.substring(0, 10).split("-").map(Number);

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(year, month - 1, day)
  );
}

function effectiveStatus(invoice: Invoice): InvoiceStatus {
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

    const due = new Date(year, month - 1, day);

    if (due < today) {
      return "OVERDUE";
    }
  }

  return invoice.status;
}

function statusLabel(status: InvoiceStatus) {
  if (status === "PAID") return "Paga";
  if (status === "OVERDUE") return "Vencida";
  if (status === "CANCELLED") return "Cancelada";
  return "Pendente";
}

function statusClass(status: InvoiceStatus) {
  if (status === "PAID") {
    return "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200";
  }

  if (status === "OVERDUE") {
    return "border-red-300/10 bg-red-300/[0.05] text-red-200";
  }

  if (status === "CANCELLED") {
    return "border-white/[0.06] bg-white/[0.03] text-white/30";
  }

  return "border-amber-300/10 bg-amber-300/[0.05] text-amber-200";
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changingId, setChangingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<"ALL" | InvoiceStatus>("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadInvoices(refresh = false) {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/invoices`,
        {
          credentials: "include",
          cache: "no-store",
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
          "Não foi possível carregar as faturas."
        );
      }

      const data = await response.json();

      setInvoices(
        Array.isArray(data) ? data : []
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível carregar as faturas."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadInvoices();
  }, []);

  async function updateInvoice(
    invoice: Invoice,
    action: "paid" | "cancel"
  ) {
    try {
      setChangingId(invoice.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/admin/invoices/${invoice.id}/${action}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        let message =
          "Não foi possível atualizar a fatura.";

        try {
          const data = await response.json();
          message = data?.message ?? message;
        } catch {
          // mantém mensagem padrão
        }

        throw new Error(message);
      }

      const updated: Invoice =
        await response.json();

      setInvoices((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      setSuccess(
        action === "paid"
          ? "Fatura marcada como paga."
          : "Fatura cancelada."
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível atualizar a fatura."
      );
    } finally {
      setChangingId(null);
    }
  }

  const filtered = useMemo(() => {
    const normalized =
      query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const status =
        effectiveStatus(invoice);

      const matchesFilter =
        filter === "ALL" ||
        status === filter;

      const matchesQuery =
        !normalized ||
        invoice.invoiceNumber
          .toLowerCase()
          .includes(normalized) ||
        invoice.productName
          .toLowerCase()
          .includes(normalized);

      return matchesFilter && matchesQuery;
    });
  }, [invoices, query, filter]);

  const totals = useMemo(() => {
    return invoices.reduce(
      (result, invoice) => {
        const status =
          effectiveStatus(invoice);

        result.total += 1;
        result.amount +=
          Number(invoice.amount || 0);

        if (status === "PENDING") {
          result.pending += 1;
        }

        if (status === "PAID") {
          result.paid += 1;
        }

        if (status === "OVERDUE") {
          result.overdue += 1;
        }

        return result;
      },
      {
        total: 0,
        pending: 0,
        paid: 0,
        overdue: 0,
        amount: 0,
      }
    );
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
            Carregando faturas
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-violet-200/40">
            <ReceiptText size={13} />
            Financeiro
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            Faturas
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/30">
            Consulte cobranças, acompanhe vencimentos e atualize o status das faturas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadInvoices(true)}
          disabled={refreshing}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
          Atualizar
        </button>
      </header>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-5 py-4 text-xs text-red-100/70">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-5 py-4 text-xs text-emerald-100/70">
          {success}
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total", totals.total],
          ["Pendentes", totals.pending],
          ["Pagas", totals.paid],
          ["Vencidas", totals.overdue],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-[24px] border border-white/[0.06] bg-[#08101d] p-5"
          >
            <div className="text-2xl font-semibold tracking-[-0.04em] text-white/90">
              {value}
            </div>
            <div className="mt-1 text-xs text-white/35">
              {label}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-[26px] border border-white/[0.06] bg-[#08101d]">
        <div className="flex flex-col gap-4 border-b border-white/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
            />
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Buscar fatura ou produto"
              className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-3 text-xs text-white/70 outline-none transition placeholder:text-white/20 focus:border-violet-300/20"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                  | "ALL"
                  | InvoiceStatus
              )
            }
            className="h-10 rounded-xl border border-white/[0.07] bg-[#08101d] px-3 text-xs text-white/55 outline-none"
          >
            <option value="ALL">Todas</option>
            <option value="PENDING">Pendentes</option>
            <option value="PAID">Pagas</option>
            <option value="OVERDUE">Vencidas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-xs text-white/25">
            Nenhuma fatura encontrada.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.045]">
            {filtered.map((invoice) => {
              const status =
                effectiveStatus(invoice);

              return (
                <article
                  key={invoice.id}
                  className="flex flex-col gap-5 px-5 py-5 xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-white/80">
                        {invoice.productName}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-1 text-[8px] uppercase tracking-[0.12em] ${statusClass(status)}`}
                      >
                        {statusLabel(status)}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/25">
                      <span>{invoice.invoiceNumber}</span>
                      <span>
                        Vencimento: {formatDate(invoice.dueDate)}
                      </span>
                      {invoice.paidAt && (
                        <span>
                          Pago em: {formatDate(invoice.paidAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-[120px] text-left sm:text-right">
                      <div className="text-sm font-semibold text-white/80">
                        {formatCurrency(
                          Number(invoice.amount)
                        )}
                      </div>
                    </div>

                    {status !== "PAID" &&
                      status !== "CANCELLED" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={changingId === invoice.id}
                            onClick={() =>
                              void updateInvoice(
                                invoice,
                                "paid"
                              )
                            }
                            className="flex h-9 items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.04] px-3 text-[10px] text-emerald-100/70 transition hover:bg-emerald-300/[0.08] disabled:opacity-40"
                          >
                            <CheckCircle2 size={13} />
                            Marcar paga
                          </button>

                          <button
                            type="button"
                            disabled={changingId === invoice.id}
                            onClick={() =>
                              void updateInvoice(
                                invoice,
                                "cancel"
                              )
                            }
                            className="flex h-9 items-center gap-2 rounded-xl border border-red-300/10 bg-red-300/[0.04] px-3 text-[10px] text-red-100/60 transition hover:bg-red-300/[0.08] disabled:opacity-40"
                          >
                            <XCircle size={13} />
                            Cancelar
                          </button>
                        </div>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-4 text-[10px] text-white/20">
        Valor total listado: {formatCurrency(totals.amount)}
      </p>
    </div>
  );
}
