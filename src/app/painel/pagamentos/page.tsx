"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  History,
  LockKeyhole,
  MoreHorizontal,
  Pizza,
  Plus,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

const recentPayments = [
  {
    id: "PAY-009",
    product: "PizzaSystem",
    date: "05/09/2026",
    value: "R$ 149,90",
    method: "•••• 4821",
    status: "Pago",
  },
  {
    id: "PAY-008",
    product: "PizzaSystem",
    date: "05/08/2026",
    value: "R$ 149,90",
    method: "•••• 4821",
    status: "Pago",
  },
  {
    id: "PAY-007",
    product: "PizzaSystem",
    date: "05/07/2026",
    value: "R$ 149,90",
    method: "•••• 4821",
    status: "Pago",
  },
];

export default function PagamentosPage() {
  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute right-[-200px] top-[-180px] h-[620px] w-[620px] rounded-full bg-cyan-400/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[15%] top-[600px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[140px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        {/* HEADER */}
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
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-cyan-300/45">
              <CreditCard size={12} />
              Financeiro
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Pagamentos
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              Gerencie formas de pagamento e acompanhe as cobranças dos seus
              produtos Orbitta.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-4 py-2 text-[10px] text-emerald-200/45">
            <CheckCircle2 size={13} />
            Nenhuma pendência
          </div>
        </motion.section>

        {/* TOP GRID */}
        <section className="mt-10 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          {/* NEXT CHARGE */}
          <motion.article
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#08101d]/75"
          >
            <div className="pointer-events-none absolute right-[-100px] top-[-120px] h-[350px] w-[350px] rounded-full bg-cyan-400/[0.07] blur-[100px]" />

            <div className="relative border-b border-white/[0.05] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/25">
                    <CalendarDays size={13} />
                    Próxima cobrança
                  </div>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                      R$ 149,90
                    </span>

                    <span className="text-xs text-white/20">
                      BRL
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-white/30">
                    Vencimento em 05 de outubro de 2026
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/[0.08] bg-cyan-300/[0.04] text-cyan-200/55">
                  <WalletCards size={20} />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-black/10 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 via-red-400 to-violet-500 text-[#090b12]">
                  <Pizza size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white/65">
                    PizzaSystem
                  </div>

                  <div className="mt-1 text-[10px] text-white/25">
                    Business • Assinatura mensal
                  </div>
                </div>

                <span className="hidden rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.035] px-3 py-1.5 text-[9px] text-emerald-200/45 sm:block">
                  Ativa
                </span>
              </div>
            </div>

            <div className="relative flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center sm:px-8">
              <div className="flex items-start gap-3">
                <RefreshCw
                  size={15}
                  className="mt-0.5 shrink-0 text-cyan-200/40"
                />

                <div>
                  <div className="text-xs text-white/50">
                    Cobrança recorrente
                  </div>

                  <p className="mt-1 text-[10px] leading-5 text-white/22">
                    O método principal será utilizado na próxima renovação.
                  </p>
                </div>
              </div>

              <Link
                href="/painel/assinaturas"
                className="group flex w-fit items-center gap-2 text-xs text-white/30 transition hover:text-white/65"
              >
                Ver assinatura

                <ArrowRight
                  size={12}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </motion.article>

          {/* PAYMENT METHOD */}
          <motion.article
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.14,
            }}
            className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#08101d]/75"
          >
            <div className="pointer-events-none absolute bottom-[-100px] right-[-80px] h-64 w-64 rounded-full bg-violet-500/[0.055] blur-[90px]" />

            <div className="relative flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
              <div>
                <div className="text-xs font-medium text-white/60">
                  Método principal
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  Utilizado nas cobranças recorrentes
                </div>
              </div>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-white/25 transition hover:text-white/60"
                aria-label="Opções do cartão"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="relative p-6">
              {/* CARD */}
              <div className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-br from-[#111c2e] to-[#080e19] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
                <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-cyan-300/[0.08] blur-[70px]" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <CreditCard
                      size={24}
                      className="text-white/55"
                    />

                    <div className="text-xs font-semibold italic tracking-[0.08em] text-white/50">
                      VISA
                    </div>
                  </div>

                  <div className="mt-12 text-lg tracking-[0.22em] text-white/70">
                    •••• •••• •••• 4821
                  </div>

                  <div className="mt-7 flex items-end justify-between">
                    <div>
                      <div className="text-[8px] uppercase tracking-[0.18em] text-white/20">
                        Titular
                      </div>

                      <div className="mt-1.5 text-xs text-white/50">
                        FELIPE GOMES
                      </div>
                    </div>

                    <div>
                      <div className="text-[8px] uppercase tracking-[0.18em] text-white/20">
                        Validade
                      </div>

                      <div className="mt-1.5 text-xs text-white/50">
                        08/30
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50"
                >
                  Alterar método
                  <ChevronRight size={13} />
                </button>

                <button
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 text-xs text-white/35 transition hover:bg-white/[0.05] hover:text-white/65"
                >
                  <Plus size={13} />
                  Adicionar
                </button>
              </div>

              <div className="mt-5 flex items-start gap-2.5 text-[10px] leading-5 text-white/20">
                <LockKeyhole
                  size={12}
                  className="mt-1 shrink-0"
                />

                Os dados completos do cartão não ficam expostos no painel.
              </div>
            </div>
          </motion.article>
        </section>

        {/* FINANCIAL STATUS */}
        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: CheckCircle2,
              label: "Situação financeira",
              value: "Em dia",
              detail: "Nenhuma cobrança pendente",
            },
            {
              icon: CalendarDays,
              label: "Próximo vencimento",
              value: "05 OUT",
              detail: "R$ 149,90",
            },
            {
              icon: CreditCard,
              label: "Método",
              value: "Visa •••• 4821",
              detail: "Método principal",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2 + index * 0.05,
                }}
                className="rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                      {item.label}
                    </div>

                    <div className="mt-4 text-lg font-medium text-white/70">
                      {item.value}
                    </div>

                    <div className="mt-2 text-[10px] text-white/20">
                      {item.detail}
                    </div>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.025] text-cyan-200/45">
                    <Icon size={15} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* RECENT PAYMENTS */}
        <motion.section
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
          className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.05] px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                <History size={14} />
                Pagamentos recentes
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Últimas cobranças processadas
              </div>
            </div>

            <Link
              href="/painel/faturas"
              className="group flex items-center gap-2 text-xs text-white/30 transition hover:text-white/65"
            >
              Ver todas as faturas

              <ArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[0.8fr_1.3fr_1fr_1fr_1fr_0.7fr] border-b border-white/[0.04] px-6 py-3 text-[9px] uppercase tracking-[0.14em] text-white/18">
                <span>ID</span>
                <span>Produto</span>
                <span>Data</span>
                <span>Método</span>
                <span>Valor</span>
                <span>Status</span>
              </div>

              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-[0.8fr_1.3fr_1fr_1fr_1fr_0.7fr] items-center border-b border-white/[0.035] px-6 py-4 last:border-0"
                >
                  <span className="text-xs text-white/30">
                    {payment.id}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-300/80 via-red-400/80 to-violet-500/80 text-[#090b12]">
                      <Pizza size={13} />
                    </div>

                    <span className="text-xs text-white/55">
                      {payment.product}
                    </span>
                  </div>

                  <span className="text-xs text-white/25">
                    {payment.date}
                  </span>

                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <CreditCard size={13} />
                    {payment.method}
                  </div>

                  <span className="text-xs text-white/55">
                    {payment.value}
                  </span>

                  <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] text-emerald-200/50">
                    <Check size={10} />
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* BILLING INFO */}
        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <motion.article
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.38,
            }}
            className="rounded-[24px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/[0.04] text-violet-200/50">
                <Building2 size={17} />
              </div>

              <button
                type="button"
                className="text-[10px] text-cyan-300/40 transition hover:text-cyan-200"
              >
                Editar
              </button>
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Dados de cobrança
            </h3>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-white/25">
                  Nome
                </span>

                <span className="text-right text-white/50">
                  Felipe Gomes
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-white/25">
                  Documento
                </span>

                <span className="text-right text-white/50">
                  •••.•••.•••-••
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-white/25">
                  E-mail
                </span>

                <span className="text-right text-white/50">
                  financeiro@empresa.com
                </span>
              </div>
            </div>
          </motion.article>

          <motion.article
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.43,
            }}
            className="rounded-[24px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/[0.04] text-cyan-200/50">
              <ShieldCheck size={17} />
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Pagamentos protegidos
            </h3>

            <p className="mt-3 max-w-xl text-xs leading-6 text-white/25">
              Quando integrarmos o gateway de pagamento, os dados sensíveis
              serão processados pelo provedor responsável. A Orbitta não deve
              armazenar número completo de cartão ou código de segurança.
            </p>

            <div className="mt-5 flex items-center gap-2 text-[10px] text-emerald-200/40">
              <LockKeyhole size={11} />
              Informações sensíveis protegidas
            </div>
          </motion.article>
        </section>

        {/* NOTICE */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.48,
          }}
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
              Os métodos, cartões, cobranças e valores exibidos nesta etapa são
              dados de interface. Nenhum pagamento está sendo processado.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] text-white/15">
          <div className="flex items-center gap-2">
            <ShieldCheck size={11} />
            Orbitta Space
          </div>

          <span className="h-1 w-1 rounded-full bg-white/15" />

          <div className="flex items-center gap-2">
            <ReceiptText size={11} />
            Central financeira
          </div>
        </div>
      </div>
    </div>
  );
}