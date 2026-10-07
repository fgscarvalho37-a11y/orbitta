"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  Send,
  Sparkles,
} from "lucide-react";
import {
  useState,
} from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";
import { secureFetch } from "@/lib/secureFetch";

const API_URL =
  "/backend";

type ProjectType =
  | "LANDING_PAGE"
  | "BUSINESS_SITE"
  | "ECOMMERCE"
  | "SITE_PLUS_PIZZASYSTEM"
  | "OTHER";

export default function QuoteRequestPage() {
  const {
    text,
  } =
    useLanguage();

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    company,
    setCompany,
  ] =
    useState("");

  const [
    projectType,
    setProjectType,
  ] =
    useState<ProjectType>(
      "BUSINESS_SITE"
    );

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    sending,
    setSending,
  ] =
    useState(
      false
    );

  const [
    sent,
    setSent,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState("");

  async function submit() {
    if (
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      setError(
        text(
          "Preencha nome, e-mail e detalhes do projeto.",
          "Fill in your name, email and project details."
        )
      );
      return;
    }

    try {
      setSending(
        true
      );
      setError(
        ""
      );

      const response =
        await secureFetch(
          `${API_URL}/api/quote-requests`,
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body:
              JSON.stringify({
                name:
                  name.trim(),
                email:
                  email.trim(),
                phone:
                  phone.trim() ||
                  null,
                company:
                  company.trim() ||
                  null,
                projectType,
                message:
                  message.trim(),
              }),
          }
        );

      const body =
        await response
          .json()
          .catch(
            () =>
              null
          );

      if (!response.ok) {
        throw new Error(
          body?.message ??
            text(
              "Não foi possível enviar o orçamento.",
              "Could not send your quote request."
            )
        );
      }

      setSent(
        true
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível enviar o orçamento.",
              "Could not send your quote request."
            )
      );
    } finally {
      setSending(
        false
      );
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="orbitta-grid absolute inset-0 opacity-20" />
        <div className="absolute left-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-violet-500/[0.08] blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[620px] w-[620px] rounded-full bg-cyan-400/[0.07] blur-[130px]" />
      </div>

      <header className="relative z-20 border-b border-white/[0.05]">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6">
          <Link
            href="/sites-avulsos"
            className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70"
          >
            <ArrowLeft
              size={15}
            />
            Orbitta
          </Link>

          <LanguageSwitcher compact />
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-[1280px] gap-12 px-6 py-16 lg:grid-cols-[0.82fr_1.18fr] lg:py-24">
        <div className="lg:pt-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
            <Sparkles
              size={13}
            />
            {text(
              "Orçamento sem compromisso",
              "No-obligation quote"
            )}
          </div>

          <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
            {text(
              "Conte o que você precisa.",
              "Tell us what you need."
            )}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/42">
            {text(
              "Não precisa criar conta. Envie os dados do projeto e a solicitação chega diretamente ao painel administrativo da Orbitta para análise e contato.",
              "No account is required. Send your project details and the request goes directly to the Orbitta admin dashboard for review and follow-up."
            )}
          </p>

          <div className="mt-8 space-y-3 text-sm text-white/35">
            <p>
              • {text(
                "Landing page ou site institucional",
                "Landing page or business website"
              )}
            </p>
            <p>
              • {text(
                "Site avulso ou integração com PizzaSystem",
                "Standalone site or PizzaSystem integration"
              )}
            </p>
            <p>
              • {text(
                "Valor definido conforme escopo e complexidade",
                "Pricing based on scope and complexity"
              )}
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/[0.07] bg-[#08101d]/95 p-7 shadow-[0_35px_110px_rgba(0,0,0,0.35)] sm:p-9">
          {sent ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/12 bg-emerald-300/[0.05] text-emerald-200/80">
                <Check
                  size={24}
                />
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
                {text(
                  "Solicitação recebida.",
                  "Request received."
                )}
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/40">
                {text(
                  "Seu orçamento já entrou no painel da Orbitta. Entraremos em contato usando os dados informados.",
                  "Your quote request is already in the Orbitta admin dashboard. We will contact you using the details provided."
                )}
              </p>

              <Link
                href="/"
                className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#07101c]"
              >
                {text(
                  "Voltar para Orbitta",
                  "Back to Orbitta"
                )}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                    {text(
                      "Nome",
                      "Name"
                    )} *
                  </span>

                  <input
                    value={
                      name
                    }
                    onChange={(
                      event
                    ) =>
                      setName(
                        event.target.value
                      )
                    }
                    maxLength={120}
                    autoComplete="name"
                    className="mt-2 h-12 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-4 text-sm text-white/75 outline-none transition focus:border-cyan-300/30"
                  />
                </label>

                <label>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                    E-mail *
                  </span>

                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    maxLength={180}
                    autoComplete="email"
                    className="mt-2 h-12 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-4 text-sm text-white/75 outline-none transition focus:border-cyan-300/30"
                  />
                </label>

                <label>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                    {text(
                      "Telefone / WhatsApp",
                      "Phone / WhatsApp"
                    )}
                  </span>

                  <input
                    value={
                      phone
                    }
                    onChange={(
                      event
                    ) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    maxLength={60}
                    autoComplete="tel"
                    className="mt-2 h-12 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-4 text-sm text-white/75 outline-none transition focus:border-cyan-300/30"
                  />
                </label>

                <label>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                    {text(
                      "Empresa",
                      "Company"
                    )}
                  </span>

                  <input
                    value={
                      company
                    }
                    onChange={(
                      event
                    ) =>
                      setCompany(
                        event.target.value
                      )
                    }
                    maxLength={160}
                    autoComplete="organization"
                    className="mt-2 h-12 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-4 text-sm text-white/75 outline-none transition focus:border-cyan-300/30"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                  {text(
                    "Tipo de projeto",
                    "Project type"
                  )}
                </span>

                <select
                  value={
                    projectType
                  }
                  onChange={(
                    event
                  ) =>
                    setProjectType(
                      event.target
                        .value as
                        ProjectType
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-4 text-sm text-white/75 outline-none"
                >
                  <option value="BUSINESS_SITE">
                    {text(
                      "Site institucional",
                      "Business website"
                    )}
                  </option>
                  <option value="LANDING_PAGE">
                    Landing page
                  </option>
                  <option value="ECOMMERCE">
                    E-commerce
                  </option>
                  <option value="SITE_PLUS_PIZZASYSTEM">
                    {text(
                      "Site + PizzaSystem",
                      "Website + PizzaSystem"
                    )}
                  </option>
                  <option value="OTHER">
                    {text(
                      "Outro",
                      "Other"
                    )}
                  </option>
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/28">
                  {text(
                    "Conte sobre o projeto",
                    "Tell us about the project"
                  )} *
                </span>

                <textarea
                  value={
                    message
                  }
                  onChange={(
                    event
                  ) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  maxLength={4000}
                  rows={7}
                  placeholder={text(
                    "Ex: preciso de um site para uma pizzaria, quero apresentar o cardápio, WhatsApp, fotos, endereço e integrar depois ao PizzaSystem...",
                    "Example: I need a website for a pizzeria with menu, WhatsApp, photos, address, and possibly PizzaSystem integration..."
                  )}
                  className="mt-2 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-4 py-3 text-sm leading-6 text-white/75 outline-none transition focus:border-cyan-300/30"
                />
              </label>

              {error && (
                <div className="mt-4 rounded-xl border border-red-300/[0.08] bg-red-300/[0.035] px-4 py-3 text-xs text-red-100/70">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  void submit()
                }
                disabled={
                  sending
                }
                className="group mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-semibold text-[#07101c] transition hover:bg-cyan-50 disabled:opacity-55"
              >
                {sending ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    {text(
                      "Enviando...",
                      "Sending..."
                    )}
                  </>
                ) : (
                  <>
                    <Send
                      size={15}
                    />
                    {text(
                      "Enviar solicitação",
                      "Send request"
                    )}
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[10px] leading-4 text-white/20">
                {text(
                  "Você não precisa criar conta nem fazer login para pedir orçamento.",
                  "You do not need to create an account or sign in to request a quote."
                )}
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
