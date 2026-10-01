"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LifeBuoy,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLanguage } from "@/i18n/LanguageProvider";

const API_URL = "/backend";

type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED";

type SupportTicket = {
  id: number;
  code: string;
  productName: string;
  category: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
};

type CsrfResponse = {
  token: string;
  headerName: string;
};

type ChatMessage = {
  id: number;
  role: "bot" | "user";
  text: string;
};

function statusLabel(
  status: TicketStatus,
  isEnglish: boolean
) {
  if (status === "RESOLVED") {
    return isEnglish
      ? "Resolved"
      : "Resolvido";
  }

  if (status === "IN_PROGRESS") {
    return isEnglish
      ? "In progress"
      : "Em atendimento";
  }

  return isEnglish
    ? "Open"
    : "Aberto";
}

function botAnswer(
  raw: string,
  isEnglish: boolean
) {
  const text =
    raw
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );

  if (
    text.includes("senha") ||
    text.includes("login") ||
    text.includes("acesso") ||
    text.includes("password")
  ) {
    return isEnglish
      ? "For account access, first try the password recovery link on the sign-in page. If the account is active and the issue continues, open a support ticket under Access."
      : "Para acesso à conta, tente primeiro a recuperação de senha na tela de login. Se a conta estiver ativa e o problema continuar, abra um chamado na categoria Acesso.";
  }

  if (
    text.includes("fatura") ||
    text.includes("cobranca") ||
    text.includes("assinatura") ||
    text.includes("financeiro") ||
    text.includes("invoice") ||
    text.includes("billing")
  ) {
    return isEnglish
      ? "Billing and subscription details are available in your client area under Subscriptions and Invoices. If a payment is duplicated or incorrect, open a Financial ticket so the Orbitta team can verify it."
      : "Cobranças e assinaturas ficam na área do cliente em Assinaturas e Faturas. Se houver valor duplicado ou incorreto, abra um chamado Financeiro para a equipe Orbitta conferir.";
  }

  if (
    text.includes("dominio") ||
    text.includes("url") ||
    text.includes("link") ||
    text.includes("domain")
  ) {
    return isEnglish
      ? "You can manage the public address of supported products from the Domains area. If the desired address is unavailable or not updating, open a Domain ticket."
      : "Você pode gerenciar o endereço público dos produtos compatíveis pela área Domínios. Se o endereço desejado estiver indisponível ou não atualizar, abra um chamado em Domínio.";
  }

  if (
    text.includes("stripe") ||
    text.includes("pix") ||
    text.includes("mercado pago") ||
    text.includes("pagamento") ||
    text.includes("payment")
  ) {
    return isEnglish
      ? "Store payment gateways are configured inside the product itself. PizzaSystem can route payments to the restaurant's own account. Never send secret API keys through support chat."
      : "Os gateways da loja são configurados dentro do próprio produto. O PizzaSystem direciona os recebimentos para a conta do estabelecimento. Nunca envie chaves secretas de API pelo suporte.";
  }

  if (
    text.includes("pedido") ||
    text.includes("cozinha") ||
    text.includes("cardapio") ||
    text.includes("delivery") ||
    text.includes("order") ||
    text.includes("menu") ||
    text.includes("kitchen")
  ) {
    return isEnglish
      ? "For PizzaSystem operational issues, include what you were doing, the affected order or screen, and the approximate time. Do not include passwords or payment secrets. If needed, open a Product ticket below."
      : "Para problemas operacionais do PizzaSystem, informe o que estava fazendo, a tela ou pedido afetado e o horário aproximado. Não envie senhas nem segredos de pagamento. Se precisar, abra um chamado de Produto abaixo.";
  }

  if (
    text.includes("condoflow") ||
    text.includes("portaria") ||
    text.includes("reserva")
  ) {
    return isEnglish
      ? "For CondoFlow, tell us whether the issue is in the manager or front-desk profile and which operation failed. You can also open a Product ticket for human review."
      : "No CondoFlow, informe se o problema aconteceu no perfil de síndico ou portaria e qual operação falhou. Você também pode abrir um chamado de Produto para análise humana.";
  }

  return isEnglish
    ? "I couldn't identify a safe automatic answer for that. You can open a support ticket below and the Orbitta team will receive it in the admin panel."
    : "Não consegui identificar uma resposta automática segura para isso. Você pode abrir um chamado abaixo e a equipe Orbitta receberá no painel administrativo.";
}

