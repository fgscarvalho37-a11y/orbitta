"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Code2,
  Gauge,
  Globe2,
  LayoutTemplate,
  MonitorSmartphone,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatUsd, useCommercialSettings } from "@/hooks/useCommercialSettings";

const quoteUrl =
  "/login?returnUrl=%2Fpainel%2Fsuporte";

const features = [
  {
    icon: LayoutTemplate,
    pt: "Design exclusivo",
    en: "Custom design",
  },
  {
    icon: MonitorSmartphone,
    pt: "Responsivo e mobile-first",
    en: "Responsive and mobile-first",
  },
  {
    icon: Gauge,
    pt: "Carregamento rápido",
    en: "Fast loading",
  },
  {
    icon: Search,
    pt: "SEO básico",
    en: "Basic SEO",
  },
  {
    icon: Globe2,
    pt: "Domínio personalizado",
    en: "Custom domain",
  },
  {
    icon: Code2,
    pt: "Integrações sob medida",
    en: "Custom integrations",
  },
];

export default function StandaloneSitesPage() {
  const {
    text,
    locale,
  } =
    useLanguage();

  const {
    customSiteIntegrationFeeUsd,
  } =
    useCommercialSettings();

  const integrationFee =
    formatUsd(
      customSiteIntegrationFeeUsd,
      locale
    );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050914] text-white">
      <header className="border-b border-white/[0.06]">
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
        <div className="orbitta-grid absolute inset-0 opacity-20" />

        <div className="relative mx-auto max-w-[1440px] px-6 pb-24 pt-20 lg:px-12 lg:pb-32 lg:pt-28">
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.65,
            }}
            className="max-w-5xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
              <Sparkles
                size={13}
              />
              {text(
                "Sites avulsos",
                "Standalone websites"
              )}
            </div>

            <h1 className="mt-7 text-[clamp(3.7rem,8vw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              {text(
                "Seu site. Sua marca. Sem depender de um SaaS.",
                "Your website. Your brand. Without depending on a SaaS."
              )}
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/45">
              {text(
                "A Orbitta também cria sites avulsos para restaurantes, lojas, profissionais e empresas que precisam de uma presença digital própria — mesmo sem contratar o PizzaSystem.",
                "Orbitta also builds standalone websites for restaurants, stores, professionals and companies that need their own digital presence — even without subscribing to PizzaSystem."
              )}
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              className="rounded-[32px] border border-white/[0.07] bg-white/[0.02] p-7 sm:p-9"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-white/55">
                <Globe2
                  size={21}
                />
              </div>

              <p className="mt-7 text-xs uppercase tracking-[0.2em] text-white/30">
                {text(
                  "Site avulso",
                  "Standalone website"
                )}
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                {text(
                  "Projeto independente.",
                  "Independent project."
                )}
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/40">
                {text(
                  "Ideal para quem quer um site profissional sem usar o PizzaSystem. O valor depende do número de páginas, conteúdo, integrações e domínio.",
                  "Ideal for businesses that want a professional website without PizzaSystem. Pricing depends on pages, content, integrations and domain."
                )}
              </p>

              <div className="mt-7 rounded-2xl border border-white/[0.06] bg-[#08101d] p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-white/28">
                  {text(
                    "Preço",
                    "Pricing"
                  )}
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {text(
                    "Sob orçamento",
                    "Custom quote"
                  )}
                </p>

                <p className="mt-2 text-xs leading-5 text-white/32">
                  {text(
                    "Sem obrigatoriedade de contratar o PizzaSystem.",
                    "No PizzaSystem subscription required."
                  )}
                </p>
              </div>

              <Link
                href={
                  quoteUrl
                }
                className="group mt-7 inline-flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
              >
                {text(
                  "Pedir orçamento",
                  "Request a quote"
                )}
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.08,
              }}
              className="relative overflow-hidden rounded-[32px] border border-cyan-300/15 bg-[#08101d] p-7 shadow-[0_35px_100px_rgba(0,0,0,0.3)] sm:p-9"
            >
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/[0.06] blur-[80px]" />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/12 bg-cyan-300/[0.05] text-cyan-200/80">
                  <ShoppingBag
                    size={21}
                  />
                </div>

                <p className="mt-7 text-xs uppercase tracking-[0.2em] text-cyan-300/55">
                  {text(
                    "Site + PizzaSystem",
                    "Website + PizzaSystem"
                  )}
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                  {text(
                    "Design exclusivo conectado à operação.",
                    "Custom design connected to your operation."
                  )}
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/45">
                  {text(
                    "A Orbitta conecta o site personalizado ao mesmo cardápio, pedidos e pagamentos do PizzaSystem, sem duplicar o backend.",
                    "Orbitta connects the custom website to the same PizzaSystem menu, orders and payments without duplicating the backend."
                  )}
                </p>

                <div className="mt-7 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.035] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/45">
                    {text(
                      "Implantação da integração",
                      "Integration setup"
                    )}
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-[-0.04em]">
                      {integrationFee}
                    </span>

                    <span className="pb-1 text-xs text-white/35">
                      {text(
                        "uma única vez",
                        "one time"
                      )}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-white/35">
                    {text(
                      "Depois da implantação, permanece somente a mensalidade normal do plano PizzaSystem contratado. Não há uma segunda mensalidade só pela integração do site.",
                      "After setup, you only keep paying the normal PizzaSystem plan subscription. There is no second monthly fee just for the website integration."
                    )}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.06] p-5">
                  <p className="text-xs font-semibold text-white/70">
                    {text(
                      "Importante",
                      "Important"
                    )}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-white/35">
                    {text(
                      `O site padrão do PizzaSystem continua incluído no plano e não cobra essa taxa. ${integrationFee} vale somente para a integração de um site personalizado.`,
                      `The standard PizzaSystem website remains included with the plan and does not have this fee. ${integrationFee} applies only when integrating a custom website.`
                    )}
                  </p>
                </div>

                <Link
                  href="/produtos/pizzasystem#planos"
                  className="group mt-7 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
                >
                  {text(
                    "Ver PizzaSystem",
                    "View PizzaSystem"
                  )}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.06]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
              {text(
                "Incluído no projeto",
                "Included"
              )}
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              {text(
                "Um site feito para vender melhor sua marca.",
                "A website built to present and sell your brand better."
              )}
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {features.map(
              (
                feature
              ) => {
                const Icon =
                  feature.icon;

                return (
                  <div
                    key={
                      feature.pt
                    }
                    className="bg-[#050914] p-8"
                  >
                    <Icon
                      size={20}
                      className="text-cyan-200/65"
                    />

                    <p className="mt-6 text-lg font-medium">
                      {text(
                        feature.pt,
                        feature.en
                      )}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              text(
                "Site institucional ou landing page",
                "Business website or landing page"
              ),
              text(
                "WhatsApp, telefone e redes sociais",
                "WhatsApp, phone and social links"
              ),
              text(
                "Mapa, endereço e horários",
                "Map, address and opening hours"
              ),
              text(
                "Galeria, serviços, produtos e chamadas para ação",
                "Gallery, services, products and calls to action"
              ),
            ].map(
              (
                item
              ) => (
                <div
                  key={
                    item
                  }
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3.5 text-sm text-white/42"
                >
                  <BadgeCheck
                    size={16}
                    className="shrink-0 text-cyan-200/65"
                  />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="rounded-[34px] border border-white/[0.07] bg-[#08101d] p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.22em] text-white/30">
            Orbitta Sites
          </p>

          <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {text(
              "Quer só o site? Tudo bem. Quer conectar ao PizzaSystem? Também.",
              "Need only the website? That's fine. Want PizzaSystem connected too? We can do that."
            )}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/40">
            {text(
              "O projeto é montado de acordo com o seu negócio. Você escolhe o site avulso ou a integração completa.",
              "The project is shaped around your business. Choose a standalone website or the full integration."
            )}
          </p>

          <Link
            href={
              quoteUrl
            }
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
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
    </main>
  );
}
