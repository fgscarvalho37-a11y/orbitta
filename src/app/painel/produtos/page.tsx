"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Globe2,
  MoreHorizontal,
  Pizza,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const products = [
  {
    id: "pizzasystem",
    name: "PizzaSystem",
    category: "Food Commerce Platform",
    description:
      "Plataforma para centralizar pedidos, pagamentos e a operação digital do seu negócio.",
    plan: "Business",
    price: "R$ 149,90",
    billingCycle: "Mensal",
    nextBilling: "05/10/2026",
    domain: "pizzariaexemplo.com.br",
    status: "Ativo",
    appStatus: "Online",
    databaseStatus: "Online",
  },
];

const availableProducts = [
  {
    name: "CondoFlow",
    category: "Condominium Platform",
    href: "/produtos/condoflow",
  },
  {
    name: "VitalSync",
    category: "Health Platform",
    href: "/produtos/vitalsync",
  },
  {
    name: "CafeFlow",
    category: "Food Service Platform",
    href: "/produtos/cafeflow",
  },
];

export default function ProdutosPage() {
  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute right-[-180px] top-[-150px] h-[600px] w-[600px] rounded-full bg-cyan-400/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[10%] top-[500px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[140px]" />

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
              <Sparkles size={12} />
              Produtos
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Meus produtos
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              Gerencie os produtos Orbitta vinculados à sua conta, planos,
              domínios e serviços relacionados.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-4 py-2 text-[10px] text-emerald-200/45">
            <CheckCircle2 size={13} />
            1 produto ativo
          </div>
        </motion.section>

        {/* PRODUCT */}
        <section className="mt-10 space-y-5">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.08 + index * 0.08,
              }}
              className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#08101d]/75"
            >
              {/* GLOWS */}
              <div className="pointer-events-none absolute right-[-150px] top-[-150px] h-[420px] w-[420px] rounded-full bg-cyan-400/[0.065] blur-[120px]" />

              <div className="pointer-events-none absolute bottom-[-200px] left-[20%] h-[400px] w-[400px] rounded-full bg-violet-500/[0.035] blur-[130px]" />

              {/* TOP */}
              <div className="relative flex flex-col justify-between gap-7 border-b border-white/[0.05] p-6 sm:p-8 lg:flex-row lg:items-start">
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-300 via-red-400 to-violet-500 text-[#090b12] shadow-[0_15px_45px_rgba(251,146,60,0.12)]">
                    <Pizza size={27} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                        {product.name}
                      </h2>

                      <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.04] px-3 py-1 text-[9px] uppercase tracking-[0.12em] text-emerald-200/55">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
                        {product.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-white/20">
                      {product.category}
                    </div>

                    <p className="mt-5 max-w-2xl text-sm leading-6 text-white/35">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/30 transition hover:bg-white/[0.05] hover:text-white/65"
                    aria-label="Mais opções"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>
              </div>

              {/* DATA */}
              <div className="relative grid gap-px bg-white/[0.05] sm:grid-cols-2 xl:grid-cols-4">
                <div className="bg-[#08101d] p-6">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                    <Sparkles size={13} />
                    Plano atual
                  </div>

                  <div className="mt-4 text-lg font-medium text-white/75">
                    {product.plan}
                  </div>

                  <Link
                    href="/painel/assinaturas"
                    className="mt-3 inline-flex items-center gap-2 text-[10px] text-cyan-300/40 transition hover:text-cyan-200"
                  >
                    Ver assinatura
                    <ArrowRight size={11} />
                  </Link>
                </div>

                <div className="bg-[#08101d] p-6">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                    <CreditCard size={13} />
                    Mensalidade
                  </div>

                  <div className="mt-4 text-lg font-medium text-white/75">
                    {product.price}
                  </div>

                  <div className="mt-3 text-[10px] text-white/20">
                    Cobrança {product.billingCycle.toLowerCase()}
                  </div>
                </div>

                <div className="bg-[#08101d] p-6">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                    <CalendarDays size={13} />
                    Próxima renovação
                  </div>

                  <div className="mt-4 text-lg font-medium text-white/75">
                    {product.nextBilling}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/20">
                    <Clock3 size={11} />
                    Renovação automática
                  </div>
                </div>

                <div className="bg-[#08101d] p-6">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                    <Globe2 size={13} />
                    Domínio
                  </div>

                  <div className="mt-4 truncate text-sm font-medium text-white/75">
                    {product.domain}
                  </div>

                  <Link
                    href="/painel/dominios"
                    className="mt-3 inline-flex items-center gap-2 text-[10px] text-cyan-300/40 transition hover:text-cyan-200"
                  >
                    Gerenciar domínio
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* INFRASTRUCTURE */}
              <div className="relative grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_auto] xl:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Server size={15} className="text-white/25" />

                    <h3 className="text-xs font-medium text-white/55">
                      Infraestrutura do produto
                    </h3>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] px-4 py-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300/[0.04] text-emerald-200/50">
                        <Check size={13} />
                      </div>

                      <div>
                        <div className="text-[10px] text-white/25">
                          Aplicação
                        </div>

                        <div className="mt-1 text-xs text-white/55">
                          {product.appStatus}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] px-4 py-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300/[0.04] text-emerald-200/50">
                        <Check size={13} />
                      </div>

                      <div>
                        <div className="text-[10px] text-white/25">
                          Banco de dados
                        </div>

                        <div className="mt-1 text-xs text-white/55">
                          {product.databaseStatus}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.018] px-4 py-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300/[0.04] text-cyan-200/50">
                        <ShieldCheck size={13} />
                      </div>

                      <div>
                        <div className="text-[10px] text-white/25">
                          Segurança
                        </div>

                        <div className="mt-1 text-xs text-white/55">
                          Protegido
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <button
                    type="button"
                    className="group flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/75"
                  >
                    Acessar sistema

                    <ExternalLink
                      size={13}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </button>

                  <button
                    type="button"
                    className="group flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50"
                  >
                    Gerenciar produto

                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        {/* PRODUCT DETAILS */}
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.42fr]">
          {/* MANAGEMENT */}
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
            className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="border-b border-white/[0.05] px-6 py-5">
              <div className="text-xs font-medium text-white/60">
                Gerenciamento
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Serviços vinculados ao PizzaSystem
              </div>
            </div>

            <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2">
              <Link
                href="/painel/assinaturas"
                className="group bg-[#08101d] p-6 transition hover:bg-[#0a1321]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/[0.05] text-violet-200/55">
                    <CreditCard size={17} />
                  </div>

                  <ArrowUpRight
                    size={15}
                    className="text-white/15 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/45"
                  />
                </div>

                <h3 className="mt-6 text-sm font-medium text-white/65">
                  Assinatura
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/25">
                  Plano, ciclo de cobrança, renovação e detalhes da assinatura.
                </p>
              </Link>

              <Link
                href="/painel/dominios"
                className="group bg-[#08101d] p-6 transition hover:bg-[#0a1321]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/[0.05] text-cyan-200/55">
                    <Globe2 size={17} />
                  </div>

                  <ArrowUpRight
                    size={15}
                    className="text-white/15 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/45"
                  />
                </div>

                <h3 className="mt-6 text-sm font-medium text-white/65">
                  Domínio
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/25">
                  Acompanhe o domínio conectado ao produto e sua renovação.
                </p>
              </Link>

              <Link
                href="/painel/pagamentos"
                className="group bg-[#08101d] p-6 transition hover:bg-[#0a1321]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/[0.05] text-emerald-200/55">
                    <CreditCard size={17} />
                  </div>

                  <ArrowUpRight
                    size={15}
                    className="text-white/15 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/45"
                  />
                </div>

                <h3 className="mt-6 text-sm font-medium text-white/65">
                  Pagamentos
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/25">
                  Método de pagamento e cobranças relacionadas ao produto.
                </p>
              </Link>

              <Link
                href="/painel/configuracoes"
                className="group bg-[#08101d] p-6 transition hover:bg-[#0a1321]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-white/45">
                    <Settings2 size={17} />
                  </div>

                  <ArrowUpRight
                    size={15}
                    className="text-white/15 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/45"
                  />
                </div>

                <h3 className="mt-6 text-sm font-medium text-white/65">
                  Configurações
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/25">
                  Preferências e informações vinculadas à sua conta Orbitta.
                </p>
              </Link>
            </div>
          </motion.div>

          {/* PRODUCT HEALTH */}
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
              delay: 0.28,
            }}
            className="relative overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-emerald-400/[0.045] blur-[70px]" />

            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/[0.07] bg-emerald-300/[0.035] text-emerald-200/55">
                <Activity size={18} />
              </div>

              <p className="mt-7 text-[10px] uppercase tracking-[0.2em] text-white/25">
                Status do produto
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                Operacional
              </h3>

              <p className="mt-3 text-xs leading-5 text-white/25">
                Todos os serviços monitorados do PizzaSystem estão funcionando
                normalmente.
              </p>

              <div className="my-6 h-px bg-white/[0.05]" />

              <div className="space-y-4">
                {[
                  ["Aplicação", "Online"],
                  ["Banco de dados", "Online"],
                  ["Domínio", "Ativo"],
                  ["SSL", "Ativo"],
                ].map(([name, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-white/30">
                      {name}
                    </span>

                    <span className="flex items-center gap-2 text-[10px] text-emerald-200/45">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* OTHER ORBITTA PRODUCTS */}
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
            delay: 0.34,
          }}
          className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.05] px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs font-medium text-white/60">
                Ecossistema Orbitta
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Outros produtos em desenvolvimento
              </div>
            </div>

            <Link
              href="/#produtos"
              className="group flex items-center gap-2 text-xs text-white/30 transition hover:text-white/65"
            >
              Conhecer produtos
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid gap-px bg-white/[0.05] md:grid-cols-3">
            {availableProducts.map((product) => (
              <Link
                key={product.name}
                href={product.href}
                className="group bg-[#08101d] p-6 transition hover:bg-[#0a1321]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-medium text-white/60 transition group-hover:text-white/80">
                      {product.name}
                    </div>

                    <div className="mt-2 text-[9px] uppercase tracking-[0.15em] text-white/18">
                      {product.category}
                    </div>
                  </div>

                  <ArrowUpRight
                    size={15}
                    className="text-white/15 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-200/50"
                  />
                </div>

                <div className="mt-8 flex items-center gap-2 text-[10px] text-amber-200/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300/60" />
                  Em desenvolvimento
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/15">
          <ShieldCheck size={12} />
          Produtos e serviços gerenciados pela Orbitta Space
        </div>
      </div>
    </div>
  );
}