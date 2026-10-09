"use client";

import { secureFetch } from "@/lib/secureFetch";

import {
  Check,
  CircleDollarSign,
  Globe2,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

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
  active: boolean;
  plans: CatalogPlan[];
};

type PriceDraft = {
  monthlyPrice: string;
  regularMonthlyPrice: string;
  setupPrice: string;
  active: boolean;
};

type CommercialSettings = {
  customSiteIntegrationFeeUsd: number;
  standaloneSitePriceUsd: number;
  standaloneSiteMonthlyPriceUsd: number;
  bundleMonthlyPriceUsd: number;
  currency: string;
  updatedAt: string | null;
};

const MARKETS = [
  {
    code: "BR",
    currency: "BRL",
    pt: "Brasil",
    en: "Brazil",
    gateway: "Mercado Pago",
  },
  {
    code: "US",
    currency: "USD",
    pt: "Estados Unidos",
    en: "United States",
    gateway: "Mercado Pago",
  },
  {
    code: "GB",
    currency: "GBP",
    pt: "Reino Unido",
    en: "United Kingdom",
    gateway: "Mercado Pago",
  },
  {
    code: "AU",
    currency: "AUD",
    pt: "Austrália",
    en: "Australia",
    gateway: "Mercado Pago",
  },
] as const;

function moneyInput(value: number | undefined) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).replace(".", ",");
}