export default function SupportPage() {
  const {
    isEnglish,
    text,
  } = useLanguage();

  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [ticketOpen, setTicketOpen] =
    useState(false);
  const [saving, setSaving] =
    useState(false);

  const [productName, setProductName] =
    useState("PizzaSystem");
  const [category, setCategory] =
    useState("Produto");
  const [subject, setSubject] =
    useState("");
  const [message, setMessage] =
    useState("");

  const [chatInput, setChatInput] =
    useState("");
  const [messages, setMessages] =
    useState<ChatMessage[]>([
      {
        id: 1,
        role: "bot",
        text:
          "Olá! Sou o assistente de suporte da Orbitta. Posso orientar sobre acesso, cobrança, domínio, PizzaSystem e CondoFlow. Não envie senhas ou chaves secretas.",
      },
    ]);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: "bot",
        text: text(
          "Olá! Sou o assistente de suporte da Orbitta. Posso orientar sobre acesso, cobrança, domínio, PizzaSystem e CondoFlow. Não envie senhas ou chaves secretas.",
          "Hi! I'm Orbitta's support assistant. I can help with access, billing, domains, PizzaSystem and CondoFlow. Never send passwords or secret keys."
        ),
      },
    ]);
  }, [isEnglish]);

  async function loadTickets() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/support/tickets`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          text(
            "Não foi possível carregar seus chamados.",
            "We could not load your tickets."
          )
        );
      }

      setTickets(
        await response.json()
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível carregar o suporte.",
              "We could not load support."
            )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  const counts = useMemo(
    () => ({
      open: tickets.filter(
        (ticket) =>
          ticket.status !== "RESOLVED"
      ).length,
      resolved: tickets.filter(
        (ticket) =>
          ticket.status === "RESOLVED"
      ).length,
    }),
    [tickets]
  );

  function sendBotMessage(
    event: FormEvent
  ) {
    event.preventDefault();

    const value =
      chatInput.trim();

    if (!value) {
      return;
    }

    const id = Date.now();

    setMessages(
      (current) => [
        ...current,
        {
          id,
          role: "user",
          text: value,
        },
        {
          id: id + 1,
          role: "bot",
          text: botAnswer(
            value,
            isEnglish
          ),
        },
      ]
    );

    setChatInput("");
  }

  async function createTicket(
    event: FormEvent
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const csrfResponse =
        await fetch(
          `${API_URL}/api/csrf`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (!csrfResponse.ok) {
        throw new Error(
          text(
            "Não foi possível preparar o chamado.",
            "We could not prepare the ticket."
          )
        );
      }

      const csrf: CsrfResponse =
        await csrfResponse.json();

      const response = await fetch(
        `${API_URL}/api/support/tickets`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
            [csrf.headerName]:
              csrf.token,
          },
          body: JSON.stringify({
            productName,
            category,
            subject,
            message,
          }),
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            text(
              "Não foi possível enviar o chamado.",
              "We could not send the ticket."
            )
        );
      }

      setSubject("");
      setMessage("");
      setTicketOpen(false);
      await loadTickets();

    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível enviar o chamado.",
              "We could not send the ticket."
            )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute right-[-180px] top-[-200px] h-[650px] w-[650px] rounded-full bg-cyan-400/[0.035] blur-[150px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-cyan-300/45">
              <LifeBuoy size={12} />
              {text(
                "Atendimento",
                "Support"
              )}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              {text(
                "Suporte Orbitta",
                "Orbitta Support"
              )}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              {text(
                "Converse com o assistente para dúvidas rápidas ou abra um chamado real para a equipe Orbitta.",
                "Ask the assistant for quick help or open a real ticket for the Orbitta team."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setTicketOpen(true)
            }
            className="flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50"
          >
            <Plus size={14} />
            {text(
              "Abrir chamado",
              "Open ticket"
            )}
          </button>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-300/10 bg-red-300/[0.04] p-4 text-xs leading-5 text-red-100/70">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#08101d]/80">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] text-cyan-200/60">
                  <Bot size={17} />
                </div>

                <div>
                  <div className="text-sm font-medium text-white/70">
                    Orbitta Assist
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-emerald-200/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {text(
                      "Resposta automática",
                      "Automated help"
                    )}
                  </div>
                </div>
              </div>

              <ShieldCheck
                size={16}
                className="text-white/20"
              />
            </div>

            <div className="h-[360px] space-y-4 overflow-y-auto p-5 sm:p-6">
              {messages.map(
                (item) => (
                  <div
                    key={item.id}
                    className={
                      item.role === "user"
                        ? "ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-cyan-300 px-4 py-3 text-xs leading-5 text-[#07101c]"
                        : "max-w-[86%] rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-xs leading-5 text-white/52"
                    }
                  >
                    {item.text}
                  </div>
                )
              )}
            </div>

            <form
              onSubmit={sendBotMessage}
              className="flex gap-2 border-t border-white/[0.05] p-4"
            >
              <input
                value={chatInput}
                onChange={(event) =>
                  setChatInput(
                    event.target.value
                  )
                }
                maxLength={600}
                placeholder={text(
                  "Ex: meu domínio não atualizou...",
                  "E.g. my domain did not update..."
                )}
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 text-xs text-white/70 outline-none placeholder:text-white/18 focus:border-cyan-300/20"
              />

              <button
                type="submit"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#07101c] transition hover:bg-cyan-50"
                aria-label={text(
                  "Enviar mensagem",
                  "Send message"
                )}
              >
                <Send size={15} />
              </button>
            </form>
          </article>

          <div className="grid gap-5">
            <article className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#08101d]/80 p-6">
              <div className="absolute right-[-80px] top-[-100px] h-56 w-56 rounded-full bg-violet-500/[0.06] blur-[80px]" />

              <div className="relative">
                <Sparkles
                  size={18}
                  className="text-violet-200/50"
                />

                <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
                  {text(
                    "Precisa de uma pessoa?",
                    "Need a person?"
                  )}
                </h2>

                <p className="mt-3 text-xs leading-6 text-white/30">
                  {text(
                    "Abra um chamado. Ele fica registrado na sua conta e aparece diretamente no painel administrativo da Orbitta.",
                    "Open a ticket. It is saved to your account and appears directly in Orbitta's admin panel."
                  )}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setTicketOpen(true)
                  }
                  className="mt-6 flex items-center gap-2 text-xs font-medium text-cyan-200/55 transition hover:text-cyan-100"
                >
                  {text(
                    "Novo chamado",
                    "New ticket"
                  )}
                  <ArrowRight size={13} />
                </button>
              </div>
            </article>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-5">
                <Clock3
                  size={14}
                  className="text-cyan-200/35"
                />
                <div className="mt-4 text-2xl font-semibold">
                  {counts.open}
                </div>
                <div className="mt-1 text-[10px] text-white/22">
                  {text(
                    "em andamento",
                    "active tickets"
                  )}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/[0.06] bg-[#08101d]/70 p-5">
                <CheckCircle2
                  size={14}
                  className="text-emerald-200/35"
                />
                <div className="mt-4 text-2xl font-semibold">
                  {counts.resolved}
                </div>
                <div className="mt-1 text-[10px] text-white/22">
                  {text(
                    "resolvidos",
                    "resolved"
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70">
          <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
            <div>
              <div className="text-xs font-medium text-white/60">
                {text(
                  "Meus chamados",
                  "My tickets"
                )}
              </div>
              <div className="mt-1 text-[10px] text-white/20">
                {text(
                  "Histórico real da sua conta",
                  "Real account support history"
                )}
              </div>
            </div>

            <TicketCheck
              size={17}
              className="text-white/20"
            />
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2
                size={20}
                className="animate-spin text-cyan-300/50"
              />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center">
              <MessageCircle
                size={22}
                className="mx-auto text-white/18"
              />
              <p className="mt-4 text-xs text-white/28">
                {text(
                  "Você ainda não abriu nenhum chamado.",
                  "You haven't opened any tickets yet."
                )}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {tickets.map(
                (ticket) => (
                  <article
                    key={ticket.id}
                    className="grid gap-4 px-6 py-5 md:grid-cols-[0.65fr_2fr_1fr_1fr_36px] md:items-center"
                  >
                    <span className="text-[11px] text-white/28">
                      {ticket.code}
                    </span>

                    <div>
                      <div className="text-xs text-white/60">
                        {ticket.subject}
                      </div>
                      <div className="mt-1 text-[9px] text-white/18">
                        {ticket.productName}
                        {" · "}
                        {ticket.category}
                      </div>
                    </div>

                    <span className="text-[10px] text-white/25">
                      {new Intl.DateTimeFormat(
                        isEnglish
                          ? "en-US"
                          : "pt-BR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      ).format(
                        new Date(
                          ticket.updatedAt
                        )
                      )}
                    </span>

                    <span
                      className={
                        ticket.status ===
                        "RESOLVED"
                          ? "w-fit rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] text-emerald-200/55"
                          : "w-fit rounded-full border border-cyan-300/10 bg-cyan-300/[0.04] px-2.5 py-1 text-[9px] text-cyan-200/55"
                      }
                    >
                      {statusLabel(
                        ticket.status,
                        isEnglish
                      )}
                    </span>

                    <ChevronRight
                      size={14}
                      className="text-white/15"
                    />
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-white/15">
          <ShieldCheck size={11} />
          {text(
            "Não compartilhe senhas, tokens ou chaves secretas no suporte.",
            "Never share passwords, tokens or secret keys in support."
          )}
        </div>
      </div>

      {ticketOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() =>
              setTicketOpen(false)
            }
            className="absolute inset-0 bg-[#02050b]/80 backdrop-blur-md"
            aria-label={text(
              "Fechar",
              "Close"
            )}
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            className="relative z-10 w-full max-w-2xl rounded-[28px] border border-white/[0.08] bg-[#08101d] shadow-[0_35px_120px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-start justify-between border-b border-white/[0.05] p-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/40">
                  {text(
                    "Suporte humano",
                    "Human support"
                  )}
                </div>
                <h2 className="mt-3 text-xl font-semibold">
                  {text(
                    "Abrir chamado",
                    "Open ticket"
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTicketOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.02] text-white/30"
              >
                <X size={15} />
              </button>
            </div>

            <form
              onSubmit={createTicket}
              className="p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    {text(
                      "Produto",
                      "Product"
                    )}
                  </span>
                  <select
                    value={productName}
                    onChange={(event) =>
                      setProductName(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none"
                  >
                    <option>
                      PizzaSystem
                    </option>
                    <option>
                      CondoFlow
                    </option>
                    <option>
                      Orbitta
                    </option>
                  </select>
                </label>

                <label>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                    {text(
                      "Categoria",
                      "Category"
                    )}
                  </span>
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/60 outline-none"
                  >
                    <option>Produto</option>
                    <option>Financeiro</option>
                    <option>Domínio</option>
                    <option>Acesso</option>
                    <option>Pagamento</option>
                    <option>Outro</option>
                  </select>
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  {text(
                    "Assunto",
                    "Subject"
                  )}
                </span>
                <input
                  required
                  maxLength={160}
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.06] bg-[#0b1524] px-4 text-xs text-white/65 outline-none focus:border-cyan-300/15"
                />
              </label>

              <label className="mt-5 block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                  {text(
                    "Mensagem",
                    "Message"
                  )}
                </span>
                <textarea
                  required
                  maxLength={4000}
                  rows={6}
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder={text(
                    "Descreva o problema sem incluir senhas ou chaves secretas.",
                    "Describe the issue without including passwords or secret keys."
                  )}
                  className="mt-2 w-full resize-none rounded-xl border border-white/[0.06] bg-[#0b1524] p-4 text-xs leading-6 text-white/65 outline-none placeholder:text-white/15 focus:border-cyan-300/15"
                />
              </label>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTicketOpen(false)
                  }
                  className="h-11 rounded-xl border border-white/[0.06] px-5 text-xs text-white/40"
                >
                  {text(
                    "Cancelar",
                    "Cancel"
                  )}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={13} />
                  )}
                  {text(
                    "Enviar chamado",
                    "Send ticket"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
