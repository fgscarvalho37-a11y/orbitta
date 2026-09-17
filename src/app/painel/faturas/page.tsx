"use client";

import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowDownToLine,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  Filter,
  Pizza,
  ReceiptText,
  Search,
  ShieldCheck,
} from "lucide-react";

const invoices = [
  {
    id: "ORB-2026-010",
    reference: "Outubro 2026",
    product: "PizzaSystem",
    plan: "Business",
    dueDate: "05/10/2026",
    paidAt: null,
    value: "R$ 149,90",
    status: "Aguardando",
  },
  {
    id: "ORB-2026-009",
    reference: "Setembro 2026",
    product: "PizzaSystem",
    plan: "Business",
    dueDate: "05/09/2026",
    paidAt: "05/09/2026",
    value: "R$ 149,90",
    status: "Pago",
  },
  {
    id: "ORB-2026-008",
    reference: "Agosto 2026",
    product: "PizzaSystem",
    plan: "Business",
    dueDate: "05/08/2026",
    paidAt: "05/08/2026",
    value: "R$ 149,90",
    status: "Pago",
  },
  {
    id: "ORB-2026-007",
    reference: "Julho 2026",
    product: "PizzaSystem",
    plan: "Business",
    dueDate: "05/07/2026",
    paidAt: "05/07/2026",
    value: "R$ 149,90",
    status: "Pago",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "Pago") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] text-emerald-200/50">
        <Check size={10} />
        Pago
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/[0.07] bg-amber-300/[0.04] px-2.5 py-1 text-[9px] text-amber-200/50">
      <Clock3 size={10} />
      Aguardando
    </span>
  );
}

export default function FaturasPage() {
  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute right-[-200px] top-[-200px] h-[650px] w-[650px] rounded-full bg-violet-500/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[10%] top-[650px] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.025] blur-[140px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        {/* HEADER */}
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
              Consulte cobranças, vencimentos e o histórico financeiro dos seus
              produtos Orbitta.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-4 py-2 text-[10px] text-emerald-200/45">
            <CheckCircle2 size={13} />
            Conta em dia
          </div>
        </motion.section>

        {/* SUMMARY */}
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
                  R$ 149,90
                </div>

                <div className="mt-2 text-[10px] text-white/25">
                  Vence em 05/10/2026
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
                  3
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
                  R$ 0,00
                </div>

                <div className="mt-2 text-[10px] text-emerald-200/35">
                  Nenhuma fatura vencida
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.025] text-white/35">
                <CreditCard size={16} />
              </div>
            </div>
          </motion.div>
        </section>

        {/* NEXT INVOICE */}
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
                    Outubro 2026
                  </h2>

                  <StatusBadge status="Aguardando" />
                </div>

                <div className="mt-2 text-xs text-white/25">
                  PizzaSystem • Business
                </div>

                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.14em] text-white/18">
                      Valor
                    </div>

                    <div className="mt-1.5 text-sm text-white/60">
                      R$ 149,90
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.14em] text-white/18">
                      Vencimento
                    </div>

                    <div className="mt-1.5 text-sm text-white/60">
                      05/10/2026
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.14em] text-white/18">
                      Fatura
                    </div>

                    <div className="mt-1.5 text-sm text-white/60">
                      ORB-2026-010
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50"
            >
              Ver cobrança
              <ChevronRight size={13} />
            </button>
          </div>
        </motion.section>

        {/* FILTERS + TABLE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.29 }}
          className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
        >
          {/* TABLE HEADER */}
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.05] px-6 py-5 lg:flex-row lg:items-center">
            <div>
              <div className="text-xs font-medium text-white/60">
                Histórico de faturas
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Cobranças geradas para sua conta
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
                />

                <input
                  type="search"
                  placeholder="Buscar fatura..."
                  className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-10 pr-4 text-xs text-white/60 outline-none placeholder:text-white/15 focus:border-cyan-300/15 sm:w-[220px]"
                />
              </div>

              <button
                type="button"
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-xs text-white/30 transition hover:bg-white/[0.04] hover:text-white/60"
              >
                <Filter size={13} />
                Filtrar
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1.2fr_1.1fr_1.2fr_1fr_1fr_0.8fr_60px] border-b border-white/[0.04] px-6 py-3 text-[9px] uppercase tracking-[0.13em] text-white/18">
                <span>Fatura</span>
                <span>Referência</span>
                <span>Produto</span>
                <span>Vencimento</span>
                <span>Valor</span>
                <span>Status</span>
                <span />
              </div>

              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="group grid grid-cols-[1.2fr_1.1fr_1.2fr_1fr_1fr_0.8fr_60px] items-center border-b border-white/[0.035] px-6 py-4 transition last:border-0 hover:bg-white/[0.012]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.025] text-white/25">
                      <FileText size={13} />
                    </div>

                    <span className="text-xs text-white/50">
                      {invoice.id}
                    </span>
                  </div>

                  <span className="text-xs text-white/30">
                    {invoice.reference}
                  </span>

                  <div>
                    <div className="text-xs text-white/50">
                      {invoice.product}
                    </div>

                    <div className="mt-1 text-[9px] text-white/18">
                      {invoice.plan}
                    </div>
                  </div>

                  <span className="text-xs text-white/30">
                    {invoice.dueDate}
                  </span>

                  <span className="text-xs font-medium text-white/55">
                    {invoice.value}
                  </span>

                  <StatusBadge status={invoice.status} />

                  <button
                    type="button"
                    aria-label={`Baixar ${invoice.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 transition hover:bg-white/[0.04] hover:text-cyan-200/60"
                  >
                    <ArrowDownToLine size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col justify-between gap-4 border-t border-white/[0.04] px-6 py-4 sm:flex-row sm:items-center">
            <div className="text-[10px] text-white/20">
              Exibindo 4 faturas
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] text-white/15 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={13} />
              </button>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-white/[0.05] px-3 text-[10px] text-white/55">
                1
              </div>

              <button
                type="button"
                disabled
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] text-white/15 disabled:cursor-not-allowed"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* BILLING DETAIL */}
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
              Quando o financeiro real estiver integrado, faturas pagas poderão
              disponibilizar seus respectivos documentos e comprovantes nesta
              área.
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
                  Dia 05
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/25">
                  Produto
                </span>

                <span className="text-xs text-white/50">
                  PizzaSystem
                </span>
              </div>
            </div>
          </motion.article>
        </section>

        {/* DEMO NOTICE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-5 flex gap-3 rounded-[20px] border border-amber-300/[0.05] bg-amber-300/[0.015] p-5"
        >
          <AlertCircle
            size={15}
            className="mt-0.5 shrink-0 text-amber-200/35"
          />

          <div>
            <div className="text-xs text-white/45">
              Ambiente demonstrativo
            </div>

            <p className="mt-1.5 text-[10px] leading-5 text-white/20">
              As faturas exibidas nesta etapa são dados de interface. Os botões
              de visualização e download serão conectados aos documentos reais
              quando implementarmos o financeiro da plataforma.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/15">
          <ShieldCheck size={11} />
          Central financeira Orbitta Space
        </div>
      </div>
    </div>
  );
}