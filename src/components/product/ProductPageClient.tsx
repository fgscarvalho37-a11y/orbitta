"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BellRing,
  Bike,
  Building2,
  CalendarClock,
  CalendarDays,
  ChefHat,
  ClipboardList,
  Coffee,
  CreditCard,
  ExternalLink,
  HeartPulse,
  Newspaper,
  PackageCheck,
  ReceiptText,
  Settings2,
  ShoppingBag,
  UserRound,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { motion } from "motion/react";
import type { OrbittaProduct } from "@/data/products";
import ProductPricing from "@/components/product/ProductPricing";

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

  vitalsync: [
    HeartPulse,
    CalendarClock,
    UserRound,
    Activity,
    Newspaper,
    BarChart3,
  ],

  cafeflow: [
    Coffee,
    ReceiptText,
    UtensilsCrossed,
    ShoppingBag,
    Users,
    Settings2,
  ],
};

const heroTexts: Record<string, string> = {
  pizzasystem:
    "Sua operação de delivery em uma única plataforma.",

  condoflow:
    "O condomínio conectado em uma única experiência.",

  vitalsync:
    "A rotina de saúde conectada entre profissional e paciente.",

  cafeflow:
    "A operação da sua cafeteria organizada em um só lugar.",
};

const sectionTexts: Record<string, string> = {
  pizzasystem:
    "Uma operação conectada do pedido à entrega.",

  condoflow:
    "Moradores, portaria e administração trabalhando conectados.",

  vitalsync:
    "Atendimento, acompanhamento e gestão em uma única experiência.",

  cafeflow:
    "Do cardápio à comanda, toda a operação conectada.",
};

export default function ProductPageClient({
  product,
}: ProductPageClientProps) {
  const icons =
    productIcons[product.slug as keyof typeof productIcons] ??
    productIcons.pizzasystem;

  const heroText =
    heroTexts[product.slug] ?? product.shortDescription;

  const sectionText =
    sectionTexts[product.slug] ?? product.shortDescription;

  const previewAvailable =
    (product.status === "preview" ||
      product.status === "available") &&
    Boolean(product.previewUrl);

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
            Produto Orbitta
          </div>

          {product.status === "development" ? (
            <div className="flex items-center gap-2 rounded-full border border-amber-300/10 bg-amber-300/[0.05] px-4 py-2 text-xs text-amber-100/60">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Em desenvolvimento
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.05] px-4 py-2 text-xs text-emerald-100/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Disponível
            </div>
          )}
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
            <span>{product.category}</span>
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
              {product.name}.
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
                {product.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#conhecer"
                  className="group flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
                >
                  Conhecer o sistema

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>

                {previewAvailable && product.previewUrl ? (
                  <a
                    href={product.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-6 py-3.5 text-sm text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.1]"
                  >
                    Abrir preview

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
                    Abrir preview
                    <ExternalLink size={15} />

                    <span className="text-[10px] uppercase tracking-wider">
                      Em breve
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
              {previewAvailable && product.previewUrl
                ? product.previewUrl.replace(/^https?:\/\//, "")
                : `${product.slug}.orbitta.space`}
            </div>
          </div>

          {previewAvailable && product.previewUrl ? (
            <div className="relative h-[620px] bg-[#f6f3ee] sm:h-[700px] lg:h-[760px]">
              <iframe
                src={product.previewUrl}
                title={`Preview do ${product.name}`}
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="grid min-h-[620px] place-items-center bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.08),transparent_35%)] p-8 text-center">
              <div>
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 opacity-70" />

                <p className="mt-6 text-sm font-medium text-white/55">
                  Preview em preparação
                </p>

                <p className="mt-2 text-xs leading-5 text-white/25">
                  A demonstração desta plataforma será publicada em breve.
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.05] px-6 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/25">
            {previewAvailable
              ? "Preview navegável do produto"
              : "Preview em desenvolvimento"}
          </div>
        </motion.div>
      </section>

      {/* FUNCIONALIDADES */}
      <section
        id="conhecer"
        className="mx-auto max-w-[1440px] px-6 py-32 lg:px-12 lg:py-44"
      >
        <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <div className="sticky top-28">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
                Plataforma
              </p>

              <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl">
                {sectionText}
              </h2>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2">
            {product.features.map((feature, index) => {
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
                    Recurso integrado à plataforma {product.name} para
                    simplificar e centralizar a operação.
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <ProductPricing slug={product.slug} />

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1440px] px-6 py-32 lg:px-12">
          <div className="relative overflow-hidden rounded-[36px] border border-white/[0.07] bg-[#08101d] px-8 py-16 sm:px-14 lg:px-20 lg:py-24">
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/[0.08] blur-[120px]" />

            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              {product.name} × Orbitta
            </p>

            <h2 className="relative mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              {product.status === "development"
                ? `${product.name} está sendo construído.`
                : `Conheça o ${product.name}.`}

              <span className="block text-white/30">
                Tecnologia criada pela Orbitta.
              </span>
            </h2>

            <div className="relative mt-10 flex flex-wrap gap-4">
              <Link
                href="/"
                className="group flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c]"
              >
                Voltar para Orbitta

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              {previewAvailable && product.previewUrl && (
                <a
                  href={product.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.04] px-6 py-3.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Abrir preview
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
