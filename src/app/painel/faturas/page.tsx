"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  Loader2,
  Pizza,
  ReceiptText,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = value.includes("T")
    ? new Date(value)
    : parseLocalDate(value);

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatReference(value: string) {
  const date = parseLocalDate(value);

  const reference = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return (
    reference.charAt(0).toUpperCase() +
    reference.slice(1)
  );
}

function getEffectiveStatus(
  invoice: Invoice
): InvoiceStatus {
  if (
    invoice.status === "PENDING" &&
    parseLocalDate(invoice.dueDate).getTime() <
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      ).getTime()
  ) {
    return "OVERDUE";
  }

  return invoice.status;
}

function StatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  if (status === "PAID") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] text-emerald-200/50">
        <Check size={10} />
        Pago
      </span>
    );
  }

  if (status === "OVERDUE") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-300/[0.08] bg-red-300/[0.04] px-2.5 py-1 text-[9px] text-red-200/55">
        <AlertCircle size={10} />
        Vencida
      </span>
    );
  }

  if (status === "CANCELLED") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] text-white/30">
        <XCircle size={10} />
        Cancelada
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-300/[0.07] bg-amber-300/[0.04] px-2.5 py-1 text-[9px] text-amber-200/50">
      <Clock3 size={10} />
      Aguardando
    </span>
  );
}

