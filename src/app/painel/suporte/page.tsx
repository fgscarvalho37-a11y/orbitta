"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  HelpCircle,
  LifeBuoy,
  MessageCircle,
  Paperclip,
  Pizza,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const tickets = [
  {
    id: "ORB-1042",
    title: "Alteração do domínio do PizzaSystem",
    product: "PizzaSystem",
    category: "Domínio",
    date: "14/09/2026",
    lastUpdate: "16/09/2026",
    status: "Em atendimento",
  },
  {
    id: "ORB-1021",
    title: "Dúvida sobre cobrança mensal",
    product: "PizzaSystem",
    category: "Financeiro",
    date: "02/09/2026",
    lastUpdate: "03/09/2026",
    status: "Resolvido",
  },
];

const quickHelp = [
  {
    icon: FileText,
    title: "Financeiro",
    description: "Dúvidas sobre assinatura, pagamentos e faturas.",
  },
  {
    icon: Pizza,
    title: "Produto",
    description: "Ajuda relacionada aos produtos contratados.",
  },
  {
    icon: ShieldCheck,
    title: "Domínio e acesso",
    description: "Problemas com domínio, acesso ou segurança.",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "Resolvido") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/[0.07] bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] text-emerald-200/50">
        <CheckCircle2 size={10} />
        Resolvido
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/[0.07] bg-cyan-300/[0.04] px-2.5 py-1 text-[9px] text-cyan-200/50">
      <Clock3 size={10} />
      Em atendimento
    </span>
  );
}

