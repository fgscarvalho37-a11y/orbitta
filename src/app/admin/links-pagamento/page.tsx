"use client";

import {
  Check,
  CircleDollarSign,
  Copy,
  Link2,
  Loader2,
  Power,
  RefreshCw,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { secureFetch } from "@/lib/secureFetch";
import { useLanguage } from "@/i18n/LanguageProvider";

const API_URL =
  "/backend";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
};

type CatalogPlan = {
  id: number;
  name: string;
  slug: string;
  monthlyPrice: number;
  setupPrice: number;
  currency: string;
  active: boolean;
};

type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  plans: CatalogPlan[];
};

type OfferType =
  | "PIZZASYSTEM"
  | "SITE_ONLY"
  | "SITE_PLUS_PIZZASYSTEM";

type CustomOffer = {
  id: number;
  token: string;
  offerType: OfferType;
  userId: number;
  clientName: string;
  clientEmail: string;
  planId: number | null;
  title: string;
  description: string | null;
  monthlyPrice: number;
  setupPrice: number;
  totalInitialPrice: number;
  currency: string;
  oneTimeOnly: boolean;
  active: boolean;
  expired: boolean;
  expiresAt: string | null;
  checkoutId: number | null;
  createdAt: string;
};

type CommercialSettings = {
  customSiteIntegrationFeeUsd: number;
};

function parseMoney(
  value: string
) {
  const normalized =
    value
      .trim()
      .replace(
        /\s/g,
        ""
      )
      .replace(
        ",",
        "."
      );

  if (!normalized) {
    return 0;
  }

  const parsed =
    Number(
      normalized
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : NaN;
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
        style:
          "currency",
        currency,
      }
    ).format(
      value
    );
  } catch {
    return `${currency} ${value.toFixed(
      2
    )}`;
  }
}

function typeLabel(
  type: OfferType,
  english: boolean
) {
  if (
    type ===
    "SITE_ONLY"
  ) {
    return english
      ? "Standalone website"
      : "Site avulso";
  }

  if (
    type ===
    "SITE_PLUS_PIZZASYSTEM"
  ) {
    return english
      ? "Website + PizzaSystem"
      : "Site + PizzaSystem";
  }

  return "PizzaSystem";
}

