"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-96px)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_36%,rgba(34,211,238,0.10),transparent_26%),radial-gradient(circle_at_58%_52%,rgba(124,58,237,0.12),transparent_34%)]" />

      <div className="orbitta-grid absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-[1440px] items-center gap-12 px-6 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3.5 py-2 text-xs text-cyan-100"
          >
            <Sparkles size={14} />
            Software pensado para negócios reais
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08 }}
            className="max-w-4xl text-[clamp(3.5rem,7vw,7.4rem)] font-semibold leading-[0.92] tracking-[-0.065em]"
          >
            Tecnologia para
            <span className="block bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              colocar ideias
            </span>
            em órbita.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-8 max-w-2xl text-base leading-7 text-white/50 sm:text-lg"
          >
            Desenvolvemos SaaS, plataformas, sites e aplicativos com foco em
            experiência, tecnologia e crescimento.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.26 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#produtos"
              className="group flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#07101c] transition hover:scale-[1.02]"
            >
              Conhecer produtos
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>

            <a
              href="#contato"
              className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/[0.08] hover:text-white"
            >
              Falar com a Orbitta
            </a>
          </motion.div>

          <div className="mt-16 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/[0.07] pt-6 text-xs uppercase tracking-[0.16em] text-white/30">
            <span>SaaS</span>
            <span>Software</span>
            <span>Web</span>
            <span>Mobile</span>
            <span>Produtos digitais</span>
          </div>
        </div>

        <div className="relative hidden h-[620px] items-center justify-center lg:flex">
          <div className="absolute h-[570px] w-[570px] rounded-full bg-cyan-400/[0.025] blur-3xl" />

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex h-[510px] w-[510px] items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute h-[430px] w-[430px] rounded-full border border-violet-500/60 shadow-[0_0_35px_rgba(111,65,255,0.12)]"
            >
              <div className="absolute left-1/2 top-[-13px] h-7 w-7 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_32px_rgba(34,211,238,0.95)]" />
            </motion.div>

            <div className="relative h-52 w-52 rounded-full bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-500 shadow-[0_0_90px_rgba(34,211,238,0.35)]">
              <div className="absolute inset-5 rounded-full bg-white/5 blur-xl" />
            </div>

            <div className="absolute bottom-7 right-0 rounded-2xl border border-white/[0.08] bg-[#0b1220]/80 px-4 py-3 backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Orbitta Network
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Sistemas em desenvolvimento
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}