export default function SuportePage() {
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);

    setTimeout(() => {
      setSent(false);
      setNewTicketOpen(false);
    }, 1600);
  }

  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute right-[-180px] top-[-200px] h-[650px] w-[650px] rounded-full bg-cyan-400/[0.035] blur-[150px]" />

      <div className="pointer-events-none absolute left-[5%] top-[700px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[140px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        {/* HEADER */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-cyan-300/45">
              <LifeBuoy size={12} />
              Atendimento
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Suporte Orbitta
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              Centralize solicitações, acompanhe atendimentos e fale com a
              equipe responsável pelos seus produtos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNewTicketOpen(true)}
            className="group flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50"
          >
            <Plus size={14} />
            Nova solicitação
            <ArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </motion.section>

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative mt-10 overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#08101d]/75 p-6 sm:p-8 lg:p-10"
        >
          <div className="pointer-events-none absolute right-[-100px] top-[-130px] h-[400px] w-[400px] rounded-full bg-cyan-400/[0.07] blur-[110px]" />

          <div className="pointer-events-none absolute bottom-[-180px] left-[25%] h-[380px] w-[380px] rounded-full bg-violet-500/[0.04] blur-[120px]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/[0.08] bg-cyan-300/[0.04] text-cyan-200/60">
                <MessageCircle size={20} />
              </div>

              <h2 className="mt-7 max-w-xl text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                Como podemos ajudar?
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/30">
                Abra uma solicitação informando o produto e o assunto. O
                histórico ficará disponível aqui para você acompanhar tudo em
                um único lugar.
              </p>

              <button
                type="button"
                onClick={() => setNewTicketOpen(true)}
                className="group mt-7 flex items-center gap-2 text-xs text-cyan-200/45 transition hover:text-cyan-200/75"
              >
                Abrir atendimento
                <ChevronRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[20px] border border-white/[0.05] bg-black/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                    Chamados abertos
                  </div>

                  <Clock3 size={14} className="text-cyan-200/35" />
                </div>

                <div className="mt-4 text-2xl font-semibold">1</div>

                <div className="mt-2 text-[10px] text-white/20">
                  Atualmente em atendimento
                </div>
              </div>

              <div className="rounded-[20px] border border-white/[0.05] bg-black/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                    Resolvidos
                  </div>

                  <CheckCircle2
                    size={14}
                    className="text-emerald-200/35"
                  />
                </div>

                <div className="mt-4 text-2xl font-semibold">1</div>

                <div className="mt-2 text-[10px] text-white/20">
                  Solicitações concluídas
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* QUICK HELP */}
        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {quickHelp.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.button
                key={item.title}
                type="button"
                onClick={() => setNewTicketOpen(true)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="group rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-5 text-left transition hover:border-white/[0.09] hover:bg-[#0a1321]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.025] text-cyan-200/45">
                    <Icon size={16} />
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-white/15 transition-transform group-hover:translate-x-1 group-hover:text-white/40"
                  />
                </div>

                <h3 className="mt-5 text-sm font-medium text-white/60">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/25">
                  {item.description}
                </p>
              </motion.button>
            );
          })}
        </section>

        {/* TICKETS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.05] px-6 py-5 lg:flex-row lg:items-center">
            <div>
              <div className="text-xs font-medium text-white/60">
                Minhas solicitações
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Histórico de atendimentos da sua conta
              </div>
            </div>

            <div className="relative">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
              />

              <input
                type="search"
                placeholder="Buscar solicitação..."
                className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] pl-10 pr-4 text-xs text-white/60 outline-none placeholder:text-white/15 focus:border-cyan-300/15 sm:w-[230px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_0.9fr_50px] border-b border-white/[0.04] px-6 py-3 text-[9px] uppercase tracking-[0.13em] text-white/18">
                <span>ID</span>
                <span>Assunto</span>
                <span>Produto</span>
                <span>Categoria</span>
                <span>Atualização</span>
                <span>Status</span>
                <span />
              </div>

              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  className="group grid w-full grid-cols-[0.8fr_2fr_1fr_1fr_1fr_0.9fr_50px] items-center border-b border-white/[0.035] px-6 py-4 text-left transition last:border-0 hover:bg-white/[0.012]"
                >
                  <span className="text-xs text-white/30">
                    {ticket.id}
                  </span>

                  <div>
                    <div className="text-xs text-white/55">
                      {ticket.title}
                    </div>

                    <div className="mt-1 text-[9px] text-white/18">
                      Aberto em {ticket.date}
                    </div>
                  </div>

                  <span className="text-xs text-white/30">
                    {ticket.product}
                  </span>

                  <span className="text-xs text-white/30">
                    {ticket.category}
                  </span>

                  <span className="text-xs text-white/25">
                    {ticket.lastUpdate}
                  </span>

                  <StatusBadge status={ticket.status} />

                  <ChevronRight
                    size={14}
                    className="text-white/15 transition-transform group-hover:translate-x-1 group-hover:text-white/40"
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* INFO */}
        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="rounded-[24px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/[0.04] text-cyan-200/50">
              <Sparkles size={17} />
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Atendimento centralizado
            </h3>

            <p className="mt-3 text-xs leading-6 text-white/25">
              As conversas relacionadas aos seus produtos poderão ficar
              registradas na Orbitta, evitando que informações importantes se
              percam entre diferentes canais.
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.43 }}
            className="rounded-[24px] border border-white/[0.06] bg-[#08101d]/70 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/[0.04] text-violet-200/50">
              <HelpCircle size={17} />
            </div>

            <h3 className="mt-6 text-sm font-medium text-white/60">
              Precisa explicar melhor o problema?
            </h3>

            <p className="mt-3 text-xs leading-6 text-white/25">
              O chamado poderá receber mensagens, imagens e arquivos para
              facilitar a análise do problema pela equipe responsável.
            </p>
          </motion.article>
        </section>

        {/* DEMO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48 }}
          className="mt-5 flex gap-3 rounded-[20px] border border-amber-300/[0.05] bg-amber-300/[0.015] p-5"
        >
          <AlertCircle
            size={15}
            className="mt-0.5 shrink-0 text-amber-200/35"
          />

          <div>
            <div className="text-xs text-white/45">
              Central em desenvolvimento
            </div>

            <p className="mt-1.5 max-w-4xl text-[10px] leading-5 text-white/20">
              Os chamados exibidos atualmente são demonstrativos. Quando o
              backend for conectado, cada solicitação será vinculada ao usuário,
              cliente e produto corretos.
            </p>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/15">
          <ShieldCheck size={11} />
          Central de atendimento Orbitta Space
        </div>
      </div>

      {/* NEW TICKET MODAL */}
      {newTicketOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Fechar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setNewTicketOpen(false)}
            className="absolute inset-0 bg-[#02050b]/80 backdrop-blur-md"
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/[0.08] bg-[#08101d] shadow-[0_35px_120px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-start justify-between border-b border-white/[0.05] p-6">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-cyan-300/40">
                  <MessageCircle size={12} />
                  Suporte
                </div>

                <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em]">
                  Nova solicitação
                </h2>

                <p className="mt-2 text-xs text-white/25">
                  Conte para a Orbitta o que você precisa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNewTicketOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-white/30 transition hover:bg-white/[0.05] hover:text-white/65"
              >
                <X size={15} />
              </button>
            </div>

            {sent ? (
              <div className="flex min-h-[390px] flex-col items-center justify-center p-8 text-center">
                <motion.div
                  initial={{
                    scale: 0.7,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.04] text-emerald-200/60"
                >
                  <CheckCircle2 size={27} />
                </motion.div>

                <h3 className="mt-6 text-lg font-medium text-white/70">
                  Solicitação recebida
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-6 text-white/25">
                  Neste protótipo ela ainda não será salva. Quando conectarmos
                  o backend, o chamado será registrado na conta do cliente.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                      Produto
                    </span>

                    <select
                      required
                      defaultValue="PizzaSystem"
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/55 outline-none focus:border-cyan-300/15"
                    >
                      <option>PizzaSystem</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                      Categoria
                    </span>

                    <select
                      required
                      defaultValue=""
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/55 outline-none focus:border-cyan-300/15"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      <option>Produto</option>
                      <option>Financeiro</option>
                      <option>Domínio</option>
                      <option>Acesso</option>
                      <option>Outro</option>
                    </select>
                  </label>
                </div>

                <label className="mt-5 block">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    Assunto
                  </span>

                  <input
                    required
                    type="text"
                    placeholder="Ex: Preciso alterar meu domínio"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none placeholder:text-white/15 focus:border-cyan-300/15"
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    Mensagem
                  </span>

                  <textarea
                    required
                    rows={6}
                    placeholder="Descreva sua solicitação com o máximo de detalhes possível..."
                    className="mt-2 w-full resize-none rounded-xl border border-white/[0.06] bg-[#0b1524] p-4 text-xs leading-6 text-white/60 outline-none placeholder:text-white/15 focus:border-cyan-300/15"
                  />
                </label>

                <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-dashed border-white/[0.07] bg-white/[0.015] p-4">
                  <div className="flex items-center gap-3">
                    <Paperclip size={15} className="text-white/25" />

                    <div>
                      <div className="text-xs text-white/40">
                        Anexar arquivo
                      </div>

                      <div className="mt-1 text-[9px] text-white/18">
                        Imagens e documentos futuramente
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg border border-white/[0.05] px-3 py-2 text-[10px] text-white/30"
                  >
                    Selecionar
                  </button>
                </div>

                <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setNewTicketOpen(false)}
                    className="h-11 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 text-xs text-white/35 transition hover:bg-white/[0.04] hover:text-white/60"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50"
                  >
                    <Send size={13} />
                    Enviar solicitação
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}