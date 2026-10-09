"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Globe2,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  useLanguage,
  type MarketCode,
} from "@/i18n/LanguageProvider";

const API_URL = "/backend";

type RegionalPrice = {
  id: number;
  regionCode: string;
  currency: string;
  monthlyPrice: number;
  regularMonthlyPrice?: number | null;
  setupPrice: number;
  active: boolean;
  displayOrder: number;
};

type CatalogPlan = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  regularMonthlyPrice?: number | null;
  setupPrice: number;
  currency: string;
  active: boolean;
  displayOrder: number;
  regionalPrices: RegionalPrice[];
};

type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  landingPageUrl: string | null;
  active: boolean;
  displayOrder: number;
  plans: CatalogPlan[];
};

type ProductPricingProps = {
  slug: string;
};

type BillingCycle = "MONTHLY" | "ANNUAL";

const MARKET_META: Record<
  MarketCode,
  {
    pt: string;
    en: string;
    currency: string;
  }
> = {
  BR: {
    pt: "Brasil",
    en: "Brazil",
    currency: "BRL",
  },
  US: {
    pt: "Estados Unidos",
    en: "United States",
    currency: "USD",
  },
  GB: {
    pt: "Reino Unido",
    en: "United Kingdom",
    currency: "GBP",
  },
  AU: {
    pt: "Austrália",
    en: "Australia",
    currency: "AUD",
  },
  EU: {
    pt: "Europa",
    en: "Europe",
    currency: "EUR",
  },
  CA: {
    pt: "Canadá",
    en: "Canada",
    currency: "CAD",
  },
};

const PACKAGE_FEATURES: Record<
  string,
  {
    pt: string[];
    en: string[];
  }
> = {
  pizzasystem: {
    pt: [
      "Cardápio online com fotos e ingredientes",
      "Categorias e organização do cardápio",
      "Produtos, adicionais, observações e complementos",
      "Bordas configuráveis",
      "Pedidos online em tempo real",
      "Checkout próprio da pizzaria",
      "Pix e cartão no Brasil",
      "Stripe Connect para operação internacional",
      "Dinheiro na entrega",
      "Cupons e promoções",
      "Taxa de entrega fixa ou por distância",
      "Faixas de entrega por quilômetro",
      "Quilometragem grátis configurável",
      "Cálculo de rota e distância",
      "Painel de pedidos",
      "Painel de cozinha",
      "Fluxo Recebido → Preparando → Pronto → Entregue",
      "Controle de entregas",
      "Caixa",
      "Histórico de pedidos",
      "Relatórios de vendas",
      "Horários de funcionamento",
      "Personalização da loja",
      "Domínio e endereço público da loja",
      "Painel administrativo protegido",
      "Atualizações incluídas",
      "Suporte Orbitta",
    ],
    en: [
      "Online menu with photos and ingredients",
      "Menu categories and organization",
      "Products, add-ons, notes and extras",
      "Configurable crusts",
      "Real-time online orders",
      "Restaurant-owned checkout",
      "Brazilian Pix and card payments",
      "Stripe Connect for international operations",
      "Cash on delivery",
      "Coupons and promotions",
      "Fixed or distance-based delivery fees",
      "Delivery distance bands",
      "Configurable free-delivery radius",
      "Route and distance calculation",
      "Orders dashboard",
      "Kitchen dashboard",
      "Received → Preparing → Ready → Delivered workflow",
      "Delivery management",
      "Cash register",
      "Order history",
      "Sales reports",
      "Business hours",
      "Store personalization",
      "Public store domain and URL",
      "Protected admin dashboard",
      "Updates included",
      "Orbitta support",
    ],
  },
  condoflow: {
    pt: [
      "Painel do síndico",
      "Acesso da portaria",
      "Correspondências",
      "Cadastro de múltiplas correspondências",
      "Reservas de espaços",
      "Controle de utilização",
      "Ocorrências",
      "Logs administrativos",
      "Horários personalizados",
      "Operação multi-condomínio",
      "Web e Android",
      "Atualizações incluídas",
    ],
    en: [
      "Manager dashboard",
      "Front desk access",
      "Deliveries and parcels",
      "Multiple parcel registration",
      "Space reservations",
      "Usage checkout",
      "Incidents",
      "Administrative logs",
      "Custom schedules",
      "Multi-condominium operation",
      "Web and Android",
      "Updates included",
    ],
  },
};

