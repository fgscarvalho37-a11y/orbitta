"use client";

import {
  ArrowRight,
  Check,
  Globe2,
  Loader2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";

const API_URL = "/backend";
const MARKET_STORAGE_KEY = "orbitta-market";

type RegionalPrice = {
  id: number;
  regionCode: string;
  currency: string;
  monthlyPrice: number;
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

type CsrfResponse = {
  token: string;
  headerName: string;
  parameterName: string;
};

type CheckoutResponse = {
  id: number;
};

type ProductPricingProps = {
  slug: string;
};

type MarketCode =
  | "BR"
  | "US";

const MARKETS: Array<{
  code: MarketCode;
  pt: string;
  en: string;
  currency: string;
}> = [
  {
    code: "BR",
    pt: "Brasil",
    en: "Brazil",
    currency: "BRL",
  },
  {
    code: "US",
    pt: "Estados Unidos",
    en: "United States",
    currency: "USD",
  },
];

function detectMarket(): MarketCode {
  const languages =
    typeof navigator !== "undefined"
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      : [];

  for (const language of languages) {
    const parts =
      language
        .replace("_", "-")
        .split("-");

    const region =
      parts.length > 1
        ? parts[
            parts.length - 1
          ].toUpperCase()
        : "";

    if (region === "BR") {
      return "BR";
    }

    if (region === "US") {
      return "US";
    }
  }

  const primary =
    languages[0]
      ?.toLowerCase() ?? "";

  return primary.startsWith("pt")
    ? "BR"
    : "US";
}

function isMarketCode(
  value: string | null
): value is MarketCode {
  return MARKETS.some(
    (market) =>
      market.code === value
  );
}

function formatMoney(
  value: number,
  currency: string,
  locale: string
) {
  try {
    return new Intl.NumberFormat(
      locale,
      {
        style: "currency",
        currency,
      }
    ).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function englishPlanName(
  plan: CatalogPlan
) {
  const normalized =
    plan.name
      .trim()
      .toLowerCase();

  if (
    normalized === "essencial"
  ) {
    return "Essential";
  }

  if (
    normalized === "profissional"
  ) {
    return "Professional";
  }

  if (
    normalized === "completo"
  ) {
    return "Complete";
  }

  return plan.name;
}

async function readErrorMessage(
  response: Response
) {
  const responseText =
    await response.text();

  if (!responseText) {
    return "Não foi possível concluir a solicitação.";
  }

  try {
    const data =
      JSON.parse(responseText);

    if (
      typeof data?.message ===
        "string" &&
      data.message.trim()
    ) {
      return data.message;
    }

    if (
      typeof data?.error ===
        "string" &&
      data.error.trim()
    ) {
      return data.error;
    }
  } catch {
    // A resposta não era JSON.
  }

  return responseText;
}

export default function ProductPricing({
  slug,
}: ProductPricingProps) {
  const router = useRouter();

  const {
    locale,
    isEnglish,
    text,
  } = useLanguage();

  const [product, setProduct] =
    useState<CatalogProduct | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [unavailable, setUnavailable] =
    useState(false);

  const [
    contractingPlanId,
    setContractingPlanId,
  ] = useState<number | null>(null);

  const [
    checkoutError,
    setCheckoutError,
  ] = useState<string | null>(null);

  const [market, setMarket] =
    useState<MarketCode>("BR");

  useEffect(() => {
    const saved =
      window.localStorage.getItem(
        MARKET_STORAGE_KEY
      );

    const detected =
      isMarketCode(saved)
        ? saved
        : detectMarket();

    setMarket(detected);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      MARKET_STORAGE_KEY,
      market
    );
  }, [market]);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setUnavailable(false);

        const response =
          await fetch(
            `${API_URL}/api/catalog/products/${slug}`,
            {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          if (!cancelled) {
            setUnavailable(true);
          }

          return;
        }

        const data:
          CatalogProduct =
          await response.json();

        if (!cancelled) {
          setProduct(data);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar planos:",
          error
        );

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
  }, [slug]);

  const currentMarket =
    useMemo(
      () =>
        MARKETS.find(
          (item) =>
            item.code === market
        ) ?? MARKETS[0],
      [market]
    );

  function selectedPrice(
    plan: CatalogPlan
  ): RegionalPrice | null {
    const prices =
      plan.regionalPrices ?? [];

    const regional =
      prices.find(
        (price) =>
          price.active &&
          price.regionCode === market
      );

    if (regional) {
      return regional;
    }

    if (
      market === "BR" &&
      prices.length === 0
    ) {
      return {
        id: 0,
        regionCode: "BR",
        currency:
          plan.currency,
        monthlyPrice:
          plan.monthlyPrice,
        setupPrice:
          plan.setupPrice,
        active: plan.active,
        displayOrder: 0,
      };
    }

    return null;
  }

  async function handleContract(
    plan: CatalogPlan,
    price: RegionalPrice
  ) {
    if (
      contractingPlanId !== null
    ) {
      return;
    }

    try {
      setContractingPlanId(
        plan.id
      );
      setCheckoutError(null);

      const priceId =
        price.id > 0
          ? price.id
          : null;

      const returnUrl =
        `/checkout/start?planId=${plan.id}${
          priceId
            ? `&priceId=${priceId}`
            : ""
        }`;

      const meResponse =
        await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials:
              "include",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (
        meResponse.status ===
          401 ||
        meResponse.status === 403
      ) {
        router.push(
          `/login?returnUrl=${encodeURIComponent(
            returnUrl
          )}`
        );

        return;
      }

      if (!meResponse.ok) {
        throw new Error(
          text(
            "Não foi possível verificar sua sessão.",
            "We could not verify your session."
          )
        );
      }

      const activeProductsResponse =
        await fetch(
          `${API_URL}/api/client/products/active`,
          {
            method: "GET",
            credentials:
              "include",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (
        activeProductsResponse.ok
      ) {
        const activeProducts:
          Array<{
            name?: string;
          }> =
          await activeProductsResponse.json();

        const alreadyHasProduct =
          activeProducts.some(
            (activeProduct) =>
              activeProduct.name
                ?.trim()
                .toLowerCase() ===
              product?.name
                ?.trim()
                .toLowerCase()
          );

        if (alreadyHasProduct) {
          router.push(
            "/painel"
          );
          return;
        }
      }

      const csrfResponse =
        await fetch(
          `${API_URL}/api/csrf`,
          {
            method: "GET",
            credentials:
              "include",
            cache: "no-store",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (!csrfResponse.ok) {
        throw new Error(
          text(
            "Não foi possível iniciar a contratação.",
            "We could not start your subscription."
          )
        );
      }

      const csrf: CsrfResponse =
        await csrfResponse.json();

      const checkoutResponse =
        await fetch(
          `${API_URL}/api/checkout/subscriptions`,
          {
            method: "POST",
            credentials:
              "include",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
              [csrf.headerName]:
                csrf.token,
            },
            body: JSON.stringify({
              planId: plan.id,
              priceId,
            }),
          }
        );

      if (
        checkoutResponse.status ===
          401 ||
        checkoutResponse.status ===
          403
      ) {
        router.push(
          `/login?returnUrl=${encodeURIComponent(
            returnUrl
          )}`
        );
        return;
      }

      if (!checkoutResponse.ok) {
        throw new Error(
          await readErrorMessage(
            checkoutResponse
          )
        );
      }

      const checkout:
        CheckoutResponse =
        await checkoutResponse.json();

      router.push(
        `/checkout/${checkout.id}`
      );
    } catch (error) {
      console.error(
        "Erro ao iniciar contratação:",
        error
      );

      setCheckoutError(
        error instanceof Error
          ? error.message
          : text(
              "Não foi possível iniciar a contratação.",
              "We could not start your subscription."
            )
      );
    } finally {
      setContractingPlanId(
        null
      );
    }
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
              {text(
                "Carregando planos",
                "Loading plans"
              )}
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
      className="border-t border-white/[0.06]"
    >
      <div className="mx-auto max-w-[1440px] px-6 py-32 lg:px-12 lg:py-40">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
              {text(
                "Planos",
                "Plans"
              )}
            </p>

            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {text(
                `Escolha como usar o ${product.name}.`,
                `Choose your ${product.name} plan.`
              )}
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/35">
              {text(
                "O valor abaixo é o preço comercial definido para o seu mercado.",
                "The price below is the commercial price configured for your market."
              )}
            </p>
          </div>

          <label className="min-w-[240px]">
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/25">
              <Globe2 size={12} />
              {text(
                "Região de cobrança",
                "Billing region"
              )}
            </span>

            <select
              value={market}
              onChange={(event) =>
                setMarket(
                  event.target
                    .value as MarketCode
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-[#08101d] px-4 text-sm text-white/65 outline-none"
            >
              {MARKETS.map(
                (item) => (
                  <option
                    key={
                      item.code
                    }
                    value={
                      item.code
                    }
                  >
                    {isEnglish
                      ? item.en
                      : item.pt}{" "}
                    —{" "}
                    {
                      item.currency
                    }
                  </option>
                )
              )}
            </select>

            <div className="mt-2 text-[10px] text-white/20">
              {text(
                "Detectado automaticamente; você pode alterar.",
                "Detected automatically; you can change it."
              )}
            </div>
          </label>
        </div>

        {checkoutError && (
          <div className="mt-8 max-w-xl rounded-2xl border border-red-400/10 bg-red-400/[0.05] px-5 py-4 text-sm leading-6 text-red-200/70">
            {checkoutError}
          </div>
        )}

        <div
          className={`mt-14 grid gap-5 ${
            product.plans.length === 1
              ? "max-w-xl"
              : product.plans.length === 2
                ? "max-w-5xl md:grid-cols-2"
                : "lg:grid-cols-3"
          }`}
        >
          {product.plans.map(
            (plan) => {
              const price =
                selectedPrice(
                  plan
                );

              const contracting =
                contractingPlanId ===
                plan.id;

              return (
                <article
                  key={plan.id}
                  className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#08101d] p-7 sm:p-8"
                >
                  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/[0.055] blur-[70px]" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/45">
                          {
                            product.name
                          }
                        </p>

                        <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em]">
                          {isEnglish
                            ? englishPlanName(
                                plan
                              )
                            : plan.name}
                        </h3>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] text-emerald-200/60">
                        <Check
                          size={15}
                        />
                      </div>
                    </div>

                    <p className="mt-5 min-h-[48px] text-sm leading-6 text-white/30">
                      {isEnglish
                        ? "A monthly Orbitta plan with platform access, updates and support included."
                        : plan.description ||
                          "Plano mensal Orbitta com acesso à plataforma, atualizações e suporte incluídos."}
                    </p>

                    <div className="mt-8">
                      {price ? (
                        <>
                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-semibold tracking-[-0.05em] text-white">
                              {formatMoney(
                                Number(
                                  price.monthlyPrice
                                ),
                                price.currency,
                                locale
                              )}
                            </span>

                            <span className="pb-1 text-xs text-white/25">
                              {text(
                                "/ mês",
                                "/ month"
                              )}
                            </span>
                          </div>

                          {Number(
                            price.setupPrice
                          ) > 0 && (
                            <p className="mt-2 text-[11px] text-white/25">
                              +{" "}
                              {formatMoney(
                                Number(
                                  price.setupPrice
                                ),
                                price.currency,
                                locale
                              )}{" "}
                              {text(
                                "de taxa inicial",
                                "setup fee"
                              )}
                            </p>
                          )}

                          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-cyan-200/35">
                            {isEnglish
                              ? currentMarket.en
                              : currentMarket.pt}{" "}
                            ·{" "}
                            {
                              price.currency
                            }
                          </p>
                        </>
                      ) : (
                        <div className="rounded-2xl border border-amber-300/[0.08] bg-amber-300/[0.035] px-4 py-4 text-sm text-amber-100/60">
                          {text(
                            "Preço ainda não cadastrado para esta região.",
                            "Pricing is not available for this region yet."
                          )}
                        </div>
                      )}
                    </div>

                    <div className="my-8 h-px bg-white/[0.06]" />

                    <div className="space-y-3">
                      {[
                        text(
                          "Acesso à plataforma",
                          "Platform access"
                        ),
                        text(
                          "Atualizações incluídas",
                          "Updates included"
                        ),
                        text(
                          "Suporte Orbitta",
                          "Orbitta support"
                        ),
                      ].map(
                        (feature) => (
                          <div
                            key={
                              feature
                            }
                            className="flex items-center gap-3 text-xs text-white/45"
                          >
                            <Check
                              size={14}
                              className="text-cyan-300/60"
                            />
                            {
                              feature
                            }
                          </div>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        price &&
                        void handleContract(
                          plan,
                          price
                        )
                      }
                      disabled={
                        contractingPlanId !==
                          null ||
                        !price
                      }
                      className="group mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-sm font-semibold text-[#07101c] transition hover:scale-[1.01] hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                    >
                      {contracting ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                          {text(
                            "Iniciando...",
                            "Starting..."
                          )}
                        </>
                      ) : (
                        <>
                          {text(
                            "Contratar",
                            "Subscribe"
                          )}

                          <ArrowRight
                            size={15}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