function parseMoney(value: string) {
  const parsed = Number(
    value
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  return Number.isFinite(parsed)
    ? parsed
    : NaN;
}

function draftKey(
  planId: number,
  regionCode: string
) {
  return `${planId}:${regionCode}`;
}

export default function AdminRegionalPricingPage() {
  const { locale, text } =
    useLanguage();

  const [products, setProducts] =
    useState<CatalogProduct[]>([]);

  const [drafts, setDrafts] =
    useState<Record<string, PriceDraft>>({});

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [savingKey, setSavingKey] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [standaloneSiteMonthlyPrice, setStandaloneSiteMonthlyPrice] = useState("0");
  const [bundleMonthlyPrice, setBundleMonthlyPrice] = useState("0");

  const [
    savingCustomSiteFee,
    setSavingCustomSiteFee,
  ] =
    useState(false);

  const load = useCallback(
    async (manual = false) => {
      try {
        manual
          ? setRefreshing(true)
          : setLoading(true);

        setError(null);

        const [
          response,
          commercialSettingsResponse,
        ] =
          await Promise.all([
            secureFetch(
              `${API_URL}/api/admin/catalog/products`,
              {
                credentials: "include",
                cache: "no-store",
                headers: {
                  Accept: "application/json",
                },
              }
            ),
            secureFetch(
              `${API_URL}/api/admin/commercial-settings`,
              {
                credentials: "include",
                cache: "no-store",
                headers: {
                  Accept: "application/json",
                },
              }
            ),
          ]);

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(
            text(
              "Não foi possível carregar os preços.",
              "Could not load regional prices."
            )
          );
        }

        const data: CatalogProduct[] =
          await response.json();

        if (
          commercialSettingsResponse.ok
        ) {
          const commercialSettings:
            CommercialSettings =
            await commercialSettingsResponse.json();

          setStandaloneSiteMonthlyPrice(moneyInput(commercialSettings.standaloneSiteMonthlyPriceUsd ?? 0));
          setBundleMonthlyPrice(moneyInput(commercialSettings.bundleMonthlyPriceUsd ?? 0));
        }

        const nextDrafts:
          Record<string, PriceDraft> = {};

        for (const product of data) {
          for (const plan of product.plans ?? []) {
            for (const market of MARKETS) {
              const price =
                plan.regionalPrices?.find(
                  (item) =>
                    item.regionCode ===
                    market.code
                );

              nextDrafts[
                draftKey(
                  plan.id,
                  market.code
                )
              ] = {
                monthlyPrice:
                  moneyInput(price?.monthlyPrice),
                regularMonthlyPrice:
                  moneyInput(price?.regularMonthlyPrice ?? 99.90),
                setupPrice:
                  moneyInput(
                    price?.setupPrice ?? 0
                  ),
                active:
                  price?.active ?? false,
              };
            }
          }
        }

        setProducts(data);
        setDrafts(nextDrafts);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : text(
                "Não foi possível carregar os preços.",
                "Could not load regional prices."
              )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [text]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const plans = useMemo(
    () =>
      products.flatMap((product) =>
        (product.plans ?? []).map(
          (plan) => ({
            product,
            plan,
          })
        )
      ),
    [products]
  );

  function updateDraft(
    planId: number,
    regionCode: string,
    patch: Partial<PriceDraft>
  ) {
    const key =
      draftKey(
        planId,
        regionCode
      );

    setDrafts((current) => ({
      ...current,
      [key]: {
        monthlyPrice:
          current[key]?.monthlyPrice ??
          "",
        regularMonthlyPrice:
          current[key]?.regularMonthlyPrice ??
          "99,90",
        setupPrice:
          current[key]?.setupPrice ??
          "0",
        active:
          current[key]?.active ??
          false,
        ...patch,
      },
    }));
  }

  async function savePrice(
    plan: CatalogPlan,
    regionCode: string
  ) {
    const key =
      draftKey(
        plan.id,
        regionCode
      );

    const draft =
      drafts[key];

    const monthlyPrice =
      parseMoney(
        draft?.monthlyPrice ?? ""
      );

    const regularMonthlyPrice = draft?.regularMonthlyPrice?.trim()
      ? parseMoney(draft.regularMonthlyPrice) : null;

    // All public PizzaSystem offers are monthly, without setup charges.
    const setupPrice = 0;

    if (
      Number.isNaN(monthlyPrice) ||
      monthlyPrice < 0
    ) {
      setError(
        text(
          "Informe uma mensalidade válida.",
          "Enter a valid monthly price."
        )
      );
      return;
    }

    if (regularMonthlyPrice !== null && (!Number.isFinite(regularMonthlyPrice) || regularMonthlyPrice < 0)) {
      setError(text("Informe um preço original válido.", "Enter a valid regular price."));
      return;
    }

    try {
      setSavingKey(key);
      setError(null);
      setSuccess(null);

      const response = await secureFetch(
        `${API_URL}/api/admin/catalog/plans/${plan.id}/prices/${regionCode}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            monthlyPrice,
            regularMonthlyPrice,
            setupPrice,
            active:
              draft?.active ?? true,
          }),
        }
      );

      if (!response.ok) {
        let message =
          text(
            "Não foi possível salvar este preço.",
            "Could not save this price."
          );

        try {
          const data =
            await response.json();
          message =
            data.message ??
            data.error ??
            message;
        } catch {
          // Mantém mensagem padrão.
        }

        throw new Error(message);
      }

      setSuccess(
        text(
          "Preço regional salvo.",
          "Regional price saved."
        )
      );

      await load(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível salvar.",
              "Could not save."
            )
      );
    } finally {
      setSavingKey(null);
    }
  }

  async function saveMonthlyPlanPricing() {
    const siteMonthly = parseMoney(standaloneSiteMonthlyPrice);
    const bundleMonthly = parseMoney(bundleMonthlyPrice);
    if (!Number.isFinite(siteMonthly) || siteMonthly < 0 ||
        !Number.isFinite(bundleMonthly) || bundleMonthly < 0) {
      setError(text("Informe mensalidades válidas.", "Enter valid monthly prices."));
      return;
    }
    try {
      setSavingCustomSiteFee(true);
      setError(null);
      setSuccess(null);
      const response = await secureFetch(`${API_URL}/api/admin/commercial-settings`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          standaloneSiteMonthlyPriceUsd: siteMonthly,
          bundleMonthlyPriceUsd: bundleMonthly,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? text("Não foi possível salvar as mensalidades.", "Could not save monthly prices."));
      }
      const updated: CommercialSettings = await response.json();
      setStandaloneSiteMonthlyPrice(moneyInput(updated.standaloneSiteMonthlyPriceUsd ?? 0));
      setBundleMonthlyPrice(moneyInput(updated.bundleMonthlyPriceUsd ?? 0));
      setSuccess(text("Mensalidades atualizadas.", "Monthly plan prices updated."));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text("Erro ao salvar.", "Could not save."));
    } finally {
      setSavingCustomSiteFee(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2
          size={22}
          className="animate-spin text-violet-200/50"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-violet-200/35">
              <Globe2 size={13} />
              {text(
                "Venda internacional",
                "International sales"
              )}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {text(
                "Preços regionais",
                "Regional pricing"
              )}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/30">
              {text(
                "A Orbitta trabalha com preços regionais. Brasil usa BRL, Estados Unidos usa USD, Reino Unido usa GBP e Austrália usa AUD. O provedor de pagamento depende do mercado configurado.",
                "Orbitta uses regional pricing. Brazil uses BRL, the United States uses USD, the United Kingdom uses GBP and Australia uses AUD. The payment provider depends on the configured market."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void load(true)
            }
            disabled={refreshing}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            {text(
              "Atualizar",
              "Refresh"
            )}
          </button>
        </header>

        <section className="mt-6 rounded-[28px] border border-violet-300/[0.1] bg-[#08101d] p-6">
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-cyan-100/65">
            <CircleDollarSign size={17} />
            {text("Os três planos são mensais", "All three plans are monthly")}
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white/90">
            {text("Mensalidades independentes", "Independent monthly subscriptions")}
          </h2>
          <p className="mt-3 text-xs leading-6 text-white/40">
            {text("Defina os valores de Site e Site + PizzaSystem. A mensalidade individual do PizzaSystem é configurada por região mais abaixo. Nenhum plano tem taxa inicial ou cobrança única.",
              "Set Website and Website + PizzaSystem prices. PizzaSystem-only pricing is configured by region below. No plan charges a setup fee or one-time payment.")}
          </p>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <label className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <span className="block text-xs font-medium text-white/80">{text("Site — mensalidade (USD)", "Website — monthly (USD)")}</span>
              <input inputMode="decimal" value={standaloneSiteMonthlyPrice}
                onChange={(event) => setStandaloneSiteMonthlyPrice(event.target.value)}
                className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-white outline-none"/>
            </label>
            <label className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.025] p-5">
              <span className="block text-xs font-medium text-white/80">{text("Site + PizzaSystem — mensalidade (USD)", "Website + PizzaSystem — monthly (USD)")}</span>
              <input inputMode="decimal" value={bundleMonthlyPrice}
                onChange={(event) => setBundleMonthlyPrice(event.target.value)}
                className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-white outline-none"/>
            </label>
          </div>
          <button type="button" disabled={savingCustomSiteFee}
            onClick={() => void saveMonthlyPlanPricing()}
            className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-xs font-semibold text-[#07101c] disabled:opacity-50">
            {savingCustomSiteFee ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
            {text("Salvar mensalidades", "Save monthly prices")}
          </button>
        </section>

        <div className="mt-6 rounded-2xl border border-cyan-300/[0.08] bg-cyan-300/[0.025] px-5 py-4 text-xs leading-6 text-white/35">
          {text(
            "O site detecta o mercado automaticamente e permite troca manual entre Brasil, Estados Unidos, Reino Unido e Austrália. Cada região usa seu próprio preço e moeda cadastrados abaixo.",
            "The website detects the market automatically and allows manual switching between Brazil, the United States, the United Kingdom and Australia. Each region uses its own price and currency configured below."
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-5 py-4 text-xs text-red-100/70">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-5 py-4 text-xs text-emerald-100/70">
            <Check size={13} />
            {success}
          </div>
        )}

        <div className="mt-8 space-y-6">
          {plans.map(
            ({ product, plan }) => (
              <section
                key={plan.id}
                className="overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#08101d]"
              >
                <div className="flex flex-col gap-3 border-b border-white/[0.05] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-violet-200/35">
                      {product.name}
                    </div>

                    <h2 className="mt-1.5 text-lg font-medium text-white/80">
                      {plan.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-white/25">
                    <CircleDollarSign
                      size={13}
                    />
                    {text(
                      "1 plano · vários mercados",
                      "1 plan · multiple markets"
                    )}
                  </div>
                </div>

                <div className="divide-y divide-white/[0.045]">
                  {MARKETS.map(
                    (market) => {
                      const key =
                        draftKey(
                          plan.id,
                          market.code
                        );

                      const draft =
                        drafts[key] ?? {
                          monthlyPrice:
                            "",
                          regularMonthlyPrice: "99,90",
                          setupPrice:
                            "0",
                          active:
                            false,
                        };

                      const saving =
                        savingKey === key;

                      return (
                        <div
                          key={
                            market.code
                          }
                          className="grid gap-4 px-6 py-5 xl:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-white/70">
                                {locale.startsWith(
                                  "en"
                                )
                                  ? market.en
                                  : market.pt}
                              </span>

                              <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[9px] tracking-[0.08em] text-white/35">
                                {market.code}
                              </span>

                              <span className="rounded-full border border-violet-300/[0.08] bg-violet-300/[0.035] px-2.5 py-1 text-[9px] text-violet-100/50">
                                {
                                  market.gateway
                                }
                              </span>
                            </div>

                            <div className="mt-2 text-[10px] text-white/20">
                              {
                                market.currency
                              }
                            </div>
                          </div>

                          <label>
                            <span className="text-[9px] uppercase tracking-[0.13em] text-white/20">
                              {text(
                                "Mensalidade",
                                "Monthly"
                              )}
                            </span>

                            <input
                              inputMode="decimal"
                              value={
                                draft.monthlyPrice
                              }
                              onChange={(
                                event
                              ) =>
                                updateDraft(
                                  plan.id,
                                  market.code,
                                  {
                                    monthlyPrice:
                                      event.target
                                        .value,
                                  }
                                )
                              }
                              placeholder="0,00"
                              className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none focus:border-violet-300/25"
                            />
                          </label>

                          <label>
                            <span className="text-[9px] uppercase tracking-[0.13em] text-white/20">
                              {text("Preço riscado (opcional)", "Regular price (optional)")}
                            </span>
                            <input
                              inputMode="decimal"
                              value={draft.regularMonthlyPrice}
                              onChange={(event) => updateDraft(plan.id, market.code, {
                                regularMonthlyPrice: event.target.value,
                              })}
                              placeholder="99,90"
                              className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none"
                            />
                          </label>
                          <label className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4">
                            <input
                              type="checkbox"
                              checked={
                                draft.active
                              }
                              onChange={(
                                event
                              ) =>
                                updateDraft(
                                  plan.id,
                                  market.code,
                                  {
                                    active:
                                      event.target
                                        .checked,
                                  }
                                )
                              }
                              className="h-4 w-4 accent-violet-300"
                            />

                            <span className="text-xs text-white/45">
                              {text(
                                "Disponível",
                                "Available"
                              )}
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              void savePrice(
                                plan,
                                market.code
                              )
                            }
                            disabled={
                              saving ||
                              !draft.monthlyPrice
                            }
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {saving ? (
                              <Loader2
                                size={13}
                                className="animate-spin"
                              />
                            ) : (
                              <Save
                                size={13}
                              />
                            )}

                            {text(
                              "Salvar",
                              "Save"
                            )}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            )
          )}
        </div>

        {plans.length === 0 && (
          <div className="mt-8 rounded-[28px] border border-dashed border-white/[0.08] px-6 py-16 text-center text-sm text-white/25">
            {text(
              "Crie um produto e um plano antes de cadastrar preços regionais.",
              "Create a product and plan before adding regional prices."
            )}
          </div>
        )}
      </div>
    </div>
  );
}
