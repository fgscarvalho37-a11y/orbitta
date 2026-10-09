"use client";

import Link from "next/link";
import { ArrowRight, Check, Globe2, LayoutTemplate, MessageSquareText, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCommercialSettings } from "@/hooks/useCommercialSettings";

export default function StandaloneSitesPage() {
  const { locale, text } = useLanguage();
  const { standaloneSitePriceUsd, standaloneSiteMonthlyPriceUsd } = useCommercialSettings();
  const setup = Number(standaloneSitePriceUsd ?? 0);
  const monthly = Number(standaloneSiteMonthlyPriceUsd ?? 0);
  const money = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(n);
  return (
    <main className="min-h-screen bg-[#050914] text-white">
      <Header />
      <section className="relative overflow-hidden px-6 pb-24 pt-14 lg:px-12 lg:pt-24">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-300/5 blur-3xl" />
        <div className="relative mx-auto max-w-[1200px]">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-200/60"><LayoutTemplate size={16} /> Orbitta Websites</p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-[-0.06em] sm:text-7xl">
            {text("Um site com a sua identidade.", "A website that feels like your brand.")}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/50">
            {text("Criamos sites profissionais, responsivos e pensados para seu negócio. Escolha a proposta, realize o pagamento e converse diretamente conosco em um espaço privado.",
              "We build professional, responsive websites tailored to your business. Purchase online, then collaborate with us in your private project space.")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/site-checkout" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#07101c] hover:bg-cyan-100">
              {text("Contratar meu site", "Order my website")} <ArrowRight size={17} />
            </Link>
            <Link href="/#planos" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm text-white/70 hover:text-white">
              {text("Comparar planos", "Compare plans")}
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1200px] gap-5 px-6 pb-24 lg:grid-cols-3 lg:px-12">
        {[
          { Icon: Globe2, title: text("Sua presença digital", "Your online presence"), description: text("Visual profissional, páginas responsivas, formulário e contato.", "Professional visuals, responsive pages, contact details and forms.") },
          { Icon: MessageSquareText, title: text("Conversa direta", "Direct collaboration"), description: text("Após a compra, envie referências e fale com a Orbitta sobre cada etapa.", "After checkout, send your references and message Orbitta about every step.") },
          { Icon: ShieldCheck, title: text("Entrega organizada", "Organized delivery"), description: text("Acompanhe o projeto e receba o link do seu site na área do cliente.", "Track the project and receive your website URL in your client dashboard.") },
        ].map(({ Icon, title, description }) => (
          <article key={title} className="rounded-[26px] border border-white/[0.08] bg-[#0b1321] p-7">
            <Icon className="text-cyan-200/70" size={26} />
            <h2 className="mt-6 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/45">{description}</p>
          </article>
        ))}
      </section>
      <section className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-cyan-300/15 bg-[#0b1423] p-8 sm:p-10">
          <p className="text-xs uppercase tracking-widest text-cyan-100/60">{text("Valores configurados pela Orbitta", "Pricing managed by Orbitta")}</p>
          <h2 className="mt-4 text-3xl font-semibold">{text("Escolha o site que seu negócio merece.", "Bring your next website online.")}</h2>
          <div className="mt-7 space-y-3 text-sm text-white/65">
            {monthly > 0 && <p className="flex items-center gap-3"><Check size={15} className="text-cyan-200" />{money(monthly)} {text("/ mês", "/ month")}</p>}
            {setup > 0 && <p className="flex items-center gap-3"><Check size={15} className="text-cyan-200" />{text("Implantação:", "Setup fee:")} {money(setup)}</p>}
            {!monthly && !setup && <p>{text("Os valores estão sendo configurados.", "Pricing is being configured.")}</p>}
          </div>
          <Link href="/site-checkout" className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-200 px-7 py-3.5 text-sm font-semibold text-[#07101c]">
            {text("Ir para o checkout", "Go to checkout")} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
