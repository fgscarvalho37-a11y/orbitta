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
  active: boolean;
  plans: CatalogPlan[];
};

type PriceDraft = {
  monthlyPrice: string;
  setupPrice: string;
  active: boolean;
};

type CommercialSettings = {
  customSiteIntegrationFeeUsd: number;
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

  const [
    customSiteIntegrationFee,
    setCustomSiteIntegrationFee,
  ] =
    useState("200");

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

          setCustomSiteIntegrationFee(
            moneyInput(
              commercialSettings.customSiteIntegrationFeeUsd
            )
          );
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
                  moneyInput(
                    price?.monthlyPrice
                  ),
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

    const setupPrice =
      parseMoney(
        draft?.setupPrice || "0"
      );

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

    if (
      Number.isNaN(setupPrice) ||
      setupPrice < 0
    ) {
      setError(
        text(
          "Informe uma taxa inicial válida.",
          "Enter a valid setup fee."
        )
      );
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

  async function saveCustomSiteIntegrationFee() {
    const value =
      parseMoney(
        customSiteIntegrationFee
      );

    if (
      Number.isNaN(
        value
      ) ||
      value < 0
    ) {
      setError(
        text(
          "Informe uma taxa de integração válida.",
          "Enter a valid integration fee."
        )
      );
      return;
    }

    try {
      setSavingCustomSiteFee(
        true
      );
      setError(null);
      setSuccess(null);

      const response =
        await secureFetch(
          `${API_URL}/api/admin/commercial-settings`,
          {
            method: "PUT",
            credentials:
              "include",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body:
              JSON.stringify({
                customSiteIntegrationFeeUsd:
                  value,
              }),
          }
        );

      if (!response.ok) {
        let message =
          text(
            "Não foi possível salvar a taxa de integração.",
            "Could not save the integration fee."
          );

        try {
          const data =
            await response.json();

          message =
            data.message ??
            data.error ??
            message;
        } catch {
        }

        throw new Error(
          message
        );
      }

      const updated:
        CommercialSettings =
        await response.json();

      setCustomSiteIntegrationFee(
        moneyInput(
          updated.customSiteIntegrationFeeUsd
        )
      );

      setSuccess(
        text(
          "Taxa de integração do site atualizada.",
          "Custom site integration fee updated."
        )
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível salvar.",
              "Could not save."
            )
      );
    } finally {
      setSavingCustomSiteFee(
        false
      );
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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-200/45">
                <CircleDollarSign
                  size={13}
                />
                {text(
                  "Sites personalizados",
                  "Custom websites"
                )}
              </div>

              <h2 className="mt-2 text-xl font-semibold text-white/85">
                {text(
                  "Taxa de integração com PizzaSystem",
                  "PizzaSystem integration fee"
                )}
              </h2>

              <p className="mt-2 max-w-2xl text-xs leading-6 text-white/30">
                {text(
                  "Cobrada uma única vez somente quando um site personalizado é integrado ao PizzaSystem. O site padrão do PizzaSystem continua sem essa taxa.",
                  "Charged once only when a custom website is integrated with PizzaSystem. The standard PizzaSystem website keeps no such fee."
                )}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[170px_auto]">
              <label>
                <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                  {text(
                    "Taxa em USD",
                    "Fee in USD"
                  )}
                </span>

                <div className="mt-2 flex h-11 items-center rounded-xl border border-white/[0.07] bg-white/[0.025] px-3">
                  <span className="mr-2 text-xs font-semibold text-white/30">
                    US$
                  </span>

                  <input
                    inputMode="decimal"
                    value={
                      customSiteIntegrationFee
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomSiteIntegrationFee(
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={() =>
                  void saveCustomSiteIntegrationFee()
                }
                disabled={
                  savingCustomSiteFee
                }
                className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50 disabled:opacity-50"
              >
                {savingCustomSiteFee ? (
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
                  "Salvar taxa",
                  "Save fee"
                )}
              </button>
            </div>
          </div>
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
                          className="grid gap-4 px-6 py-5 xl:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end"
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
                              {text(
                                "Taxa inicial",
                                "Setup fee"
                              )}
                            </span>

                            <input
                              inputMode="decimal"
                              value={
                                draft.setupPrice
                              }
                              onChange={(
                                event
                              ) =>
                                updateDraft(
                                  plan.id,
                                  market.code,
                                  {
                                    setupPrice:
                                      event.target
                                        .value,
                                  }
                                )
                              }
                              placeholder="0,00"
                              className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none focus:border-violet-300/25"
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
