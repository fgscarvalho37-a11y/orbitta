"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  LayoutTemplate,
  MonitorSmartphone,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

import { useLanguage } from "@/i18n/LanguageProvider";

export default function CustomLandingPageSection() {
  const {
    text,
  } =
    useLanguage();

  return (
    <section
      id="landing-pages"
      className="border-t border-white/[0.06] bg-[#050914]"
    >
      <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-12 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
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
              amount: 0.25,
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
                "Serviço premium",
                "Premium service"
              )}
            </div>

            <h2 className="mt-7 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
              {text(
                "Sites avulsos e Landing Pages.",
                "Standalone Sites & Landing Pages."
              )}

              <span className="mt-2 block text-white/30">
                {text(
                  "Com ou sem PizzaSystem.",
                  "With or without PizzaSystem."
                )}
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/45 sm:text-lg">
              {text(
                "Criamos uma presença digital exclusiva para a identidade do seu negócio, com estrutura, conteúdo e experiência pensados para transformar visitas em contatos e vendas.",
                "We create a digital presence built around your business identity, with structure, content and experience designed to turn visits into leads and sales."
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/[0.08] px-3.5 py-2 text-xs text-white/45">
                {text(
                  "Design exclusivo",
                  "Custom design"
                )}
              </span>

              <span className="rounded-full border border-white/[0.08] px-3.5 py-2 text-xs text-white/45">
                Mobile-first
              </span>

              <span className="rounded-full border border-white/[0.08] px-3.5 py-2 text-xs text-white/45">
                SEO
              </span>

              <span className="rounded-full border border-white/[0.08] px-3.5 py-2 text-xs text-white/45">
                PizzaSystem
              </span>
            </div>

            <Link
              href="/sites-avulsos"
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
            >
              {text(
                "Conhecer sites avulsos",
                "Explore standalone sites"
              )}

              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.75,
            }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#08101d] shadow-[0_45px_120px_rgba(0,0,0,0.38)]">
              <div className="flex h-11 items-center gap-2 border-b border-white/[0.06] px-5">
                <span className="h-2 w-2 rounded-full bg-red-400/50" />
                <span className="h-2 w-2 rounded-full bg-amber-300/50" />
                <span className="h-2 w-2 rounded-full bg-emerald-300/50" />

                <div className="ml-3 h-5 flex-1 rounded-full bg-white/[0.035]" />
              </div>

              <div className="grid min-h-[440px] grid-rows-[1fr_auto] p-5 sm:p-8">
                <div className="grid gap-5 rounded-[24px] border border-white/[0.06] bg-[#f4f0e8] p-6 text-[#111827] sm:grid-cols-[1.15fr_0.85fr] sm:p-8">
                  <div className="flex flex-col justify-center">
                    <span className="w-fit rounded-full border border-black/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em]">
                      Brand / Story
                    </span>

                    <div className="mt-5 h-8 w-11/12 rounded bg-black/90" />
                    <div className="mt-2 h-8 w-8/12 rounded bg-black/90" />

                    <div className="mt-5 h-2.5 w-full rounded bg-black/10" />
                    <div className="mt-2 h-2.5 w-9/12 rounded bg-black/10" />
                    <div className="mt-7 h-10 w-36 rounded-full bg-black" />
                  </div>

                  <div className="min-h-56 rounded-[22px] bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.8),transparent_28%),linear-gradient(145deg,#101827,#4f2d22_52%,#db8b55)] shadow-xl" />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    MonitorSmartphone,
                    LayoutTemplate,
                    Sparkles,
                  ].map(
                    (
                      Icon,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="flex h-20 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-white/35"
                      >
                        <Icon
                          size={20}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
