"use client";

import { motion } from "motion/react";

type ProductPreviewProps = {
  slug: string;
};

const productLabels: Record<string, string> = {
  pizzasystem: "PizzaSystem",
  condoflow: "CondoFlow",
  vitalsync: "VitalSync",
  cafeflow: "CafeFlow",
};

export default function ProductPreview({
  slug,
}: ProductPreviewProps) {
  const productName =
    productLabels[slug] ?? slug;

  return (
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
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>

        <div className="mx-auto rounded-full bg-white/[0.035] px-10 py-1.5 text-[10px] text-white/20 sm:px-16">
          {slug}.orbitta
        </div>
      </div>

      <div className="grid min-h-[620px] grid-cols-[70px_1fr] sm:grid-cols-[90px_1fr]">
        <aside className="border-r border-white/[0.05] p-3 sm:p-4">
          <div className="mx-auto mb-10 h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-300 to-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.2)]" />

          <div className="space-y-3">
            {Array.from({
              length: 7,
            }).map((_, index) => (
              <div
                key={index}
                className={`h-9 rounded-xl ${
                  index === 0
                    ? "bg-cyan-400/10"
                    : "bg-white/[0.025]"
                }`}
              />
            ))}
          </div>
        </aside>

        <div className="overflow-hidden p-5 sm:p-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/40">
                {productName}
              </div>

              <div className="mt-4 h-9 w-40 rounded-xl bg-white/80 sm:w-60" />
            </div>

            <div className="hidden h-10 w-32 rounded-full bg-cyan-400/80 sm:block" />
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="h-28 rounded-2xl border border-white/[0.05] bg-white/[0.025]"
              />
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="h-80 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
              <div className="h-4 w-36 rounded bg-white/10" />

              <div className="mt-8 flex h-52 items-end gap-3">
                {[
                  38,
                  65,
                  47,
                  78,
                  54,
                  88,
                  70,
                  92,
                ].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      height: 0,
                    }}
                    whileInView={{
                      height: `${height}%`,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.6,
                    }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-500/30 to-cyan-300/70"
                  />
                ))}
              </div>
            </div>

            <div className="h-80 rounded-2xl border border-white/[0.05] bg-gradient-to-br from-violet-500/[0.08] to-cyan-400/[0.04] p-5">
              <div className="h-4 w-28 rounded bg-white/10" />

              <div className="mt-8 space-y-4">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    <div className="h-9 w-9 rounded-xl bg-white/[0.05]" />

                    <div className="flex-1">
                      <div className="h-2.5 w-3/4 rounded bg-white/[0.07]" />
                      <div className="mt-2 h-2 w-1/2 rounded bg-white/[0.035]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.05] px-6 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">
        Representação visual — preview interativo em desenvolvimento
      </div>
    </motion.div>
  );
}