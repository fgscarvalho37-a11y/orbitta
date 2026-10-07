"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Gauge,
  Globe2,
  LayoutTemplate,
  MessageCircle,
  MonitorSmartphone,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { motion } from "motion/react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

const benefits = [
  {
    icon: WandSparkles,
    pt: "Design feito para a marca",
    en: "Design built for your brand",
  },
  {
    icon: MonitorSmartphone,
    pt: "Mobile-first e responsivo",
    en: "Mobile-first and responsive",
  },
  {
    icon: Gauge,
    pt: "Carregamento rápido",
    en: "Fast loading",
  },
  {
    icon: MessageCircle,
    pt: "Contato sem atrito",
    en: "Frictionless contact",
  },
  {
    icon: Search,
    pt: "SEO básico incluído",
    en: "Basic SEO included",
  },
  {
    icon: Globe2,
    pt: "Integração com a Orbitta",
    en: "Orbitta integrations",
  },
];

export default function LandingPageService() {
  const {
    text,
  } =
    useLanguage();

  const quoteUrl =
    "/login?returnUrl=%2Fpainel%2Fsuporte";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050914] text-white">
      <header className="relative z-30 border-b border-white/[0.06]">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-12">
          <Link
            href="/"
            className="group flex items-center gap-3 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Orbitta Space
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />

            <Link
              href={
                quoteUrl
              }
              className="hidden rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#07101c] transition hover:bg-cyan-50 sm:inline-flex"
            >
              {text(
                "Solicitar orçamento",
                "Request a quote"
              )}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="orbitta-grid absolute inset-0 opacity-25" />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-6 pb-24 pt-20 lg:grid-cols-[0.86fr_1.14fr] lg:px-12 lg:pb-36 lg:pt-28">
          <motion.div
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.65,
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
              <Sparkles
                size={13}
              />
              {text(
                "Landing Page Personalizada",
                "Custom Landing Page"
              )}
            </div>

            <h1 className="mt-7 max-w-4xl text-[clamp(3.6rem,8vw,8rem)] font-semibold leading-[0.91] tracking-[-0.065em]">
              {text(
                "Seu negócio merece um site que pareça seu.",
                "Your business deserves a website that feels like yours."
              )}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/45">
              {text(
                "Criamos landing pages personalizadas, rápidas e responsivas para transformar visitantes em clientes — sem prender sua marca a um template genérico.",
                "We create fast, responsive custom landing pages designed to turn visitors into customers — without locking your brand into a generic template."
              )}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href={
                  quoteUrl
                }
                className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
              >
                {text(
                  "Solicitar orçamento",
                  "Request a quote"
                )}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#comparacao"
                className="inline-flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.035] px-6 py-3.5 text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-white"
              >
                {text(
                  "Entender a diferença",
                  "See the difference"
                )}
              </a>
            </div>

            <p className="mt-5 text-xs leading-5 text-white/28">
              {text(
                "Preço sob orçamento. Nenhum valor fixo é aplicado antes da definição do projeto.",
                "Pricing is quote-based. No fixed price is applied before the project scope is defined."
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 30,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.08,
              duration: 0.75,
            }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-cyan-400/[0.07] blur-[90px]" />

            <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#08101d] shadow-[0_50px_130px_rgba(0,0,0,0.46)]">
              <div className="flex h-12 items-center gap-2 border-b border-white/[0.06] px-5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/50" />

                <div className="ml-4 h-6 flex-1 rounded-full bg-white/[0.035] px-4 py-1 text-[9px] text-white/20">
                  yourbrand.com
                </div>
              </div>

              <div className="bg-[#f4f0e8] p-5 text-[#111827] sm:p-7">
                <div className="grid min-h-[470px] overflow-hidden rounded-[24px] border border-black/5 bg-white sm:grid-cols-[1.08fr_0.92fr]">
                  <div className="flex flex-col justify-between p-7 sm:p-9">
                    <div>
                      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black/45">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Brand identity
                      </div>

                      <div className="mt-8 h-10 w-full max-w-xs rounded bg-[#141414]" />
                      <div className="mt-2 h-10 w-8/12 rounded bg-[#141414]" />

                      <div className="mt-6 h-2.5 w-full rounded bg-black/10" />
                      <div className="mt-2 h-2.5 w-10/12 rounded bg-black/10" />
                      <div className="mt-2 h-2.5 w-8/12 rounded bg-black/10" />

                      <div className="mt-7 h-11 w-40 rounded-full bg-[#141414]" />
                    </div>

                    <div className="mt-10 flex gap-3">
                      <div className="h-12 flex-1 rounded-2xl bg-orange-100" />
                      <div className="h-12 flex-1 rounded-2xl bg-black/[0.05]" />
                    </div>
                  </div>

                  <div className="min-h-[300px] bg-[radial-gradient(circle_at_25%_18%,rgba(251,146,60,0.95),transparent_25%),radial-gradient(circle_at_70%_75%,rgba(14,165,233,0.55),transparent_34%),linear-gradient(145deg,#101827,#633b2c_55%,#cf7746)]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/[0.06]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
              {text(
                "O que entregamos",
                "What you get"
              )}
            </p>

            <h2 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-6xl">
              {text(
                "Design, presença e conversão.",
                "Design, presence and conversion."
              )}
            </h2>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(
              (
                benefit
              ) => {
                const Icon =
                  benefit.icon;

                return (
                  <div
                    key={
                      benefit.pt
                    }
                    className="bg-[#050914] p-7 sm:p-9"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] text-cyan-200/70">
                      <Icon
                        size={19}
                      />
                    </div>

                    <h3 className="mt-7 text-lg font-medium text-white/88">
                      {text(
                        benefit.pt,
                        benefit.en
                      )}
                    </h3>
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-8 grid gap-3 text-sm text-white/42 sm:grid-cols-2 lg:grid-cols-3">
            {[
              text(
                "Fotos e galeria",
                "Photos and gallery"
              ),
              text(
                "Produtos ou serviços",
                "Products or services"
              ),
              text(
                "WhatsApp e telefone",
                "WhatsApp and phone"
              ),
              text(
                "Endereço, mapa e horários",
                "Address, map and hours"
              ),
              text(
                "Redes sociais",
                "Social media"
              ),
              text(
                "Domínio personalizado quando contratado",
                "Custom domain when included in scope"
              ),
            ].map(
              (
                item
              ) => (
                <div
                  key={
                    item
                  }
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3.5"
                >
                  <BadgeCheck
                    size={16}
                    className="shrink-0 text-cyan-300/65"
                  />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section
        id="comparacao"
        className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-36"
      >
        <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
              {text(
                "Escolha certa",
                "The right fit"
              )}
            </p>

            <h2 className="mt-6 text-4xl font-semibold leading-[1.04] tracking-[-0.05em] sm:text-5xl">
              {text(
                "O site padrão do PizzaSystem continua incluído.",
                "The standard PizzaSystem website remains included."
              )}
            </h2>

            <p className="mt-5 text-base leading-7 text-white/38">
              {text(
                "A Landing Page Personalizada é um serviço adicional para quem quer uma identidade e uma estrutura totalmente próprias. Ela não substitui nem remove o site padrão incluso no PizzaSystem.",
                "The Custom Landing Page is an additional service for businesses that want a fully custom identity and structure. It does not replace or remove the standard site included with PizzaSystem."
              )}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.02] p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/45">
                <LayoutTemplate
                  size={19}
                />
              </div>

              <p className="mt-7 text-xs uppercase tracking-[0.18em] text-white/30">
                PizzaSystem
              </p>

              <h3 className="mt-2 text-2xl font-semibold">
                {text(
                  "Site padrão incluído",
                  "Standard site included"
                )}
              </h3>

              <ul className="mt-6 space-y-3 text-sm leading-6 text-white/42">
                <li>
                  • {text(
                    "Layout pré-definido",
                    "Predefined layout"
                  )}
                </li>
                <li>
                  • {text(
                    "Personalização básica",
                    "Basic customization"
                  )}
                </li>
                <li>
                  • {text(
                    "Cardápio e pedidos integrados",
                    "Integrated menu and orders"
                  )}
                </li>
                <li>
                  • {text(
                    "Incluído no PizzaSystem",
                    "Included with PizzaSystem"
                  )}
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-cyan-300/15 bg-[#08101d] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/12 bg-cyan-300/[0.05] text-cyan-200/80">
                <Sparkles
                  size={19}
                />
              </div>

              <p className="mt-7 text-xs uppercase tracking-[0.18em] text-cyan-300/55">
                Premium
              </p>

              <h3 className="mt-2 text-2xl font-semibold">
                {text(
                  "Landing personalizada",
                  "Custom landing page"
                )}
              </h3>

              <ul className="mt-6 space-y-3 text-sm leading-6 text-white/48">
                <li>
                  • {text(
                    "Design exclusivo",
                    "Exclusive design"
                  )}
                </li>
                <li>
                  • {text(
                    "Estrutura personalizada",
                    "Custom structure"
                  )}
                </li>
                <li>
                  • {text(
                    "Conteúdo e seções específicas",
                    "Custom content and sections"
                  )}
                </li>
                <li>
                  • {text(
                    "Identidade visual completa",
                    "Full visual identity"
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-[#08101d]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:px-12 lg:py-32">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
              Orbitta × PizzaSystem
            </p>

            <h2 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-6xl">
              {text(
                "Design exclusivo na frente. PizzaSystem operando por trás.",
                "Custom design in front. PizzaSystem running behind it."
              )}
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/42">
              {text(
                "A landing pode ser conectada ao PizzaSystem. O cliente vê uma experiência totalmente personalizada enquanto cardápio, pedidos e pagamentos continuam usando a infraestrutura existente — sem duplicar backend.",
                "The landing page can connect to PizzaSystem. Customers see a fully custom experience while menus, orders and payments continue using the existing infrastructure — without duplicating the backend."
              )}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-[26px] border border-cyan-300/12 bg-cyan-300/[0.04] p-7">
              <Sparkles
                size={23}
                className="text-cyan-200/75"
              />
              <p className="mt-5 text-lg font-semibold">
                {text(
                  "Landing personalizada",
                  "Custom landing page"
                )}
              </p>
              <p className="mt-2 text-sm text-white/35">
                {text(
                  "Marca, conteúdo e experiência.",
                  "Brand, content and experience."
                )}
              </p>
            </div>

            <div className="text-center text-2xl text-white/20">
              +
            </div>

            <div className="rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-7">
              <MonitorSmartphone
                size={23}
                className="text-white/55"
              />
              <p className="mt-5 text-lg font-semibold">
                PizzaSystem
              </p>
              <p className="mt-2 text-sm text-white/35">
                {text(
                  "Pedidos, cardápio e pagamentos.",
                  "Orders, menu and payments."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="orcamento"
        className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-36"
      >
        <div className="relative overflow-hidden rounded-[36px] border border-white/[0.07] bg-[#08101d] px-7 py-14 sm:px-12 lg:px-18 lg:py-20">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-400/[0.06] blur-[100px]" />

          <p className="relative text-xs uppercase tracking-[0.25em] text-white/30">
            {text(
              "Projeto sob medida",
              "Tailored project"
            )}
          </p>

          <h2 className="relative mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
            {text(
              "Conte sua ideia. Nós transformamos em uma presença profissional.",
              "Tell us your idea. We'll turn it into a professional web presence."
            )}
          </h2>

          <p className="relative mt-5 max-w-2xl text-base leading-7 text-white/40">
            {text(
              "Solicite um orçamento pela sua área Orbitta. O valor é definido conforme escopo, conteúdo, integrações e domínio.",
              "Request a quote through your Orbitta account. Pricing is defined according to scope, content, integrations and domain requirements."
            )}
          </p>

          <Link
            href={
              quoteUrl
            }
            className="group relative mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
          >
            {text(
              "Solicitar orçamento",
              "Request a quote"
            )}

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-3 px-6 py-10 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <span>
          © 2026 Orbitta Space
        </span>

        <span>
          orbitta.space
        </span>
      </footer>
    </main>
  );
}
