"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Globe2,
  Info,
  Pizza,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";

const includedFeatures = [
  "Plataforma PizzaSystem",
  "Painel administrativo",
  "Cardápio digital",
  "Gestão de pedidos",
  "Painel de cozinha",
  "Pagamentos integrados",
  "Gestão de entregas",
  "Relatórios operacionais",
  "Domínio conectado",
  "Hospedagem da aplicação",
  "Banco de dados",
  "Atualizações do sistema",
];

const billingTimeline = [
  {
    title: "Assinatura iniciada",
    date: "05/07/2026",
    detail: "Plano Business ativado",
    completed: true,
  },
  {
    title: "Última renovação",
    date: "05/09/2026",
    detail: "Pagamento confirmado",
    completed: true,
  },
  {
    title: "Próxima renovação",
    date: "05/10/2026",
    detail: "R$ 149,90",
    completed: false,
  },
];

export default function AssinaturasPage() {
  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute right-[-180px] top-[-180px] h-[600px] w-[600px] rounded-full bg-violet-500/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[5%] top-[500px] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.025] blur-[140px]" />

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
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-violet-300/50">
              <WalletCards size={12} />
              Assinaturas
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Suas assinaturas
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              Acompanhe planos, valores, ciclos de cobrança e renovações dos
              produtos contratados com a Orbitta.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-4 py-2 text-[10px] text-emerald-200/45">
            <CheckCircle2 size={13} />
            Assinatura em dia
          </div>
        </motion.section>

        {/* SUBSCRIPTION */}
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
            delay: 0.08,
          }}
          className="relative mt-10 overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#08101d]/75"
        >
          <div className="pointer-events-none absolute right-[-120px] top-[-150px] h-[450px] w-[450px] rounded-full bg-violet-500/[0.065] blur-[120px]" />

          <div className="pointer-events-none absolute left-[20%] top-[50%] h-[350px] w-[350px] rounded-full bg-cyan-400/[0.025] blur-[110px]" />

          {/* TOP */}
          <div className="relative flex flex-col justify-between gap-8 border-b border-white/[0.05] p-6 sm:p-8 lg:flex-row lg:items-start">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-300 via-red-400 to-violet-500 text-[#090b12] shadow-[0_15px_45px_rgba(251,146,60,0.12)]">
                <Pizza size={27} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                    PizzaSystem
                  </h2>

                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.04] px-3 py-1 text-[9px] uppercase tracking-[0.12em] text-emerald-200/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Ativa
                  </span>
                </div>

                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/20">
                  Business Plan
                </p>

                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/35">
                  Assinatura vinculada ao PizzaSystem com infraestrutura,
                  atualizações e serviços necessários para manter sua operação
                  disponível.
                </p>
              </div>
            </div>

            <Link
              href="/painel/produtos"
              className="group flex w-fit items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-xs text-white/40 transition hover:bg-white/[0.05] hover:text-white/70"
            >
              Ver produto
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* BILLING DATA */}
          <div className="relative grid gap-px bg-white/[0.05] sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-[#08101d] p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                <Sparkles size={13} />
                Plano
              </div>

              <div className="mt-4 text-xl font-medium text-white/80">
                Business
              </div>

              <div className="mt-2 text-[10px] text-white/20">
                Plano atual
              </div>
            </div>

            <div className="bg-[#08101d] p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                <CreditCard size={13} />
                Valor
              </div>

              <div className="mt-4 text-xl font-medium text-white/80">
                R$ 149,90
              </div>

              <div className="mt-2 text-[10px] text-white/20">
                por mês
              </div>
            </div>

            <div className="bg-[#08101d] p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                <RefreshCw size={13} />
                Ciclo
              </div>

              <div className="mt-4 text-xl font-medium text-white/80">
                Mensal
              </div>

              <div className="mt-2 text-[10px] text-white/20">
                Renovação recorrente
              </div>
            </div>

            <div className="bg-[#08101d] p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                <CalendarDays size={13} />
                Próxima cobrança
              </div>

              <div className="mt-4 text-xl font-medium text-white/80">
                05/10/2026
              </div>

              <div className="mt-2 text-[10px] text-white/20">
                R$ 149,90
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="relative flex flex-col justify-between gap-5 p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-300/[0.04] text-emerald-200/50">
                <CheckCircle2 size={16} />
              </div>

              <div>
                <div className="text-xs font-medium text-white/60">
                  Renovação automática ativa
                </div>

                <p className="mt-1.5 max-w-xl text-[10px] leading-5 text-white/25">
                  A assinatura permanece ativa enquanto as cobranças forem
                  processadas normalmente.
                </p>
              </div>
            </div>

            <Link
              href="/painel/pagamentos"
              className="group flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50"
            >
              Gerenciar pagamento

              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </motion.section>

        {/* DETAILS */}
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.65fr]">
          {/* INCLUDED */}
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
              delay: 0.16,
            }}
            className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
              <div>
                <div className="text-xs font-medium text-white/60">
                  Incluso na assinatura
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  Recursos e serviços do plano Business
                </div>
              </div>

              <Zap size={16} className="text-cyan-300/35" />
            </div>

            <div className="grid gap-px bg-white/[0.04] sm:grid-cols-2">
              {includedFeatures.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    delay: 0.2 + index * 0.025,
                  }}
                  className="flex items-center gap-3 bg-[#08101d] px-6 py-4"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300/[0.05] text-cyan-200/50">
                    <Check size={12} />
                  </div>

                  <span className="text-xs text-white/40">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* TIMELINE */}
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
              delay: 0.22,
            }}
            className="rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="border-b border-white/[0.05] px-6 py-5">
              <div className="text-xs font-medium text-white/60">
                Ciclo da assinatura
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Histórico e próxima renovação
              </div>
            </div>

            <div className="p-6">
              <div className="relative">
                <div className="absolute bottom-5 left-[15px] top-5 w-px bg-white/[0.06]" />

                <div className="space-y-7">
                  {billingTimeline.map((item) => (
                    <div
                      key={item.title}
                      className="relative flex gap-4"
                    >
                      <div
                        className={`relative z-10 mt-0.5 flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full border ${
                          item.completed
                            ? "border-emerald-300/[0.1] bg-emerald-300/[0.05] text-emerald-200/55"
                            : "border-cyan-300/[0.1] bg-cyan-300/[0.05] text-cyan-200/55"
                        }`}
                      >
                        {item.completed ? (
                          <Check size={12} />
                        ) : (
                          <Clock3 size={12} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                          <span className="text-xs text-white/55">
                            {item.title}
                          </span>

                          <span className="text-[10px] text-white/20">
                            {item.date}
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] text-white/25">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SERVICE DETAILS */}
        <section className="mt-5 grid gap-5 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27 }}
            className="rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/[0.04] text-cyan-200/50">
              <Server size={17} />
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Infraestrutura
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/25">
              Hospedagem da aplicação e banco de dados vinculados ao produto.
            </p>

            <div className="mt-5 flex items-center gap-2 text-[10px] text-emerald-200/45">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Operacional
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/[0.04] text-violet-200/50">
              <Globe2 size={17} />
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Domínio
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/25">
              pizzariaexemplo.com.br conectado à aplicação PizzaSystem.
            </p>

            <Link
              href="/painel/dominios"
              className="mt-5 flex items-center gap-2 text-[10px] text-cyan-300/40 transition hover:text-cyan-200"
            >
              Ver domínio
              <ArrowRight size={11} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.37 }}
            className="rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/[0.04] text-emerald-200/50">
              <ShieldCheck size={17} />
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Segurança
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/25">
              Certificado SSL e serviços essenciais de segurança incluídos.
            </p>

            <div className="mt-5 flex items-center gap-2 text-[10px] text-emerald-200/45">
              <CheckCircle2 size={11} />
              Protegido
            </div>
          </motion.div>
        </section>

        {/* INFORMATION */}
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
            delay: 0.42,
          }}
          className="mt-5 flex flex-col justify-between gap-5 rounded-[22px] border border-white/[0.05] bg-white/[0.018] p-5 sm:flex-row sm:items-center"
        >
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.025] text-white/30">
              <Info size={15} />
            </div>

            <div>
              <div className="text-xs text-white/50">
                Precisa alterar algo na sua assinatura?
              </div>

              <p className="mt-1.5 max-w-2xl text-[10px] leading-5 text-white/22">
                Alterações de plano, condições comerciais ou cancelamentos
                poderão ser solicitados diretamente pelo suporte Orbitta.
              </p>
            </div>
          </div>

          <Link
            href="/painel/suporte"
            className="group flex w-fit items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2.5 text-xs text-white/40 transition hover:text-white/70"
          >
            Falar com suporte

            <ArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.section>

        {/* CONTRACT */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.47,
          }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-white/15"
        >
          <div className="flex items-center gap-2">
            <FileText size={11} />
            Assinatura ORB-SUB-0001
          </div>

          <span className="hidden h-1 w-1 rounded-full bg-white/15 sm:block" />

          <div className="flex items-center gap-2">
            <ShieldCheck size={11} />
            Gerenciada pela Orbitta Space
          </div>
        </motion.div>
      </div>
    </div>
  );
}