function formatMoney(
  value: number,
  currency: string,
  locale: string
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function englishPlanName(plan: CatalogPlan) {
  const normalized = plan.name.trim().toLowerCase();

  if (normalized === "essencial") return "Essential";
  if (normalized === "profissional") return "Professional";
  if (normalized === "completo") return "Complete";

  return plan.name;
}

export default function ProductPricing({
  slug,
}: ProductPricingProps) {
  const router = useRouter();
  const { locale, isEnglish, text, market: selectedMarket } = useLanguage();

  const [product, setProduct] =
    useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [market, setMarket] = useState<MarketCode>("BR");
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("MONTHLY");
  const [expanded, setExpanded] = useState(false);
  const [contractingPlanId, setContractingPlanId] =
    useState<number | null>(null);
  const [checkoutError, setCheckoutError] =
    useState<string | null>(null);

  useEffect(() => {
    setMarket(selectedMarket);
  }, [selectedMarket]);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setUnavailable(false);

        const response = await fetch(
          `${API_URL}/api/catalog/products/${slug}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              "X-Orbitta-Market": selectedMarket,
            },
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setUnavailable(true);
          }
          return;
        }

        const data: CatalogProduct =
          await response.json();

        if (!cancelled) {
          setProduct(data);
        }
      } catch {
        if (!cancelled) {
          setUnavailable(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug, selectedMarket]);

  const marketMeta = MARKET_META[market];

  const features = useMemo(() => {
    const list =
      PACKAGE_FEATURES[slug] ??
      PACKAGE_FEATURES.pizzasystem;

    return isEnglish ? list.en : list.pt;
  }, [slug, isEnglish]);

  const visibleFeatures =
    expanded ? features : features.slice(0, 8);

  function selectedPrice(
    plan: CatalogPlan
  ): RegionalPrice | null {
    const prices = plan.regionalPrices ?? [];

    const regional = prices.find(
      (price) =>
        price.active &&
        price.regionCode === market
    );

    if (regional) {
      return regional;
    }

    if (market === "GB" || market === "EU" || market === "AU") {
      const internationalPrice = prices.find(
        (price) =>
          price.active &&
          price.regionCode === "US" &&
          price.currency.toUpperCase() === "USD"
      );

      if (internationalPrice) {
        return {
          ...internationalPrice,
          currency: market === "GB" ? "GBP" : market === "EU" ? "EUR" : "AUD",
        };
      }
    }

    if (market === "BR" && prices.length === 0) {
      return {
        id: 0,
        regionCode: "BR",
        currency: plan.currency,
        monthlyPrice: plan.monthlyPrice,
        setupPrice: plan.setupPrice,
        active: plan.active,
        displayOrder: 0,
      };
    }

    return null;
  }

  function handleContract(
    plan: CatalogPlan,
    price: RegionalPrice
  ) {
    if (contractingPlanId !== null) {
      return;
    }

    setContractingPlanId(
      plan.id
    );
    setCheckoutError(
      null
    );

    const params =
      new URLSearchParams();

    params.set(
      "planId",
      String(
        plan.id
      )
    );

    if (price.id > 0) {
      params.set(
        "priceId",
        String(
          price.id
        )
      );
    }

    params.set(
      "billingCycle",
      billingCycle
    );

    params.set(
      "productSlug",
      slug
    );

    params.set(
      "displayCurrency",
      price.currency
    );

    if (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("bundle") === "1") {
      params.set("customSiteIntegration", "1");
    }

    router.push(
      `/checkout/start?${params.toString()}`
    );
  }

  if (loading) {
    return (
      <section
        id="planos"
        className="border-t border-white/[0.06]"
      >
        <div className="mx-auto flex min-h-[400px] max-w-[1440px] items-center justify-center px-6 py-24 lg:px-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2
              size={21}
              className="animate-spin text-cyan-300/50"
            />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
              {text("Carregando planos", "Loading plans")}
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (
    unavailable ||
    !product ||
    product.plans.length === 0
  ) {
    return null;
  }

  return (
    <section
      id="planos"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#050914]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(249,115,22,0.12),transparent_24%),radial-gradient(circle_at_54%_44%,rgba(239,68,68,0.075),transparent_34%),radial-gradient(circle_at_46%_48%,rgba(251,191,36,0.055),transparent_42%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[31%] h-[420px] w-[720px] -translate-x-1/2 rounded-[50%] bg-orange-500/[0.04] blur-[110px]" />

      <div className="relative mx-auto max-w-[1440px] px-6 py-32 lg:px-12 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/15 bg-orange-300/[0.05] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-orange-100/60">
            <Flame size={13} />
            {text("Plano completo", "Complete plan")}
          </div>

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {text(
              `Tudo do ${product.name}, sem esconder recurso em plano mais caro.`,
              `Everything in ${product.name}, without locking features behind a higher tier.`
            )}
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/40">
            {text(
              "Escolha mensal ou anual. No anual você recebe 12 meses de acesso e paga o equivalente a 10 mensalidades.",
              "Choose monthly or annual. The annual option gives you 12 months of access for the price of 10 monthly payments."
            )}
          </p>

          <div className="mt-8 inline-flex rounded-full border border-white/[0.08] bg-black/20 p-1.5 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={
                billingCycle === "MONTHLY"
                  ? "rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#07101c]"
                  : "rounded-full px-5 py-2.5 text-xs text-white/40 transition hover:text-white/70"
              }
            >
              {text("Mensal", "Monthly")}
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("ANNUAL")}
              className={
                billingCycle === "ANNUAL"
                  ? "flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#07101c]"
                  : "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs text-white/40 transition hover:text-white/70"
              }
            >
              {text("Anual", "Annual")}
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[9px] font-bold text-orange-700">
                {text("Pague 10, use 12", "Pay 10, get 12")}
              </span>
            </button>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/25">
            <Globe2 size={12} />
            {text(
              `Preço ajustado automaticamente para ${marketMeta.pt}`,
              `Price automatically adjusted for ${marketMeta.en}`
            )}
          </div>
        </div>

        {checkoutError && (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-red-400/10 bg-red-400/[0.05] px-5 py-4 text-sm leading-6 text-red-200/70">
            {checkoutError}
          </div>
        )}

        <div
          className={`mx-auto mt-14 grid gap-5 ${
            product.plans.length === 1
              ? "max-w-2xl"
              : product.plans.length === 2
                ? "max-w-5xl md:grid-cols-2"
                : "lg:grid-cols-3"
          }`}
        >
          {product.plans.map((plan) => {
            const price = selectedPrice(plan);
            const contracting =
              contractingPlanId === plan.id;

            const monthlyValue =
              Number(price?.monthlyPrice ?? 0);
            const annualValue =
              monthlyValue * 10;
            const annualEquivalent =
              annualValue / 12;
            const displayedValue =
              billingCycle === "ANNUAL"
                ? annualValue
                : monthlyValue;
            const regularMonthly = Number(price?.regularMonthlyPrice ?? 99.90);

            return (
              <article
                key={plan.id}
                className="relative overflow-hidden rounded-[32px] border border-orange-300/[0.14] bg-[#09101b]/95 p-7 shadow-[0_30px_100px_rgba(249,115,22,0.08)] sm:p-9"
              >
                <div className="pointer-events-none absolute inset-x-10 top-0 h-24 bg-gradient-to-b from-orange-400/[0.08] to-transparent blur-2xl" />
                <div className="pointer-events-none absolute -right-16 top-20 h-40 w-40 rounded-full bg-orange-500/[0.07] blur-[70px]" />
                <div className="relative">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-300/15 bg-orange-300/[0.06] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-orange-100/65">
                    <Flame size={11} />
                    {text("Preço de lançamento", "Launch pricing")}
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-orange-200/55">
                        {product.name}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                        {isEnglish
                          ? englishPlanName(plan)
                          : plan.name}
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-300/15 bg-orange-300/[0.06] text-orange-100/70">
                      <Sparkles size={16} />
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-white/35">
                    {isEnglish
                      ? "One package with the complete product, updates and Orbitta support included."
                      : plan.description ||
                        "Pacote completo com acesso à plataforma, atualizações e suporte Orbitta incluídos."}
                  </p>

                  <div className="mt-8">
                    {price ? (
                      <>
                        {regularMonthly > monthlyValue && (
                        <div className="text-xs text-white/25">
                          <span className="line-through">
                            {formatMoney(
                              regularMonthly,
                              price.currency,
                              locale
                            )}
                            {text(" / mês", " / month")}
                          </span>
                          <span className="ml-2 text-orange-200/55">
                            {text("preço regular", "regular price")}
                          </span>
                        </div>
                        )}

                        <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                          <span className="text-5xl font-semibold tracking-[-0.055em] text-white">
                            {formatMoney(
                              displayedValue,
                              price.currency,
                              locale
                            )}
                          </span>
                          <span className="pb-1 text-xs text-white/30">
                            {billingCycle === "ANNUAL"
                              ? text("/ ano", "/ year")
                              : text("/ mês", "/ month")}
                          </span>
                        </div>

                        {billingCycle === "ANNUAL" && (
                          <div className="mt-4 rounded-2xl border border-emerald-300/[0.09] bg-emerald-300/[0.035] px-4 py-3">
                            <p className="text-xs leading-5 text-emerald-100/75">
                              {text(
                                `12 meses por ${formatMoney(
                                  annualValue,
                                  price.currency,
                                  locale
                                )} — você economiza 2 mensalidades.`,
                                `12 months for ${formatMoney(
                                  annualValue,
                                  price.currency,
                                  locale
                                )} — you save 2 monthly payments.`
                              )}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-emerald-100/40">
                              {text(
                                `Equivale a ${formatMoney(
                                  annualEquivalent,
                                  price.currency,
                                  locale
                                )} por mês`,
                                `Equivalent to ${formatMoney(
                                  annualEquivalent,
                                  price.currency,
                                  locale
                                )} per month`
                              )}
                            </p>
                          </div>
                        )}

                        <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-orange-100/35">
                          {isEnglish
                            ? marketMeta.en
                            : marketMeta.pt}{" "}
                          · {price.currency}
                        </p>
                      </>
                    ) : (
                      <div className="rounded-2xl border border-amber-300/[0.08] bg-amber-300/[0.035] px-4 py-4 text-sm text-amber-100/60">
                        {text(
                          "Preço ainda não cadastrado para sua região.",
                          "Pricing is not available for your region yet."
                        )}
                      </div>
                    )}
                  </div>

                  <div className="my-8 h-px bg-white/[0.06]" />

                  <div className="space-y-3">
                    {visibleFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3 text-xs leading-5 text-white/48"
                      >
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-orange-200/65"
                        />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {features.length > 8 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((current) => !current)
                      }
                      className="mt-5 flex items-center gap-2 text-xs font-medium text-orange-100/55 transition hover:text-orange-100"
                    >
                      {expanded
                        ? text(
                            "Mostrar menos",
                            "Show less"
                          )
                        : text(
                            `Mostrar todas as ${features.length} funcionalidades`,
                            `Show all ${features.length} features`
                          )}
                      {expanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      price &&
                      handleContract(plan, price)
                    }
                    disabled={
                      contractingPlanId !== null ||
                      !price
                    }
                    className="group mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-[#07101c] transition hover:scale-[1.01] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  >
                    {contracting ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        {text("Iniciando...", "Starting...")}
                      </>
                    ) : (
                      <>
                        {billingCycle === "ANNUAL"
                          ? text(
                              "Contratar anual",
                              "Choose annual"
                            )
                          : text(
                              "Contratar mensal",
                              "Choose monthly"
                            )}
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-center text-[10px] leading-4 text-white/20">
                    {billingCycle === "ANNUAL"
                      ? text(
                          "Pagamento anual antecipado. Acesso válido por 12 meses.",
                          "Annual prepaid billing. Access is valid for 12 months."
                        )
                      : text(
                          "Cobrança mensal conforme o meio de pagamento disponível.",
                          "Monthly billing through the available payment method."
                        )}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