export default function FaturasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/client/invoices`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (response.status === 401 || response.status === 403) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar suas faturas."
          );
        }

        const data: Invoice[] = await response.json();

        setInvoices(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar suas faturas."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const normalizedInvoices = useMemo(
    () =>
      invoices.map((invoice) => ({
        ...invoice,
        effectiveStatus: getEffectiveStatus(invoice),
      })),
    [invoices]
  );

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return normalizedInvoices;
    }

    return normalizedInvoices.filter((invoice) => {
      return (
        invoice.invoiceNumber
          .toLowerCase()
          .includes(term) ||
        invoice.productName
          .toLowerCase()
          .includes(term) ||
        formatReference(invoice.dueDate)
          .toLowerCase()
          .includes(term)
      );
    });
  }, [normalizedInvoices, search]);

  const paidInvoices = normalizedInvoices.filter(
    (invoice) => invoice.effectiveStatus === "PAID"
  );

  const overdueInvoices = normalizedInvoices.filter(
    (invoice) => invoice.effectiveStatus === "OVERDUE"
  );

  const pendingInvoices = normalizedInvoices
    .filter(
      (invoice) =>
        invoice.effectiveStatus === "PENDING"
    )
    .sort(
      (a, b) =>
        parseLocalDate(a.dueDate).getTime() -
        parseLocalDate(b.dueDate).getTime()
    );

  const nextInvoice = pendingInvoices[0] ?? null;

  const overdueAmount = overdueInvoices.reduce(
    (total, invoice) => total + Number(invoice.amount),
    0
  );

  const accountIsUpToDate =
    overdueInvoices.length === 0;

  const billingProduct =
    normalizedInvoices[0]?.productName ?? "—";

  const billingDay =
    normalizedInvoices.length > 0
      ? String(
          parseLocalDate(
            normalizedInvoices[0].dueDate
          ).getDate()
        ).padStart(2, "0")
      : "—";

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/[0.08] bg-cyan-300/[0.03] text-cyan-200/50">
            <Loader2
              size={20}
              className="animate-spin"
            />
          </div>

          <span className="text-xs text-white/25">
            Carregando faturas...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute right-[-200px] top-[-200px] h-[650px] w-[650px] rounded-full bg-violet-500/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[10%] top-[650px] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.025] blur-[140px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-violet-300/50">
              <ReceiptText size={12} />
              Financeiro
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Faturas
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              Consulte cobranças, vencimentos e o
              histórico financeiro dos seus produtos
              Orbitta.
            </p>
          </div>

          {accountIsUpToDate ? (
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-4 py-2 text-[10px] text-emerald-200/45">
              <CheckCircle2 size={13} />
              Conta em dia
            </div>
          ) : (
            <div className="flex w-fit items-center gap-2 rounded-full border border-red-300/[0.08] bg-red-300/[0.03] px-4 py-2 text-[10px] text-red-200/50">
              <AlertCircle size={13} />
              Pagamento pendente
            </div>
          )}
        </motion.section>

        {error && (
          <div className="mt-8 flex gap-3 rounded-[20px] border border-red-300/[0.08] bg-red-300/[0.025] p-5">
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0 text-red-200/50"
            />

            <div>
              <div className="text-xs text-red-100/60">
                Não foi possível carregar
              </div>

              <p className="mt-1.5 text-[10px] leading-5 text-white/25">
                {error}
              </p>
            </div>
          </div>
        )}

        <section className="mt-10 grid gap-3 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-5"
          >
            <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-cyan-300/[0.04] blur-[60px]" />

            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                  Próxima fatura
                </div>

                <div className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                  {nextInvoice
                    ? formatCurrency(
                        Number(nextInvoice.amount)
                      )
                    : "—"}
                </div>

                <div className="mt-2 text-[10px] text-white/25">
                  {nextInvoice
                    ? `Vence em ${formatDate(
                        nextInvoice.dueDate
                      )}`
                    : "Nenhuma cobrança pendente"}
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.025] text-cyan-200/45">
                <CalendarDays size={16} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                  Faturas pagas
                </div>

                <div className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                  {paidInvoices.length}
                </div>

                <div className="mt-2 text-[10px] text-white/25">
                  Neste histórico
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/[0.06] bg-emerald-300/[0.03] text-emerald-200/45">
                <CheckCircle2 size={16} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                  Pendências
                </div>

                <div className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                  {formatCurrency(overdueAmount)}
                </div>

                <div
                  className={`mt-2 text-[10px] ${
                    overdueInvoices.length === 0
                      ? "text-emerald-200/35"
                      : "text-red-200/45"
                  }`}
                >
                  {overdueInvoices.length === 0
                    ? "Nenhuma fatura vencida"
                    : `${overdueInvoices.length} ${
                        overdueInvoices.length === 1
                          ? "fatura vencida"
                          : "faturas vencidas"
                      }`}
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.025] text-white/35">
                <CreditCard size={16} />
              </div>
            </div>
          </motion.div>
        </section>

        {nextInvoice && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23 }}
            className="relative mt-5 overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#08101d]/75"
          >
            <div className="pointer-events-none absolute right-[-130px] top-[-150px] h-[400px] w-[400px] rounded-full bg-violet-500/[0.06] blur-[110px]" />

            <div className="relative flex flex-col justify-between gap-7 p-6 sm:p-8 lg:flex-row lg:items-center">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-300 via-red-400 to-violet-500 text-[#090b12]">
                  <Pizza size={22} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-white/80">
                      {formatReference(
                        nextInvoice.dueDate
                      )}
                    </h2>

                    <StatusBadge
                      status={
                        nextInvoice.effectiveStatus
                      }
                    />
                  </div>

                  <div className="mt-2 text-xs text-white/25">
                    {nextInvoice.productName}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.14em] text-white/18">
                        Valor
                      </div>

                      <div className="mt-1.5 text-sm text-white/60">
                        {formatCurrency(
                          Number(nextInvoice.amount)
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase tracking-[0.14em] text-white/18">
                        Vencimento
                      </div>

                      <div className="mt-1.5 text-sm text-white/60">
                        {formatDate(
                          nextInvoice.dueDate
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] uppercase tracking-[0.14em] text-white/18">
                        Fatura
                      </div>

                      <div className="mt-1.5 text-sm text-white/60">
                        {nextInvoice.invoiceNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="flex h-11 w-fit cursor-default items-center justify-center gap-2 rounded-xl bg-white/90 px-5 text-xs font-semibold text-[#07101c]"
              >
                Aguardando pagamento
                <ChevronRight size={13} />
              </button>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.29 }}
          className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.05] px-6 py-5 lg:flex-row lg:items-center">
            <div>
              <div className="text-xs font-medium text-white/60">
                Histórico de faturas
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Cobranças geradas para sua conta
              </div>
            </div>

            <div className="relative">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar fatura..."
                className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-10 pr-4 text-xs text-white/60 outline-none placeholder:text-white/15 focus:border-cyan-300/15 sm:w-[240px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              <div className="grid grid-cols-[1.4fr_1.2fr_1.2fr_1fr_1fr_0.8fr] border-b border-white/[0.04] px-6 py-3 text-[9px] uppercase tracking-[0.13em] text-white/18">
                <span>Fatura</span>
                <span>Referência</span>
                <span>Produto</span>
                <span>Vencimento</span>
                <span>Valor</span>
                <span>Status</span>
              </div>

              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="group grid grid-cols-[1.4fr_1.2fr_1.2fr_1fr_1fr_0.8fr] items-center border-b border-white/[0.035] px-6 py-4 transition last:border-0 hover:bg-white/[0.012]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.025] text-white/25">
                        <FileText size={13} />
                      </div>

                      <span className="text-xs text-white/50">
                        {invoice.invoiceNumber}
                      </span>
                    </div>

                    <span className="text-xs text-white/30">
                      {formatReference(
                        invoice.dueDate
                      )}
                    </span>

                    <div>
                      <div className="text-xs text-white/50">
                        {invoice.productName}
                      </div>

                      {invoice.paidAt && (
                        <div className="mt-1 text-[9px] text-white/18">
                          Pago em{" "}
                          {formatDate(invoice.paidAt)}
                        </div>
                      )}
                    </div>

                    <span className="text-xs text-white/30">
                      {formatDate(invoice.dueDate)}
                    </span>

                    <span className="text-xs font-medium text-white/55">
                      {formatCurrency(
                        Number(invoice.amount)
                      )}
                    </span>

                    <StatusBadge
                      status={
                        invoice.effectiveStatus
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10">
                  <FileText
                    size={22}
                    className="text-white/15"
                  />

                  <div className="mt-3 text-xs text-white/30">
                    {search
                      ? "Nenhuma fatura encontrada"
                      : "Nenhuma fatura disponível"}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/[0.04] px-6 py-4">
            <div className="text-[10px] text-white/20">
              Exibindo {filteredInvoices.length}{" "}
              {filteredInvoices.length === 1
                ? "fatura"
                : "faturas"}
            </div>

            <div className="text-[10px] text-white/15">
              {invoices.length} no histórico
            </div>
          </div>
        </motion.section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-[24px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/[0.04] text-cyan-200/50">
              <ReceiptText size={17} />
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Documentos financeiros
            </h3>

            <p className="mt-3 text-xs leading-6 text-white/25">
              Comprovantes e documentos fiscais serão
              disponibilizados aqui quando estiverem
              associados às suas cobranças.
            </p>

            <div className="mt-5 flex items-center gap-2 text-[10px] text-white/20">
              <ShieldCheck size={11} />
              Documentos vinculados à conta
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-[24px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/[0.04] text-violet-200/50">
              <CalendarDays size={17} />
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Ciclo de cobrança
            </h3>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/25">
                  Frequência
                </span>

                <span className="text-xs text-white/50">
                  Mensal
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/25">
                  Dia de vencimento
                </span>

                <span className="text-xs text-white/50">
                  {billingDay === "—"
                    ? "—"
                    : `Dia ${billingDay}`}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/25">
                  Produto
                </span>

                <span className="text-xs text-white/50">
                  {billingProduct}
                </span>
              </div>
            </div>
          </motion.article>
        </section>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/15">
          <ShieldCheck size={11} />
          Central financeira Orbitta Space
        </div>
      </div>
    </div>
  );
}