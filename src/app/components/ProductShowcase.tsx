"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const products = [
  {
    number: "01",
    name: "PizzaSystem",
    category: "Food Commerce",
    title: "Operação digital completa para delivery e fast-food.",
    description:
      "Cardápio, pedidos, pagamentos, cozinha, entregas e administração em um único sistema.",
    features: ["Cardápio", "Pedidos", "Pagamentos", "Cozinha"],
    accent: "from-cyan-400/30 via-cyan-400/10 to-transparent",
  },
  {
    number: "02",
    name: "CondoFlow",
    category: "Condominium Management",
    title: "Uma nova experiência para gestão de condomínios.",
    description:
      "Comunicação entre síndicos e moradores, reservas, encomendas, ocorrências e notificações.",
    features: ["Reservas", "Encomendas", "Ocorrências", "Moradores"],
    accent: "from-violet-500/30 via-violet-500/10 to-transparent",
  },
  {
    number: "03",
    name: "VitalSync",
    category: "Health Platform",
    title: "Tecnologia para organizar toda a rotina profissional em saúde.",
    description:
      "Agenda, pacientes, atendimentos, acompanhamento, conteúdo e gestão em uma única plataforma.",
    features: ["Agenda", "Pacientes", "Atendimentos", "Feed"],
    accent: "from-cyan-300/25 via-blue-500/10 to-transparent",
  },
  {
    number: "04",
    name: "CafeFlow",
    category: "Food Management",
    title: "Gestão simples e moderna para cafeterias.",
    description:
      "Cardápio, comandas, pedidos, produtos e operação administrativa organizados em um só lugar.",
    features: ["Cardápio", "Comandas", "Pedidos", "Gestão"],
    accent: "from-fuchsia-500/20 via-violet-500/10 to-transparent",
  },
];

function ProductPreview({ index }: { index: number }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#08101d] shadow-2xl shadow-black/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12),transparent_38%)]" />

      <div className="relative flex h-11 items-center gap-2 border-b border-white/[0.06] px-5">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />

        <div className="ml-3 h-5 w-44 rounded-full bg-white/[0.04]" />
      </div>

      <div className="grid h-[calc(100%-44px)] grid-cols-[82px_1fr]">
        <div className="border-r border-white/[0.05] p-4">
          <div className="mb-8 h-7 w-7 rounded-lg bg-cyan-400/70" />

          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, item) => (
              <div
                key={item}
                className="h-7 rounded-lg bg-white/[0.035]"
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="mt-3 h-7 w-44 rounded-lg bg-white/80" />
            </div>

            <div className="h-9 w-24 rounded-full bg-cyan-400/80" />
          </div>

          <motion.div
            animate={{
              y: index % 2 === 0 ? [0, -10, 0] : [0, 10, 0],
            }}
            transition={{
              duration: 6 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="col-span-2 h-32 rounded-2xl border border-white/[0.05] bg-white/[0.04]" />

            <div className="h-32 rounded-2xl border border-white/[0.05] bg-gradient-to-br from-cyan-400/20 to-violet-500/10" />

            <div className="h-40 rounded-2xl border border-white/[0.05] bg-white/[0.035]" />

            <div className="col-span-2 h-40 rounded-2xl border border-white/[0.05] bg-white/[0.035] p-4">
              <div className="space-y-3">
                <div className="h-8 rounded-xl bg-white/[0.045]" />
                <div className="h-8 rounded-xl bg-white/[0.045]" />
                <div className="h-8 rounded-xl bg-white/[0.045]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#08101d] to-transparent" />

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/[0.08] bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/40 backdrop-blur-xl">
        Preview em desenvolvimento
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section
      id="produtos"
      className="relative border-t border-white/[0.06] bg-[#050914]"
    >
      <div className="mx-auto max-w-[1440px] px-6 py-28 lg:px-12 lg:py-36">
        <div className="mb-24 max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/60">
            Produtos Orbitta
          </p>

          <h2 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Produtos próprios.
            <span className="block text-white/35">
              Construídos para operações reais.
            </span>
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
            Estamos desenvolvendo uma linha de plataformas especializadas,
            cada uma criada para resolver necessidades específicas de
            diferentes negócios.
          </p>
        </div>

        <div>
          {products.map((product, index) => (
            <article
              key={product.name}
              className="grid min-h-[92vh] items-center gap-12 border-t border-white/[0.06] py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
            >
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs tracking-[0.22em] text-white/25">
                    {product.number}
                  </span>

                  <span className="h-px w-10 bg-white/10" />

                  <span className="text-xs uppercase tracking-[0.2em] text-cyan-300/50">
                    {product.category}
                  </span>
                </div>

                <h3 className="mt-8 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
                  {product.name}
                </h3>

                <p className="mt-6 max-w-xl text-2xl font-medium leading-tight tracking-[-0.03em] text-white/85">
                  {product.title}
                </p>

                <p className="mt-5 max-w-lg text-base leading-7 text-white/40">
                  {product.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {product.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs text-white/45"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-10 flex items-center gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/10 bg-amber-300/[0.05] px-4 py-2 text-xs text-amber-100/65">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    Em desenvolvimento
                  </div>

                  <button
                    type="button"
                    disabled
                    className="flex cursor-not-allowed items-center gap-2 text-sm text-white/20"
                  >
                    Ver produto
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 45 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.8,
                  delay: 0.08,
                }}
                className="relative"
              >
                <div
                  className={`absolute -inset-10 bg-gradient-to-br ${product.accent} opacity-60 blur-3xl`}
                />

                <div className="relative">
                  <ProductPreview index={index} />
                </div>
              </motion.div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}