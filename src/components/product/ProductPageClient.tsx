"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BellRing,
  Bike,
  Building2,
  CalendarDays,
  ChefHat,
  ClipboardList,
  CreditCard,
  ExternalLink,
  PackageCheck,
  Settings2,
  ShoppingBag,
  Users,
} from "lucide-react";

import { motion } from "motion/react";
import {
  localizeProduct,
  type OrbittaProduct,
} from "@/data/products";
import ProductPricing from "@/components/product/ProductPricing";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

type ProductPageClientProps = {
  product: OrbittaProduct;
};

const productIcons = {
  pizzasystem: [
    ShoppingBag,
    CreditCard,
    ChefHat,
    Bike,
    BarChart3,
    Settings2,
  ],

  condoflow: [
    Building2,
    PackageCheck,
    CalendarDays,
    BellRing,
    Users,
    ClipboardList,
  ],
};

const heroTexts: Record<string, string> = {
  pizzasystem:
    "Venda pelo seu próprio canal. Do cardápio à entrega.",

  condoflow:
    "O condomínio conectado em uma única experiência.",

};

const sectionTexts: Record<string, string> = {
  pizzasystem:
    "Uma operação conectada do pedido à entrega.",

  condoflow:
    "Síndico e portaria trabalhando conectados.",

};

const heroTextsEn: Record<string, string> = {
  pizzasystem:
    "Sell through your own channel. From menu to delivery.",
  condoflow:
    "Your condominium connected in one experience.",
};

const sectionTextsEn: Record<string, string> = {
  pizzasystem:
    "A connected operation from order to delivery.",
  condoflow:
    "Front desk teams and managers working together.",
};