export default function CustomPaymentLinksPage() {
  const {
    locale,
    text,
  } =
    useLanguage();

  const [
    clients,
    setClients,
  ] =
    useState<Client[]>(
      []
    );

  const [
    products,
    setProducts,
  ] =
    useState<CatalogProduct[]>(
      []
    );

  const [
    offers,
    setOffers,
  ] =
    useState<CustomOffer[]>(
      []
    );

  const [
    clientId,
    setClientId,
  ] =
    useState("");

  const [
    offerType,
    setOfferType,
  ] =
    useState<OfferType>(
      "PIZZASYSTEM"
    );

  const [
    planId,
    setPlanId,
  ] =
    useState("");

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    currency,
    setCurrency,
  ] =
    useState(
      "USD"
    );

  const [
    monthlyPrice,
    setMonthlyPrice,
  ] =
    useState("");

  const [
    setupPrice,
    setSetupPrice,
  ] =
    useState("");

  const [
    validDays,
    setValidDays,
  ] =
    useState(
      "7"
    );

  const [
    integrationFee,
    setIntegrationFee,
  ] =
    useState(
      200
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  const [
    togglingId,
    setTogglingId,
  ] =
    useState<
      number | null
    >(
      null
    );

  const [
    copiedToken,
    setCopiedToken,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    lastCreated,
    setLastCreated,
  ] =
    useState<CustomOffer | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const pizzaPlans =
    useMemo(
      () =>
        products
          .filter(
            (
              product
            ) =>
              product.slug ===
              "pizzasystem"
          )
          .flatMap(
            (
              product
            ) =>
              product.plans ??
              []
          )
          .filter(
            (
              plan
            ) =>
              plan.active
          ),
      [
        products,
      ]
    );

  const load =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );
          setError(
            ""
          );

          const [
            clientsResponse,
            productsResponse,
            offersResponse,
            settingsResponse,
          ] =
            await Promise.all([
              secureFetch(
                `${API_URL}/api/admin/clients`,
                {
                  credentials:
                    "include",
                  cache:
                    "no-store",
                }
              ),
              secureFetch(
                `${API_URL}/api/admin/catalog/products`,
                {
                  credentials:
                    "include",
                  cache:
                    "no-store",
                }
              ),
              secureFetch(
                `${API_URL}/api/admin/custom-offers`,
                {
                  credentials:
                    "include",
                  cache:
                    "no-store",
                }
              ),
              secureFetch(
                `${API_URL}/api/admin/commercial-settings`,
                {
                  credentials:
                    "include",
                  cache:
                    "no-store",
                }
              ),
            ]);

          if (
            clientsResponse.status ===
              401 ||
            clientsResponse.status ===
              403
          ) {
            window.location.href =
              "/login?returnUrl=%2Fadmin%2Flinks-pagamento";
            return;
          }

          if (
            !clientsResponse.ok ||
            !productsResponse.ok ||
            !offersResponse.ok
          ) {
            throw new Error(
              text(
                "Não foi possível carregar os links personalizados.",
                "Could not load custom payment links."
              )
            );
          }

          const clientData:
            Client[] =
            await clientsResponse.json();

          const productData:
            CatalogProduct[] =
            await productsResponse.json();

          const offerData:
            CustomOffer[] =
            await offersResponse.json();

          setClients(
            clientData
          );
          setProducts(
            productData
          );
          setOffers(
            offerData
          );

          if (
            settingsResponse.ok
          ) {
            const settings:
              CommercialSettings =
              await settingsResponse.json();

            setIntegrationFee(
              Number(
                settings.customSiteIntegrationFeeUsd ??
                  200
              )
            );
          }

          setClientId(
            (
              current
            ) =>
              current ||
              (
                clientData.find(
                  (
                    client
                  ) =>
                    client.active
                )?.id != null
                  ? String(
                      clientData.find(
                        (
                          client
                        ) =>
                          client.active
                      )!.id
                    )
                  : ""
              )
          );
        } catch (
          caught
        ) {
          setError(
            caught instanceof Error
              ? caught.message
              : text(
                  "Não foi possível carregar.",
                  "Could not load."
                )
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        text,
      ]
    );

  useEffect(() => {
    void load();
  }, [
    load,
  ]);

  useEffect(() => {
    if (
      planId ||
      pizzaPlans.length ===
        0
    ) {
      return;
    }

    setPlanId(
      String(
        pizzaPlans[0].id
      )
    );
  }, [
    pizzaPlans,
    planId,
  ]);

  function handleTypeChange(
    next:
      OfferType
  ) {
    setOfferType(
      next
    );
    setSuccess(
      ""
    );
    setError(
      ""
    );

    if (
      next ===
      "SITE_ONLY"
    ) {
      setMonthlyPrice(
        ""
      );
      setSetupPrice(
        ""
      );
      setTitle(
        text(
          "Site personalizado",
          "Custom website"
        )
      );
      return;
    }

    if (
      next ===
      "SITE_PLUS_PIZZASYSTEM"
    ) {
      setSetupPrice(
        String(
          integrationFee
        )
      );
      setTitle(
        text(
          "Site personalizado + PizzaSystem",
          "Custom website + PizzaSystem"
        )
      );
      return;
    }

    setSetupPrice(
      "0"
    );
    setTitle(
      "PizzaSystem"
    );
  }

  async function createOffer() {
    const parsedMonthly =
      offerType ===
      "SITE_ONLY"
        ? 0
        : parseMoney(
            monthlyPrice
          );

    const parsedSetup =
      parseMoney(
        setupPrice
      );

    const parsedValidDays =
      Number(
        validDays
      );

    if (!clientId) {
      setError(
        text(
          "Selecione um cliente.",
          "Select a client."
        )
      );
      return;
    }

    if (
      offerType !==
        "SITE_ONLY" &&
      !planId
    ) {
      setError(
        text(
          "Selecione o plano do PizzaSystem.",
          "Select a PizzaSystem plan."
        )
      );
      return;
    }

    if (
      Number.isNaN(
        parsedMonthly
      ) ||
      parsedMonthly <
        0 ||
      (
        offerType !==
          "SITE_ONLY" &&
        parsedMonthly <=
          0
      )
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
      Number.isNaN(
        parsedSetup
      ) ||
      parsedSetup <
        0 ||
      (
        offerType ===
          "SITE_ONLY" &&
        parsedSetup <=
          0
      )
    ) {
      setError(
        offerType ===
          "SITE_ONLY"
          ? text(
              "Informe o valor único do site.",
              "Enter the one-time website price."
            )
          : text(
              "Informe uma taxa inicial válida.",
              "Enter a valid setup fee."
            )
      );
      return;
    }

    if (
      !Number.isInteger(
        parsedValidDays
      ) ||
      parsedValidDays <
        1 ||
      parsedValidDays >
        90
    ) {
      setError(
        text(
          "A validade deve ficar entre 1 e 90 dias.",
          "Validity must be between 1 and 90 days."
        )
      );
      return;
    }

    try {
      setSaving(
        true
      );
      setError(
        ""
      );
      setSuccess(
        ""
      );

      const response =
        await secureFetch(
          `${API_URL}/api/admin/custom-offers`,
          {
            method:
              "POST",
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
                userId:
                  Number(
                    clientId
                  ),
                offerType,
                planId:
                  offerType ===
                  "SITE_ONLY"
                    ? null
                    : Number(
                        planId
                      ),
                title:
                  title.trim() ||
                  null,
                description:
                  description.trim() ||
                  null,
                monthlyPrice:
                  parsedMonthly,
                setupPrice:
                  parsedSetup,
                currency,
                validDays:
                  parsedValidDays,
              }),
          }
        );

      const body =
        await response
          .json()
          .catch(
            () =>
              null
          );

      if (!response.ok) {
        throw new Error(
          body?.message ??
            text(
              "Não foi possível gerar o link.",
              "Could not generate the link."
            )
        );
      }

      const created:
        CustomOffer =
        body;

      setOffers(
        (
          current
        ) => [
          created,
          ...current,
        ]
      );
      setLastCreated(
        created
      );
      setSuccess(
        text(
          "Link personalizado criado.",
          "Custom payment link created."
        )
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível gerar o link.",
              "Could not generate the link."
            )
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  function offerUrl(
    token: string
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      return `/oferta/${token}`;
    }

    return `${window.location.origin}/oferta/${token}`;
  }

  async function copyLink(
    token: string
  ) {
    try {
      await navigator.clipboard.writeText(
        offerUrl(
          token
        )
      );
      setCopiedToken(
        token
      );

      window.setTimeout(
        () => {
          setCopiedToken(
            (
              current
            ) =>
              current ===
              token
                ? null
                : current
          );
        },
        1800
      );
    } catch {
      setError(
        text(
          "Não foi possível copiar o link.",
          "Could not copy the link."
        )
      );
    }
  }

  async function toggleOffer(
    offer:
      CustomOffer
  ) {
    try {
      setTogglingId(
        offer.id
      );
      setError(
        ""
      );

      const response =
        await secureFetch(
          `${API_URL}/api/admin/custom-offers/${offer.id}/status`,
          {
            method:
              "PATCH",
            credentials:
              "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                active:
                  !offer.active,
              }),
          }
        );

      const body =
        await response
          .json()
          .catch(
            () =>
              null
          );

      if (!response.ok) {
        throw new Error(
          body?.message ??
            text(
              "Não foi possível alterar o link.",
              "Could not update the link."
            )
        );
      }

      setOffers(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              offer.id
                ? body
                : item
          )
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível alterar o link.",
              "Could not update the link."
            )
      );
    } finally {
      setTogglingId(
        null
      );
    }
  }

  const isEnglish =
    locale.startsWith(
      "en"
    );

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
              <Link2
                size={13}
              />
              {text(
                "Venda personalizada",
                "Custom sales"
              )}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {text(
                "Links personalizados",
                "Custom payment links"
              )}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/30">
              {text(
                "Crie uma oferta exclusiva para cada cliente sem alterar os preços públicos. Você pode cobrar um site avulso, uma mensalidade personalizada do PizzaSystem ou uma taxa inicial + mensalidade.",
                "Create an exclusive offer for each client without changing public prices. Charge for a standalone website, a custom PizzaSystem monthly fee, or a setup fee plus subscription."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/70"
          >
            <RefreshCw
              size={14}
            />
            {text(
              "Atualizar",
              "Refresh"
            )}
          </button>
        </header>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-5 py-4 text-xs text-red-100/70">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-5 py-4 text-xs text-emerald-100/70">
            <Check
              size={13}
            />
            {success}
          </div>
        )}

        <section className="mt-7 rounded-[28px] border border-white/[0.06] bg-[#08101d] p-6 sm:p-7">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-200/45">
            <CircleDollarSign
              size={13}
            />
            {text(
              "Nova oferta",
              "New offer"
            )}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <label>
              <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                {text(
                  "Cliente",
                  "Client"
                )}
              </span>

              <select
                value={
                  clientId
                }
                onChange={(
                  event
                ) =>
                  setClientId(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-sm text-white/70 outline-none"
              >
                <option value="">
                  {text(
                    "Selecione",
                    "Select"
                  )}
                </option>

                {clients
                  .filter(
                    (
                      client
                    ) =>
                      client.active
                  )
                  .map(
                    (
                      client
                    ) => (
                      <option
                        key={
                          client.id
                        }
                        value={
                          client.id
                        }
                      >
                        {client.firstName}{" "}
                        {client.lastName} —{" "}
                        {client.email}
                      </option>
                    )
                  )}
              </select>
            </label>

            <label>
              <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                {text(
                  "Tipo",
                  "Type"
                )}
              </span>

              <select
                value={
                  offerType
                }
                onChange={(
                  event
                ) =>
                  handleTypeChange(
                    event.target
                      .value as
                      OfferType
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-sm text-white/70 outline-none"
              >
                <option value="PIZZASYSTEM">
                  PizzaSystem
                </option>
                <option value="SITE_ONLY">
                  {text(
                    "Site avulso",
                    "Standalone website"
                  )}
                </option>
                <option value="SITE_PLUS_PIZZASYSTEM">
                  {text(
                    "Site + PizzaSystem",
                    "Website + PizzaSystem"
                  )}
                </option>
              </select>
            </label>

            {offerType !==
              "SITE_ONLY" && (
              <label>
                <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                  {text(
                    "Plano base",
                    "Base plan"
                  )}
                </span>

                <select
                  value={
                    planId
                  }
                  onChange={(
                    event
                  ) =>
                    setPlanId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-sm text-white/70 outline-none"
                >
                  {pizzaPlans.map(
                    (
                      plan
                    ) => (
                      <option
                        key={
                          plan.id
                        }
                        value={
                          plan.id
                        }
                      >
                        {plan.name}
                      </option>
                    )
                  )}
                </select>
              </label>
            )}

            <label>
              <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                {text(
                  "Título da oferta",
                  "Offer title"
                )}
              </span>

              <input
                value={
                  title
                }
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder={text(
                  "Ex: PizzaSystem Premium - João",
                  "Example: PizzaSystem Premium - John"
                )}
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-sm text-white/70 outline-none"
              />
            </label>

            <label>
              <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                {text(
                  "Moeda",
                  "Currency"
                )}
              </span>

              <select
                value={
                  currency
                }
                onChange={(
                  event
                ) =>
                  setCurrency(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-sm text-white/70 outline-none"
              >
                <option value="BRL">
                  BRL
                </option>
                <option value="USD">
                  USD
                </option>
                <option value="GBP">
                  GBP
                </option>
                <option value="AUD">
                  AUD
                </option>
                <option value="EUR">
                  EUR
                </option>
              </select>
            </label>

            <label>
              <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                {text(
                  "Validade do link",
                  "Link validity"
                )}
              </span>

              <div className="mt-2 flex h-11 items-center rounded-xl border border-white/[0.07] bg-[#07101c] px-3">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={
                    validDays
                  }
                  onChange={(
                    event
                  ) =>
                    setValidDays(
                      event.target.value
                    )
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm text-white/70 outline-none"
                />
                <span className="text-xs text-white/25">
                  {text(
                    "dias",
                    "days"
                  )}
                </span>
              </div>
            </label>

            {offerType ===
              "SITE_ONLY" ? (
              <label>
                <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                  {text(
                    "Valor único do site",
                    "One-time website price"
                  )}
                </span>

                <input
                  inputMode="decimal"
                  value={
                    setupPrice
                  }
                  onChange={(
                    event
                  ) =>
                    setSetupPrice(
                      event.target.value
                    )
                  }
                  placeholder="1200"
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-sm text-white/70 outline-none"
                />
              </label>
            ) : (
              <>
                <label>
                  <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                    {text(
                      "Mensalidade personalizada",
                      "Custom monthly price"
                    )}
                  </span>

                  <input
                    inputMode="decimal"
                    value={
                      monthlyPrice
                    }
                    onChange={(
                      event
                    ) =>
                      setMonthlyPrice(
                        event.target.value
                      )
                    }
                    placeholder="99.90"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-sm text-white/70 outline-none"
                  />
                </label>

                <label>
                  <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
                    {offerType ===
                    "SITE_PLUS_PIZZASYSTEM"
                      ? text(
                          "Taxa inicial / integração",
                          "Setup / integration fee"
                        )
                      : text(
                          "Taxa inicial",
                          "Setup fee"
                        )}
                  </span>

                  <input
                    inputMode="decimal"
                    value={
                      setupPrice
                    }
                    onChange={(
                      event
                    ) =>
                      setSetupPrice(
                        event.target.value
                      )
                    }
                    placeholder="0"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-sm text-white/70 outline-none"
                  />
                </label>
              </>
            )}
          </div>

          <label className="mt-4 block">
            <span className="text-[9px] uppercase tracking-[0.13em] text-white/25">
              {text(
                "Descrição / condições",
                "Description / terms"
              )}
            </span>

            <textarea
              value={
                description
              }
              onChange={(
                event
              ) =>
                setDescription(
                  event.target.value
                )
              }
              maxLength={500}
              rows={3}
              placeholder={text(
                "Ex: valor negociado durante a reunião, implantação inclusa...",
                "Example: negotiated during the meeting, setup included..."
              )}
              className="mt-2 w-full rounded-xl border border-white/[0.07] bg-[#07101c] px-3 py-3 text-sm leading-6 text-white/70 outline-none"
            />
          </label>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                void createOffer()
              }
              disabled={
                saving
              }
              className="flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50 disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={13}
                  className="animate-spin"
                />
              ) : (
                <Link2
                  size={13}
                />
              )}

              {text(
                "Gerar link personalizado",
                "Generate custom link"
              )}
            </button>

            <p className="text-xs leading-5 text-white/25">
              {text(
                "O preço fica salvo somente nesta oferta e neste cliente.",
                "The price is saved only for this offer and this client."
              )}
            </p>
          </div>

          {lastCreated && (
            <div className="mt-6 rounded-2xl border border-emerald-300/[0.1] bg-emerald-300/[0.035] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/50">
                {text(
                  "Link pronto",
                  "Link ready"
                )}
              </p>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  readOnly
                  value={
                    offerUrl(
                      lastCreated.token
                    )
                  }
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-[#07101c] px-3 text-xs text-white/55 outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    void copyLink(
                      lastCreated.token
                    )
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300/[0.12] px-4 text-xs font-semibold text-emerald-100/70"
                >
                  {copiedToken ===
                  lastCreated.token ? (
                    <Check
                      size={13}
                    />
                  ) : (
                    <Copy
                      size={13}
                    />
                  )}
                  {copiedToken ===
                  lastCreated.token
                    ? text(
                        "Copiado",
                        "Copied"
                      )
                    : text(
                        "Copiar",
                        "Copy"
                      )}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-7 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#08101d]">
          <div className="border-b border-white/[0.05] px-6 py-5">
            <h2 className="text-lg font-semibold text-white/80">
              {text(
                "Links gerados",
                "Generated links"
              )}
            </h2>
          </div>

          {offers.length ===
          0 ? (
            <div className="px-6 py-14 text-center text-sm text-white/25">
              {text(
                "Nenhuma oferta personalizada criada ainda.",
                "No custom offers have been created yet."
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.045]">
              {offers.map(
                (
                  offer
                ) => (
                  <article
                    key={
                      offer.id
                    }
                    className="grid gap-5 px-6 py-5 xl:grid-cols-[1.2fr_0.85fr_0.9fr_auto] xl:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white/75">
                          {
                            offer.title
                          }
                        </span>

                        <span className="rounded-full border border-violet-300/[0.08] bg-violet-300/[0.035] px-2.5 py-1 text-[9px] text-violet-100/55">
                          {typeLabel(
                            offer.offerType,
                            isEnglish
                          )}
                        </span>

                        <span
                          className={
                            offer.active &&
                            !offer.expired
                              ? "rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-2.5 py-1 text-[9px] text-emerald-100/60"
                              : "rounded-full border border-red-300/[0.08] bg-red-300/[0.035] px-2.5 py-1 text-[9px] text-red-100/60"
                          }
                        >
                          {offer.expired
                            ? text(
                                "Expirado",
                                "Expired"
                              )
                            : offer.active
                              ? text(
                                  "Ativo",
                                  "Active"
                                )
                              : text(
                                  "Desativado",
                                  "Disabled"
                                )}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-white/28">
                        <UserRound
                          size={12}
                        />
                        {
                          offer.clientName
                        }{" "}
                        ·{" "}
                        {
                          offer.clientEmail
                        }
                      </div>
                    </div>

                    <div>
                      {offer.oneTimeOnly ? (
                        <>
                          <div className="text-[9px] uppercase tracking-[0.14em] text-white/22">
                            {text(
                              "Pagamento único",
                              "One-time payment"
                            )}
                          </div>

                          <div className="mt-1 text-lg font-semibold text-white/78">
                            {formatMoney(
                              offer.setupPrice,
                              offer.currency,
                              locale
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-[9px] uppercase tracking-[0.14em] text-white/22">
                            {text(
                              "Mensalidade",
                              "Monthly"
                            )}
                          </div>

                          <div className="mt-1 text-lg font-semibold text-white/78">
                            {formatMoney(
                              offer.monthlyPrice,
                              offer.currency,
                              locale
                            )}
                          </div>

                          {offer.setupPrice >
                            0 && (
                            <div className="mt-1 text-[10px] text-white/28">
                              +{" "}
                              {formatMoney(
                                offer.setupPrice,
                                offer.currency,
                                locale
                              )}{" "}
                              {text(
                                "inicial",
                                "setup"
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-[10px] text-white/25">
                        {offerUrl(
                          offer.token
                        )}
                      </div>

                      {offer.checkoutId && (
                        <div className="mt-1 text-[9px] text-cyan-200/40">
                          Checkout #
                          {
                            offer.checkoutId
                          }
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          void copyLink(
                            offer.token
                          )
                        }
                        className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.07] px-3 text-[10px] text-white/45 transition hover:text-white/70"
                      >
                        {copiedToken ===
                        offer.token ? (
                          <Check
                            size={12}
                          />
                        ) : (
                          <Copy
                            size={12}
                          />
                        )}
                        {text(
                          "Copiar",
                          "Copy"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void toggleOffer(
                            offer
                          )
                        }
                        disabled={
                          togglingId ===
                          offer.id
                        }
                        className={
                          offer.active
                            ? "flex h-9 items-center gap-2 rounded-xl border border-red-300/[0.08] bg-red-300/[0.025] px-3 text-[10px] text-red-100/55 disabled:opacity-50"
                            : "flex h-9 items-center gap-2 rounded-xl border border-emerald-300/[0.08] bg-emerald-300/[0.025] px-3 text-[10px] text-emerald-100/55 disabled:opacity-50"
                        }
                      >
                        {togglingId ===
                        offer.id ? (
                          <Loader2
                            size={12}
                            className="animate-spin"
                          />
                        ) : (
                          <Power
                            size={12}
                          />
                        )}

                        {offer.active
                          ? text(
                              "Desativar",
                              "Disable"
                            )
                          : text(
                              "Ativar",
                              "Enable"
                            )}
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
