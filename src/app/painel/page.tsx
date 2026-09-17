"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Globe2,
  MoreHorizontal,
  Pizza,
  ReceiptText,
  Server,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

const stats = [
  {
    label: "Produtos ativos",
    value: "1",
    detail: "PizzaSystem",
    icon: Sparkles,
  },
  {
    label: "Próxima cobrança",
    value: "05 OUT",
    detail: "R$ 149,90",
    icon: CalendarDays,
  },
  {
    label: "Serviços online",
    value: "3/3",
    detail: "Tudo operacional",
    icon: Activity,
  },
];

const services = [
  {
    name: "Aplicação",
    detail: "PizzaSystem",
    status: "Online",
  },
  {
    name: "Banco de dados",
    detail: "Produção",
    status: "Online",
  },
  {
    name: "Domínio",
    detail: "pizzariaexemplo.com.br",
    status: "Ativo",
  },
];

const invoices = [
  {
    id: "ORB-2026-009",
    date: "05/09/2026",
    value: "R$ 149,90",
    status: "Pago",
  },
  {
    id: "ORB-2026-008",
    date: "05/08/2026",
    value: "R$ 149,90",
    status: "Pago",
  },
  {
    id: "ORB-2026-007",
    date: "05/07/2026",
    value: "R$ 149,90",
    status: "Pago",
  },
];

export default function PainelPage() {
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
              Bom dia, Felipe.
            </h1>

            <p className="mt-3 text-sm text-white/30">
              Aqui está um resumo dos seus produtos e serviços Orbitta.
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
                      {stat.value}
                    </div>

                    <div className="mt-2 text-[11px] text-white/25">
                      {stat.detail}
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
          {/* PRODUCT */}
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
                            PizzaSystem
                          </h2>

                          <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] uppercase tracking-wider text-emerald-200/55">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Ativo
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-white/25">
                          Food Commerce Platform
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
                        Business
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 text-[10px] text-white/25">
                        <CreditCard size={13} />
                        Mensalidade
                      </div>

                      <div className="mt-3 text-sm text-white/70">
                        R$ 149,90
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 text-[10px] text-white/25">
                        <CalendarDays size={13} />
                        Renovação
                      </div>

                      <div className="mt-3 text-sm text-white/70">
                        05/10/2026
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-4 border-t border-white/[0.05] pt-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-xs text-white/25">
                      <Globe2 size={14} />
                      pizzariaexemplo.com.br
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href="#"
                        className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2.5 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/75"
                      >
                        Acessar sistema
                        <ExternalLink
                          size={12}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </a>

                      <Link
                        href="/painel/produtos"
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

              <Server size={16} className="text-white/20" />
            </div>

            <div className="p-5">
              <div className="space-y-2">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-white/[0.018] p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-300/[0.04] text-emerald-200/50">
                      <CheckCircle2 size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-white/55">
                        {service.name}
                      </div>

                      <div className="mt-1 truncate text-[10px] text-white/20">
                        {service.detail}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-emerald-200/45">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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
                      Nenhuma interrupção identificada nos serviços vinculados
                      à sua conta.
                    </p>
                  </div>
                </div>
              </div>
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

            <div className="overflow-x-auto">
              <div className="min-w-[650px]">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_40px] border-b border-white/[0.04] px-6 py-3 text-[9px] uppercase tracking-[0.14em] text-white/18">
                  <span>Fatura</span>
                  <span>Data</span>
                  <span>Valor</span>
                  <span>Status</span>
                  <span />
                </div>

                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_40px] items-center border-b border-white/[0.035] px-6 py-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.025] text-white/25">
                        <ReceiptText size={14} />
                      </div>

                      <span className="text-xs text-white/55">
                        {invoice.id}
                      </span>
                    </div>

                    <span className="text-xs text-white/25">
                      {invoice.date}
                    </span>

                    <span className="text-xs text-white/55">
                      {invoice.value}
                    </span>

                    <span className="w-fit rounded-full bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] text-emerald-200/50">
                      {invoice.status}
                    </span>

                    <button
                      type="button"
                      className="text-white/20 transition hover:text-white/60"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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

              <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                R$ 149,90
              </div>

              <div className="mt-2 text-xs text-white/25">
                Vencimento em 05 de outubro
              </div>

              <div className="my-6 h-px bg-white/[0.05]" />

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">
                  PizzaSystem Business
                </span>

                <span className="text-[10px] text-white/20">
                  Mensal
                </span>
              </div>

              <Link
                href="/painel/pagamentos"
                className="group mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                Gerenciar pagamento

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