"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Globe2, LayoutTemplate, ShoppingBag, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCommercialSettings } from "@/hooks/useCommercialSettings";

type RegionalPrice = {
  regionCode: string;
  currency: string;
  monthlyPrice: number;
  regularMonthlyPrice?: number | null;
};
type CatalogProduct = {
  plans: Array<{
    id: number;
    monthlyPrice: number;
    currency: string;
    regionalPrices: RegionalPrice[];
  }>;
};

function money(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function OfferPlans() {
  const { text, market, locale } = useLanguage();
  const { standaloneSitePriceUsd, standaloneSiteMonthlyPriceUsd, customSiteIntegrationFeeUsd } = useCommercialSettings();
  const [planPrice, setPlanPrice] = useState<RegionalPrice | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/backend/api/catalog/products/pizzasystem", {
      cache: "no-store",
      headers: { Accept: "application/json", "X-Orbitta-Market": market },
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Plan not available")))
      .then((product: CatalogProduct) => {
        const plan = product.plans?.[0];
        const regional = plan?.regionalPrices?.find((price) => price.regionCode === market)
          ?? plan?.regionalPrices?.find((price) => price.regionCode === "US");
        const fallbackCurrency = market === "GB" ? "GBP" : market === "AU" ? "AUD" : market === "EU" ? "EUR" : null;
        const selected = regional ? { ...regional, currency: fallbackCurrency && regional.regionCode === "US" ? fallbackCurrency : regional.currency } : null;
        if (alive) setPlanPrice(selected);
      })
      .catch(() => { if (alive) setPlanPrice(null); });
    return () => { alive = false; };
  }, [market]);

  const sitePrice = Number(standaloneSitePriceUsd ?? 0);
  const siteMonthly = Number(standaloneSiteMonthlyPriceUsd ?? 0);
  const fee = Number(customSiteIntegrationFeeUsd ?? 0);
  const cards = [
    {
      key: "site",
      icon: LayoutTemplate,
      title: text("Site avulso", "Standalone website"),
      subtitle: text("Sua marca, seu endereço e sua presença digital.", "Your brand, your domain, your online presence."),
      features: [
        text("Visual exclusivo para sua empresa", "A custom design for your business"),
        text("Responsivo para celular e computador", "Mobile and desktop ready"),
        text("Formulário, contato e identidade da marca", "Contact forms and brand identity"),
      ],
      price: siteMonthly > 0 ? money(siteMonthly, "USD", locale)
        : sitePrice > 0 ? money(sitePrice, "USD", locale)
        : text("Configurar preço", "Pricing in progress"),
      suffix: siteMonthly > 0
        ? text(`por mês${sitePrice > 0 ? ` · implantação: ${money(sitePrice, "USD", locale)}` : ""}`,
               `per month${sitePrice > 0 ? ` · setup: ${money(sitePrice, "USD", locale)}` : ""}`)
        : sitePrice > 0 ? text("valor do projeto configurado pela Orbitta", "project price set by Orbitta")
        : text("temporariamente indisponível", "temporarily unavailable"),
      href: "/site-checkout",
      cta: text("Contratar site", "Order website"),
      featured: false,
    },
    {
      key: "pizza",
      icon: ShoppingBag,
      title: "PizzaSystem",
      subtitle: text("Seu cardápio e pedidos em um só lugar, sem comissão por pedido.", "Your online menu and orders, without per-order commissions."),
      features: [
        text("Cardápio, pedidos e cozinha", "Menu, orders and kitchen"),
        text("Entrega ou retirada no balcão", "Delivery or in-store pickup"),
        text("Gestão de pagamentos e relatórios", "Payments and reporting"),
      ],
      price: planPrice ? money(planPrice.monthlyPrice, planPrice.currency, locale) : text("Consultar planos", "See pricing"),
      suffix: text("por mês · anual também disponível", "per month · annual also available"),
      href: "/produtos/pizzasystem#planos",
      cta: text("Contratar PizzaSystem", "Choose PizzaSystem"),
      featured: false,
    },
    {
      key: "bundle",
      icon: Sparkles,
      title: text("Site + PizzaSystem", "Website + PizzaSystem"),
      subtitle: text("A identidade da sua pizzaria conectada ao sistema de pedidos.", "Your pizzeria's website connected to its ordering system."),
      features: [
        text("Tudo do PizzaSystem", "Everything in PizzaSystem"),
        text("Site personalizado integrado", "Integrated custom website"),
        text("Uma operação, sem duplicar cadastros", "One operation, no duplicated setup"),
      ],
      price: planPrice ? money(planPrice.monthlyPrice, planPrice.currency, locale) : text("Consultar planos", "See pricing"),
      suffix: text(`por mês + site personalizado (taxa única desde ${money(fee, "USD", locale)})`, `per month + custom website (one-time fee from ${money(fee, "USD", locale)})`),
      href: "/produtos/pizzasystem?bundle=1#planos",
      cta: text("Escolher o pacote", "Choose the bundle"),
      featured: true,
    },
  ];

  return (
    <section id="planos" className="relative scroll-mt-12 border-t border-white/[0.07] px-6 py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200/65">
              <Globe2 size={15} /> {text("Escolha como crescer", "Find your fit")}
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              {text("Três caminhos. Sua marca no centro.", "Three ways to build your online presence.")}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/50">
            {text("Do site institucional ao pedido online, escolha o que seu negócio precisa hoje.", "From a standalone website to online ordering, pick what your business needs today.")}
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.key} className={`flex h-full flex-col rounded-[30px] border p-7 sm:p-8 ${card.featured ? "border-cyan-200/30 bg-[linear-gradient(145deg,rgba(34,211,238,0.13),rgba(9,16,27,0.95)_65%)] shadow-[0_18px_80px_rgba(34,211,238,0.09)]" : "border-white/[0.09] bg-[#0b1321]"}`}>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.05] text-cyan-100">
                  <card.icon size={22} />
                </div>
                {card.featured && <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-200/80">{text("Solução completa", "Complete solution")}</span>}
              </div>
              <h3 className="mt-8 text-2xl font-semibold tracking-tight">{card.title}</h3>
              <p className="mt-3 min-h-14 text-sm leading-6 text-white/55">{card.subtitle}</p>
              <div className="mt-8 min-h-24 border-t border-white/[0.08] pt-6">
                {card.key !== "site" && planPrice && Number(planPrice.regularMonthlyPrice ?? 99.90) > planPrice.monthlyPrice && (
                  <div className="mb-1 text-sm text-white/35 line-through">{money(Number(planPrice.regularMonthlyPrice ?? 99.90), planPrice.currency, locale)}</div>
                )}
                <div className="text-3xl font-semibold tracking-tight sm:text-4xl">{card.price}</div>
                <p className="mt-2 text-xs leading-5 text-white/45">{card.suffix}</p>
              </div>
              <ul className="mt-7 flex-1 space-y-4 border-t border-white/[0.08] pt-6">
                {card.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-white/75">
                    <Check size={16} className="mt-1 shrink-0 text-cyan-300" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href={card.href} className={`group mt-10 flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-center text-sm font-semibold transition hover:scale-[1.01] ${card.featured ? "bg-cyan-200 text-[#07101c] hover:bg-white" : "bg-white text-[#07101c] hover:bg-cyan-100"}`}>
                {card.cta} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-7 text-center text-xs leading-6 text-white/35">
          {text("Site avulso: implantação e mensalidade são definidas no painel Orbitta. A cobrança e as condições exatas aparecem no checkout antes de pagar.", "Standalone websites: setup and monthly prices are configured by Orbitta. Exact charges and terms appear at checkout before payment.")}
        </p>
      </div>
    </section>
  );
}
