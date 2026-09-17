"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Globe2,
  KeyRound,
  Link2,
  LockKeyhole,
  MoreHorizontal,
  Pizza,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const dnsRecords = [
  {
    type: "A",
    name: "@",
    value: "76.76.21.21",
    status: "Ativo",
  },
  {
    type: "CNAME",
    name: "www",
    value: "cname.orbitta.space",
    status: "Ativo",
  },
  {
    type: "TXT",
    name: "_orbitta",
    value: "orbitta-verification=ps_8f42...",
    status: "Verificado",
  },
];

const domainTimeline = [
  {
    title: "Domínio conectado",
    detail: "Configuração concluída",
    date: "05/07/2026",
    completed: true,
  },
  {
    title: "SSL emitido",
    detail: "Certificado ativado",
    date: "05/07/2026",
    completed: true,
  },
  {
    title: "Próxima renovação",
    detail: "Acompanhar renovação do domínio",
    date: "05/07/2027",
    completed: false,
  },
];

export default function DominiosPage() {
  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute right-[-180px] top-[-200px] h-[650px] w-[650px] rounded-full bg-cyan-400/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[5%] top-[650px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[140px]" />

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
              <Globe2 size={12} />
              Domínios
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Domínios e conexões
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              Acompanhe os domínios vinculados aos seus produtos, certificados
              de segurança e configurações de conexão.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-4 py-2 text-[10px] text-emerald-200/45">
            <CheckCircle2 size={13} />
            1 domínio conectado
          </div>
        </motion.section>

        {/* DOMAIN MAIN CARD */}
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
          <div className="pointer-events-none absolute right-[-120px] top-[-160px] h-[450px] w-[450px] rounded-full bg-cyan-400/[0.065] blur-[120px]" />

          <div className="pointer-events-none absolute bottom-[-180px] left-[20%] h-[380px] w-[380px] rounded-full bg-violet-500/[0.035] blur-[120px]" />

          {/* TOP */}
          <div className="relative flex flex-col justify-between gap-7 border-b border-white/[0.05] p-6 sm:p-8 lg:flex-row lg:items-start">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-cyan-300/[0.08] bg-cyan-300/[0.04] text-cyan-200/60">
                <Globe2 size={27} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="break-all text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
                    pizzariaexemplo.com.br
                  </h2>

                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.04] px-3 py-1 text-[9px] uppercase tracking-[0.12em] text-emerald-200/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
                    Ativo
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-white/22">
                  <div className="flex items-center gap-2">
                    <Link2 size={12} />
                    Domínio principal
                  </div>

                  <span className="hidden h-1 w-1 rounded-full bg-white/15 sm:block" />

                  <div className="flex items-center gap-2">
                    <Pizza size={12} />
                    PizzaSystem
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-sm leading-6 text-white/35">
                  Domínio conectado à aplicação PizzaSystem e utilizado como
                  endereço principal do site público do estabelecimento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="group flex h-10 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 text-xs text-white/40 transition hover:bg-white/[0.05] hover:text-white/70"
              >
                Abrir site

                <ExternalLink
                  size={12}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>

              <button
                type="button"
                aria-label="Mais opções"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/25 transition hover:text-white/60"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* DOMAIN INFO */}
          <div className="relative grid gap-px bg-white/[0.05] sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-[#08101d] p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                <CheckCircle2 size={13} />
                Status
              </div>

              <div className="mt-4 text-lg font-medium text-emerald-200/65">
                Conectado
              </div>

              <div className="mt-2 text-[10px] text-white/20">
                Respondendo normalmente
              </div>
            </div>

            <div className="bg-[#08101d] p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                <LockKeyhole size={13} />
                Certificado SSL
              </div>

              <div className="mt-4 text-lg font-medium text-white/70">
                Ativo
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-200/40">
                <Check size={10} />
                HTTPS protegido
              </div>
            </div>

            <div className="bg-[#08101d] p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                <CalendarDays size={13} />
                Renovação
              </div>

              <div className="mt-4 text-lg font-medium text-white/70">
                05/07/2027
              </div>

              <div className="mt-2 text-[10px] text-white/20">
                Acompanhar vencimento
              </div>
            </div>

            <div className="bg-[#08101d] p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
                <Server size={13} />
                Produto
              </div>

              <div className="mt-4 text-lg font-medium text-white/70">
                PizzaSystem
              </div>

              <Link
                href="/painel/produtos"
                className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-cyan-300/40 transition hover:text-cyan-200"
              >
                Ver produto
                <ArrowRight size={10} />
              </Link>
            </div>
          </div>

          {/* SSL */}
          <div className="relative flex flex-col justify-between gap-5 p-6 sm:p-8 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/[0.07] bg-emerald-300/[0.035] text-emerald-200/55">
                <ShieldCheck size={17} />
              </div>

              <div>
                <div className="text-xs font-medium text-white/60">
                  Conexão protegida
                </div>

                <p className="mt-1.5 max-w-2xl text-[10px] leading-5 text-white/25">
                  O domínio está configurado para utilizar HTTPS. O certificado
                  SSL protege a comunicação entre o visitante e a aplicação.
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.03] px-3 py-2 text-[9px] text-emerald-200/45">
              <KeyRound size={11} />
              SSL válido
            </div>
          </div>
        </motion.section>

        {/* STATUS CARDS */}
        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Globe2,
              label: "DNS",
              value: "Configurado",
              detail: "Registros encontrados",
            },
            {
              icon: LockKeyhole,
              label: "HTTPS",
              value: "Protegido",
              detail: "Certificado ativo",
            },
            {
              icon: RefreshCw,
              label: "Conexão",
              value: "Operacional",
              detail: "Domínio respondendo",
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
                  delay: 0.16 + index * 0.05,
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

        {/* DNS + TIMELINE */}
        <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.55fr]">
          {/* DNS */}
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
              delay: 0.32,
            }}
            className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.05] px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                  <Server size={14} />
                  Configuração DNS
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  Registros utilizados para conectar o domínio
                </div>
              </div>

              <div className="flex items-center gap-2 text-[9px] text-emerald-200/40">
                <CheckCircle2 size={11} />
                Configuração válida
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-[0.65fr_1fr_2fr_0.8fr_50px] border-b border-white/[0.04] px-6 py-3 text-[9px] uppercase tracking-[0.13em] text-white/18">
                  <span>Tipo</span>
                  <span>Nome</span>
                  <span>Destino / Valor</span>
                  <span>Status</span>
                  <span />
                </div>

                {dnsRecords.map((record) => (
                  <div
                    key={`${record.type}-${record.name}`}
                    className="grid grid-cols-[0.65fr_1fr_2fr_0.8fr_50px] items-center border-b border-white/[0.035] px-6 py-4 last:border-0"
                  >
                    <span className="w-fit rounded-lg border border-cyan-300/[0.06] bg-cyan-300/[0.03] px-2 py-1 text-[9px] font-medium text-cyan-200/45">
                      {record.type}
                    </span>

                    <span className="font-mono text-xs text-white/40">
                      {record.name}
                    </span>

                    <span className="truncate pr-5 font-mono text-[11px] text-white/35">
                      {record.value}
                    </span>

                    <span className="flex w-fit items-center gap-1.5 text-[9px] text-emerald-200/45">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {record.status}
                    </span>

                    <button
                      type="button"
                      aria-label={`Copiar registro ${record.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 transition hover:bg-white/[0.04] hover:text-white/55"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/[0.04] px-6 py-4">
              <p className="max-w-3xl text-[10px] leading-5 text-white/20">
                Alterações nos registros DNS podem levar algum tempo para serem
                propagadas pelos provedores de internet.
              </p>
            </div>
          </motion.article>

          {/* TIMELINE */}
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
              delay: 0.38,
            }}
            className="rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="border-b border-white/[0.05] px-6 py-5">
              <div className="text-xs font-medium text-white/60">
                Ciclo do domínio
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Conexão, segurança e renovação
              </div>
            </div>

            <div className="p-6">
              <div className="relative">
                <div className="absolute bottom-5 left-[15px] top-5 w-px bg-white/[0.06]" />

                <div className="space-y-7">
                  {domainTimeline.map((item) => (
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
                          <CalendarDays size={12} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="text-xs text-white/55">
                          {item.title}
                        </div>

                        <div className="mt-1.5 text-[10px] text-white/22">
                          {item.detail}
                        </div>

                        <div className="mt-2 text-[9px] text-white/15">
                          {item.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        </section>

        {/* MANAGEMENT */}
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
            delay: 0.43,
          }}
          className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
        >
          <div className="border-b border-white/[0.05] px-6 py-5">
            <div className="text-xs font-medium text-white/60">
              Gerenciamento do domínio
            </div>

            <div className="mt-1 text-[10px] text-white/20">
              Informações e ações relacionadas à conexão
            </div>
          </div>

          <div className="grid gap-px bg-white/[0.05] md:grid-cols-3">
            <button
              type="button"
              className="group bg-[#08101d] p-6 text-left transition hover:bg-[#0a1321]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/[0.04] text-cyan-200/50">
                  <RefreshCw size={17} />
                </div>

                <ChevronRight
                  size={14}
                  className="text-white/15 transition-transform group-hover:translate-x-1 group-hover:text-white/40"
                />
              </div>

              <h3 className="mt-6 text-sm font-medium text-white/60">
                Verificar conexão
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/25">
                Verifique futuramente se os registros necessários continuam
                apontando corretamente.
              </p>
            </button>

            <button
              type="button"
              className="group bg-[#08101d] p-6 text-left transition hover:bg-[#0a1321]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/[0.04] text-emerald-200/50">
                  <ShieldCheck size={17} />
                </div>

                <ChevronRight
                  size={14}
                  className="text-white/15 transition-transform group-hover:translate-x-1 group-hover:text-white/40"
                />
              </div>

              <h3 className="mt-6 text-sm font-medium text-white/60">
                Certificado SSL
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/25">
                Consulte o estado da proteção HTTPS vinculada ao endereço.
              </p>
            </button>

            <Link
              href="/painel/suporte"
              className="group bg-[#08101d] p-6 transition hover:bg-[#0a1321]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/[0.04] text-violet-200/50">
                  <Sparkles size={17} />
                </div>

                <ChevronRight
                  size={14}
                  className="text-white/15 transition-transform group-hover:translate-x-1 group-hover:text-white/40"
                />
              </div>

              <h3 className="mt-6 text-sm font-medium text-white/60">
                Solicitar alteração
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/25">
                Solicite suporte para conectar ou alterar o domínio do produto.
              </p>
            </Link>
          </div>
        </motion.section>

        {/* IMPORTANT */}
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
              Gerenciamento do domínio
            </div>

            <p className="mt-1.5 max-w-4xl text-[10px] leading-5 text-white/20">
              Nesta etapa, as informações exibidas são demonstrativas. A
              renovação e propriedade do domínio dependerão do provedor em que
              ele estiver registrado. A Orbitta poderá administrar a conexão
              entre o domínio e os produtos contratados.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/15">
          <ShieldCheck size={11} />
          Domínios conectados aos serviços Orbitta Space
        </div>
      </div>
    </div>
  );
}