export default function ProductPageClient({
  product,
}: ProductPageClientProps) {
  const { locale, isEnglish, text } =
    useLanguage();

  const displayProduct =
    localizeProduct(
      product,
      locale
    );

  const icons =
    productIcons[displayProduct.slug as keyof typeof productIcons] ??
    productIcons.pizzasystem;

  const heroText =
    (isEnglish
      ? heroTextsEn[displayProduct.slug]
      : heroTexts[displayProduct.slug]) ??
    displayProduct.shortDescription;

  const sectionText =
    (isEnglish
      ? sectionTextsEn[displayProduct.slug]
      : sectionTexts[displayProduct.slug]) ??
    displayProduct.shortDescription;

  const previewAvailable =
    (displayProduct.status === "preview" ||
      displayProduct.status === "available") &&
    Boolean(displayProduct.previewUrl);

  const localizedPreviewUrl =
    previewAvailable && displayProduct.previewUrl
      ? `${displayProduct.previewUrl}${
          displayProduct.previewUrl.includes("?") ? "&" : "?"
        }lang=${encodeURIComponent(locale)}`
      : undefined;

  const overviewFeatures =
    displayProduct.features.slice(
      0,
      6
    );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050914] text-white">
      {/* HEADER */}
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

          <div className="hidden text-xs font-medium uppercase tracking-[0.22em] text-white/35 sm:block">
            {text("Produto Orbitta", "Orbitta Product")}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />

          {displayProduct.status === "development" ? (
            <div className="flex items-center gap-2 rounded-full border border-amber-300/10 bg-amber-300/[0.05] px-4 py-2 text-xs text-amber-100/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              {text("Em desenvolvimento", "In development")}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.05] px-4 py-2 text-xs text-emerald-100/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {text("Disponível", "Available")}
            </div>
          )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(34,211,238,0.11),transparent_27%),radial-gradient(circle_at_35%_50%,rgba(124,58,237,0.08),transparent_35%)]" />

        <div className="orbitta-grid absolute inset-0 opacity-30" />

        <div className="relative mx-auto max-w-[1440px] px-6 pb-24 pt-24 lg:px-12 lg:pb-36 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-cyan-300/60"
          >
            <span>Orbitta</span>
            <span className="text-white/15">/</span>
            <span>{displayProduct.category}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08,
              duration: 0.7,
            }}
            className="mt-8 break-words text-[clamp(4rem,10vw,10rem)] font-semibold leading-[0.82] tracking-[-0.075em]"
          >
            <span className="bg-gradient-to-r from-white via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              {displayProduct.name}.
            </span>
          </motion.h1>

          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="max-w-2xl text-3xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-5xl"
            >
              {heroText}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="max-w-xl lg:justify-self-end"
            >
              <p className="text-base leading-7 text-white/45 sm:text-lg">
                {displayProduct.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {displayProduct.slug === "pizzasystem" && (
                  <a
                    href="#planos"
                    className="group flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
                  >
                    {text("Ver planos e contratar", "View plans and subscribe")}

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>
                )}

                <a
                  href="#conhecer"
                  className={
                    displayProduct.slug === "pizzasystem"
                      ? "group flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                      : "group flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
                  }
                >
                  {text("Conhecer o sistema", "Explore the system")}

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>

                {displayProduct.accessUrl && (
                  <Link
                    href={`/produtos/${displayProduct.slug}/acessar`}
                    className="group flex items-center gap-3 rounded-full border border-cyan-300/30 bg-cyan-300/[0.08] px-6 py-3.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.12]"
                  >
                    {text("Acessar produto", "Access product")}
                    <ExternalLink size={15} />
                  </Link>
                )}

                {previewAvailable && displayProduct.previewUrl ? (
                  <a
                    href={localizedPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-6 py-3.5 text-sm text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.1]"
                  >
                    {text("Abrir preview", "Open preview")}

                    <ExternalLink
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex cursor-not-allowed items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.025] px-6 py-3.5 text-sm text-white/25"
                  >
                    {text("Abrir preview", "Open preview")}
                    <ExternalLink size={15} />

                    <span className="text-[10px] uppercase tracking-wider">
                      {text("Em breve", "Coming soon")}
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PREVIEW VISUAL */}
      <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 50,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.15,
          }}
          transition={{
            duration: 0.8,
          }}
          className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#08101d] shadow-[0_50px_140px_rgba(0,0,0,0.45)]"
        >
          <div className="flex h-12 items-center border-b border-white/[0.06] px-5">
            <div className="flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/50" />
            </div>

            <div className="mx-auto max-w-[55vw] truncate rounded-full bg-white/[0.035] px-6 py-1.5 text-[10px] text-white/25 sm:px-12">
              {previewAvailable && displayProduct.previewUrl
                ? displayProduct.previewUrl.replace(/^https?:\/\//, "")
                : `${displayProduct.slug}.orbitta.space`}
            </div>
          </div>

          {previewAvailable && displayProduct.previewUrl ? (
            <div className="relative h-[620px] bg-[#f6f3ee] sm:h-[700px] lg:h-[760px]">
              <iframe
                src={localizedPreviewUrl}
                title={text(
                  `Preview do ${displayProduct.name}`,
                  `${displayProduct.name} preview`
                )}
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="grid min-h-[620px] place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.08),transparent_35%)] p-8 text-center">
              <div>
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 opacity-70" />

                <p className="mt-6 text-sm font-medium text-white/55">
                  {text("Preview em preparação", "Preview in progress")}
                </p>

                <p className="mt-2 text-xs leading-5 text-white/25">
                  {text("A demonstração desta plataforma será publicada em breve.", "A live demonstration of this platform will be available soon.")}
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.05] px-6 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/25">
            {previewAvailable
              ? text(
                  "Preview navegável do produto",
                  "Interactive product preview"
                )
              : text(
                  "Preview em desenvolvimento",
                  "Preview in development"
                )}
          </div>
        </motion.div>
      </section>

      {displayProduct.slug === "pizzasystem" && (
        <>
          <section className="mx-auto max-w-[1440px] px-6 pb-10 pt-28 lg:px-12 lg:pb-16 lg:pt-36">
            <div className="grid overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#08101d] lg:grid-cols-3">
              {[
                {
                  icon: ShoppingBag,
                  value: text(
                    "Sem comissão Orbitta por pedido",
                    "No Orbitta per-order commission"
                  ),
                  detail: text(
                    "A mensalidade é previsível. As vendas continuam sendo da própria loja.",
                    "Predictable subscription pricing. Your store keeps its own sales."
                  ),
                },
                {
                  icon: CreditCard,
                  value: text(
                    "Recebimento na conta da loja",
                    "Payments to the store's account"
                  ),
                  detail: text(
                    "Pix e cartão no Brasil; Stripe para a operação internacional.",
                    "Pix and cards in Brazil; Stripe for international operations."
                  ),
                },
                {
                  icon: Settings2,
                  value: text(
                    "Uma operação, um painel",
                    "One operation, one dashboard"
                  ),
                  detail: text(
                    "Cardápio, pedidos, cozinha, entregas, caixa e relatórios centralizados.",
                    "Menu, orders, kitchen, delivery, cash register and reports in one place."
                  ),
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.value}
                    className={
                      index === 0
                        ? "p-7 sm:p-9"
                        : "border-t border-white/[0.06] p-7 sm:p-9 lg:border-l lg:border-t-0"
                    }
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] text-cyan-200/70">
                      <Icon size={17} />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-white/90">
                      {item.value}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/35">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            id="como-funciona"
            className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-32"
          >
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
                  {text("Como funciona", "How it works")}
                </p>

                <h2 className="mt-6 max-w-lg text-4xl font-semibold leading-[1.04] tracking-[-0.05em] sm:text-5xl">
                  {text(
                    "Do primeiro clique ao pedido na cozinha.",
                    "From the first click to the kitchen."
                  )}
                </h2>

                <p className="mt-5 max-w-lg text-base leading-7 text-white/38">
                  {text(
                    "Você configura uma vez e passa a operar pelo seu próprio canal, com o cliente comprando direto da sua marca.",
                    "Set it up once and run your own sales channel, with customers ordering directly from your brand."
                  )}
                </p>

                <a
                  href="#planos"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
                >
                  {text("Ver planos", "View pricing")}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    number: "01",
                    icon: ShoppingBag,
                    title: text(
                      "Monte seu cardápio",
                      "Build your menu"
                    ),
                    description: text(
                      "Cadastre produtos, fotos, categorias, adicionais, bordas, cupons, horários e regras de entrega.",
                      "Add products, photos, categories, extras, crusts, coupons, hours and delivery rules."
                    ),
                  },
                  {
                    number: "02",
                    icon: ChefHat,
                    title: text(
                      "Receba e produza",
                      "Receive and prepare"
                    ),
                    description: text(
                      "O pedido entra no painel em tempo real e segue o fluxo da cozinha do recebido ao pronto.",
                      "Orders arrive in real time and move through the kitchen workflow from received to ready."
                    ),
                  },
                  {
                    number: "03",
                    icon: Bike,
                    title: text(
                      "Entregue e acompanhe",
                      "Deliver and track"
                    ),
                    description: text(
                      "Controle entrega, pagamento, caixa, histórico e relatórios sem espalhar a operação em vários sistemas.",
                      "Manage delivery, payment, cash register, history and reports without splitting operations across multiple systems."
                    ),
                  },
                ].map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className="group grid gap-5 rounded-[26px] border border-white/[0.06] bg-white/[0.018] p-6 transition hover:border-cyan-300/[0.12] hover:bg-[#08101d] sm:grid-cols-[58px_1fr] sm:p-7"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-cyan-200/70">
                        <Icon size={19} />
                      </div>

                      <div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/22">
                          {step.number}
                        </div>

                        <h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-white/85">
                          {step.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-white/35">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* FUNCIONALIDADES */}
      <section
        id="conhecer"
        className="mx-auto max-w-[1440px] px-6 py-32 lg:px-12 lg:py-44"
      >
        <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <div className="sticky top-28">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
                {text("Plataforma", "Platform")}
              </p>

              <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl">
                {sectionText}
              </h2>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2">
            {overviewFeatures.map((feature, index) => {
              const Icon = icons[index] ?? Settings2;

              return (
                <motion.div
                  key={feature}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="group bg-[#050914] p-8 transition hover:bg-[#08101d] sm:p-10"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-cyan-300 transition group-hover:border-cyan-300/20 group-hover:bg-cyan-300/[0.05]">
                    <Icon size={19} />
                  </div>

                  <h3 className="mt-8 text-xl font-medium">
                    {feature}
                  </h3>

                  <p className="mt-3 leading-7 text-white/35">
                    {text(
                      `Recurso integrado à plataforma ${displayProduct.name} para simplificar e centralizar a operação.`,
                      `An integrated ${displayProduct.name} feature designed to simplify and centralize your operation.`
                    )}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {displayProduct.features.length >
            overviewFeatures.length && (
            <div className="lg:col-start-2">
              <a
                href="#planos"
                className="inline-flex items-center gap-2 text-xs font-medium text-cyan-200/55 transition hover:text-cyan-100"
              >
                {text(
                  `Ver todas as ${displayProduct.features.length} funcionalidades incluídas`,
                  `See all ${displayProduct.features.length} included features`
                )}
                <ArrowRight size={13} />
              </a>
            </div>
          )}
        </div>
      </section>

      {displayProduct.slug === "pizzasystem" && (
        <section className="mx-auto max-w-[1440px] px-6 pb-10 lg:px-12 lg:pb-16">
          <div className="grid items-center gap-8 rounded-[32px] border border-cyan-300/12 bg-[#08101d] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/55">
                {text(
                  "Quer um design totalmente personalizado?",
                  "Want a fully custom design?"
                )}
              </p>

              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                {text(
                  "Conecte uma Landing Page Personalizada ao PizzaSystem.",
                  "Connect a Custom Landing Page to PizzaSystem."
                )}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
                {text(
                  "O site padrão continua incluído. A opção personalizada é um serviço premium para marcas que querem uma experiência visual exclusiva, usando o mesmo cardápio, pedidos e pagamentos do PizzaSystem.",
                  "The standard website remains included. The custom option is a premium service for brands that want a unique visual experience while keeping the same PizzaSystem menu, orders and payments."
                )}
              </p>
            </div>

            <Link
              href="/landing-page"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
            >
              {text(
                "Conheça nossas Landing Pages",
                "Explore Custom Landing Pages"
              )}

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      )}

      <ProductPricing slug={displayProduct.slug} />

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1440px] px-6 py-32 lg:px-12">
          <div className="relative overflow-hidden rounded-[36px] border border-white/[0.07] bg-[#08101d] px-8 py-16 sm:px-14 lg:px-20 lg:py-24">
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/[0.08] blur-[120px]" />

            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              {displayProduct.name} × Orbitta
            </p>

            <h2 className="relative mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              {displayProduct.status === "development"
                ? text(
                    `${displayProduct.name} está sendo construído.`,
                    `${displayProduct.name} is being built.`
                  )
                : text(
                    `Conheça o ${displayProduct.name}.`,
                    `Meet ${displayProduct.name}.`
                  )}

              <span className="block text-white/30">
                {text("Tecnologia criada pela Orbitta.", "Technology built by Orbitta.")}
              </span>
            </h2>

            <div className="relative mt-10 flex flex-wrap gap-4">
              {displayProduct.slug === "pizzasystem" ? (
                <>
                  <a
                    href="#planos"
                    className="group flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
                  >
                    {text("Ver planos e começar", "View pricing and get started")}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>

                  <Link
                    href="/login"
                    className="group flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.04] px-6 py-3.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {text("Já sou cliente", "I'm already a client")}
                    <ArrowRight size={15} />
                  </Link>
                </>
              ) : (
                <Link
                  href="/"
                  className="group flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c]"
                >
                  {text("Voltar para Orbitta", "Back to Orbitta")}

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              )}

              {previewAvailable && displayProduct.previewUrl && (
                <a
                  href={localizedPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.04] px-6 py-3.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {text("Abrir preview", "Open preview")}
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-10 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <span>© 2026 Orbitta Space</span>
        <span>orbitta.space</span>
      </footer>
    </main>
  );
}
