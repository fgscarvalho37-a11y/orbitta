"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/i18n/LanguageProvider";
import { secureFetch } from "@/lib/secureFetch";
import {
  formatUsd,
  useCommercialSettings,
} from "@/hooks/useCommercialSettings";

const API_URL =
  "/backend";

type BillingCycle =
  | "MONTHLY"
  | "ANNUAL";

type RegionalPrice = {
  id: number;
  regionCode: string;
  currency: string;
  monthlyPrice: number;
  setupPrice: number;
  active: boolean;
};

type CatalogPlan = {
  id: number;
  name: string;
  monthlyPrice: number;
  setupPrice: number;
  currency: string;
  regionalPrices: RegionalPrice[];
};

type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  plans: CatalogPlan[];
};

type CheckoutResponse = {
  id: number;
};

type PurchaseParams = {
  planId: number;
  priceId: number | null;
  billingCycle: BillingCycle;
  productSlug: string;
  displayCurrency: string | null;
};

async function readMessage(
  response: Response,
  fallback: string
) {
  const responseText =
    await response.text();

  if (!responseText) {
    return fallback;
  }

  try {
    const data =
      JSON.parse(
        responseText
      );

    return (
      data?.message ??
      data?.error ??
      responseText
    );
  } catch {
    return responseText;
  }
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

export default function CheckoutStartPage() {
  const router =
    useRouter();

  const {
    locale,
    text,
  } =
    useLanguage();

  const {
    customSiteIntegrationFeeUsd,
  } =
    useCommercialSettings();

  const [
    purchase,
    setPurchase,
  ] =
    useState<PurchaseParams | null>(
      null
    );

  const [
    product,
    setProduct,
  ] =
    useState<CatalogProduct | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false
    );

  const [
    customSiteIntegration,
    setCustomSiteIntegration,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    let active =
      true;

    async function prepare() {
      try {
        setLoading(
          true
        );
        setError(
          null
        );

        const params =
          new URLSearchParams(
            window.location.search
          );

        const planId =
          Number(
            params.get(
              "planId"
            )
          );

        const priceIdValue =
          Number(
            params.get(
              "priceId"
            )
          );

        const priceId =
          Number.isInteger(
            priceIdValue
          ) &&
          priceIdValue >
            0
            ? priceIdValue
            : null;

        const billingCycle:
          BillingCycle =
          params.get(
            "billingCycle"
          ) ===
          "ANNUAL"
            ? "ANNUAL"
            : "MONTHLY";

        const productSlug =
          (
            params.get(
              "productSlug"
            ) ??
            ""
          )
            .trim()
            .toLowerCase();

        const displayCurrency =
          params.get(
            "displayCurrency"
          );

        // A bundled offer arrives with the website integration selected.
        setCustomSiteIntegration(params.get("customSiteIntegration") === "1");

        if (
          !Number.isInteger(
            planId
          ) ||
          planId <=
            0 ||
          !productSlug
        ) {
          throw new Error(
            text(
              "Plano inválido.",
              "Invalid plan."
            )
          );
        }

        const currentPath =
          `/checkout/start?${params.toString()}`;

        const meResponse =
          await fetch(
            `${API_URL}/api/auth/me`,
            {
              method:
                "GET",
              credentials:
                "include",
              cache:
                "no-store",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (
          meResponse.status ===
            401 ||
          meResponse.status ===
            403
        ) {
          window.location.replace(
            `/login?returnUrl=${encodeURIComponent(
              currentPath
            )}`
          );
          return;
        }

        if (!meResponse.ok) {
          throw new Error(
            text(
              "Não foi possível validar sua sessão.",
              "We could not validate your session."
            )
          );
        }

        const productResponse =
          await fetch(
            `${API_URL}/api/catalog/products/${encodeURIComponent(
              productSlug
            )}`,
            {
              method:
                "GET",
              cache:
                "no-store",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!productResponse.ok) {
          throw new Error(
            text(
              "Não foi possível carregar o plano selecionado.",
              "We could not load the selected plan."
            )
          );
        }

        const productData:
          CatalogProduct =
          await productResponse.json();

        const selectedPlan =
          productData.plans.find(
            (
              plan
            ) =>
              plan.id ===
              planId
          );

        if (!selectedPlan) {
          throw new Error(
            text(
              "O plano selecionado não está disponível.",
              "The selected plan is not available."
            )
          );
        }

        if (!active) {
          return;
        }

        setPurchase({
          planId,
          priceId,
          billingCycle,
          productSlug,
          displayCurrency,
        });

        setProduct(
          productData
        );
      } catch (
        caught
      ) {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : text(
                  "Não foi possível preparar a contratação.",
                  "We could not prepare your subscription."
                )
          );
        }
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }

    void prepare();

    return () => {
      active =
        false;
    };
  }, [
    text,
  ]);

  const selectedPlan =
    useMemo(
      () =>
        product &&
        purchase
          ? product.plans.find(
              (
                plan
              ) =>
                plan.id ===
                purchase.planId
            ) ??
            null
          : null,
      [
        product,
        purchase,
      ]
    );

  const selectedPrice =
    useMemo(
      () => {
        if (
          !selectedPlan ||
          !purchase
        ) {
          return null;
        }

        if (
          purchase.priceId
        ) {
          const regional =
            selectedPlan.regionalPrices
              ?.find(
                (
                  price
                ) =>
                  price.id ===
                  purchase.priceId
              );

          if (regional) {
            return {
              ...regional,
              currency:
                purchase.displayCurrency ??
                regional.currency,
            };
          }
        }

        return {
          id:
            0,
          regionCode:
            "",
          currency:
            purchase.displayCurrency ??
            selectedPlan.currency,
          monthlyPrice:
            selectedPlan.monthlyPrice,
          setupPrice:
            selectedPlan.setupPrice,
          active:
            true,
        } satisfies RegionalPrice;
      },
      [
        selectedPlan,
        purchase,
      ]
    );

  const isPizzaSystem =
    purchase?.productSlug ===
    "pizzasystem";

  const displayedPlanPrice =
    selectedPrice
      ? purchase?.billingCycle ===
        "ANNUAL"
        ? Number(
            selectedPrice.monthlyPrice
          ) *
          10
        : Number(
            selectedPrice.monthlyPrice
          )
      : 0;

  const integrationFeeLabel =
    formatUsd(
      Number(
        customSiteIntegrationFeeUsd ??
          0
      ),
      locale
    );

  async function continueCheckout() {
    if (
      !purchase ||
      !selectedPlan ||
      submitting
    ) {
      return;
    }

    try {
      setSubmitting(
        true
      );
      setError(
        null
      );

      const response =
        await secureFetch(
          `${API_URL}/api/checkout/subscriptions`,
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
                planId:
                  purchase.planId,
                priceId:
                  purchase.priceId,
                billingCycle:
                  purchase.billingCycle,
                displayCurrency:
                  purchase.displayCurrency,
                customSiteIntegration:
                  isPizzaSystem &&
                  customSiteIntegration,
              }),
          }
        );

      if (
        response.status ===
          401 ||
        response.status ===
          403
      ) {
        window.location.replace(
          `/login?returnUrl=${encodeURIComponent(
            window.location.pathname +
            window.location.search
          )}`
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          await readMessage(
            response,
            text(
              "Não foi possível iniciar a contratação.",
              "We could not start your subscription."
            )
          )
        );
      }

      const checkout:
        CheckoutResponse =
        await response.json();

      router.push(
        `/checkout/${checkout.id}`
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível iniciar a contratação.",
              "We could not start your subscription."
            )
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050914] px-6 text-white">
        <div className="flex items-center gap-3 text-sm text-white/35">
          <LoaderCircle
            size={20}
            className="animate-spin text-cyan-300/70"
          />
          {text(
            "Preparando sua compra...",
            "Preparing your purchase..."
          )}
        </div>
      </main>
    );
  }

  if (
    error &&
    (
      !purchase ||
      !selectedPlan ||
      !selectedPrice
    )
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050914] px-6 text-white">
        <div className="w-full max-w-md rounded-[28px] border border-red-300/10 bg-[#08101d] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-300/10 bg-red-300/[0.04] text-red-200/70">
            <AlertCircle
              size={20}
            />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            {text(
              "Não foi possível continuar",
              "We could not continue"
            )}
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/40">
            {error}
          </p>

          <Link
            href="/produtos"
            className="mt-7 inline-flex items-center gap-2 text-sm text-cyan-200/70 hover:text-cyan-100"
          >
            <ArrowLeft
              size={15}
            />
            {text(
              "Voltar para produtos",
              "Back to products"
            )}
          </Link>
        </div>
      </main>
    );
  }

  if (
    !purchase ||
    !selectedPlan ||
    !selectedPrice
  ) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="orbitta-grid absolute inset-0 opacity-20" />
        <div className="absolute left-[-12%] top-[-20%] h-[600px] w-[600px] rounded-full bg-violet-500/[0.07] blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-400/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <Link
          href={`/produtos/${purchase.productSlug}#planos`}
          className="inline-flex items-center gap-2 text-sm text-white/35 transition hover:text-white/65"
        >
          <ArrowLeft
            size={15}
          />
          {text(
            "Voltar",
            "Back"
          )}
        </Link>

        <div className="mt-8 overflow-hidden rounded-[32px] border border-white/[0.07] bg-[#08101d]/95 shadow-[0_35px_110px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/[0.06] px-7 py-7 sm:px-9">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/45">
              {text(
                "Confirme sua compra",
                "Confirm your purchase"
              )}
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              {product?.name}
            </h1>

            <p className="mt-2 text-sm text-white/35">
              {selectedPlan.name} ·{" "}
              {purchase.billingCycle ===
              "ANNUAL"
                ? text(
                    "anual",
                    "annual"
                  )
                : text(
                    "mensal",
                    "monthly"
                  )}
            </p>
          </div>

          <div className="p-7 sm:p-9">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <div>
                <p className="text-xs text-white/55">
                  {text(
                    "Plano selecionado",
                    "Selected plan"
                  )}
                </p>

                <p className="mt-1 text-[10px] text-white/22">
                  {purchase.billingCycle ===
                  "ANNUAL"
                    ? text(
                        "12 meses pelo valor de 10 mensalidades",
                        "12 months for the price of 10 monthly payments"
                      )
                    : text(
                        "Cobrança mensal",
                        "Monthly billing"
                      )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold">
                  {formatMoney(
                    displayedPlanPrice,
                    selectedPrice.currency,
                    locale
                  )}
                </p>

                <p className="mt-1 text-[10px] text-white/25">
                  {purchase.billingCycle ===
                  "ANNUAL"
                    ? text(
                        "/ ano",
                        "/ year"
                      )
                    : text(
                        "/ mês",
                        "/ month"
                      )}
                </p>
              </div>
            </div>

            {isPizzaSystem && (
              <div className="mt-5">
                <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/28">
                  {text(
                    "Adicional opcional",
                    "Optional add-on"
                  )}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setCustomSiteIntegration(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  className={
                    customSiteIntegration
                      ? "w-full rounded-[24px] border border-cyan-300/20 bg-cyan-300/[0.055] p-5 text-left transition"
                      : "w-full rounded-[24px] border border-white/[0.07] bg-white/[0.018] p-5 text-left transition hover:border-white/[0.12]"
                  }
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={
                        customSiteIntegration
                          ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cyan-200 text-[#07101c]"
                          : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/[0.14]"
                      }
                    >
                      {customSiteIntegration && (
                        <Check
                          size={13}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles
                              size={14}
                              className="text-cyan-200/70"
                            />

                            <span className="text-sm font-semibold text-white/80">
                              {text(
                                "Site personalizado integrado",
                                "Integrated custom website"
                              )}
                            </span>
                          </div>

                          <p className="mt-2 max-w-xl text-xs leading-5 text-white/35">
                            {text(
                              "Troca o visual padrão por um projeto personalizado conectado ao mesmo cardápio, pedidos e pagamentos do PizzaSystem.",
                              "Replace the standard look with a custom website connected to the same PizzaSystem menu, orders and payments."
                            )}
                          </p>
                        </div>

                        <div className="shrink-0 sm:text-right">
                          <p className="text-lg font-semibold text-white/85">
                            {integrationFeeLabel}
                          </p>

                          <p className="mt-1 text-[10px] text-white/25">
                            {text(
                              "uma única vez",
                              "one time"
                            )}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-[10px] leading-4 text-white/22">
                        {selectedPrice.currency ===
                        "USD"
                          ? text(
                              "O site padrão continua incluído se você não selecionar este adicional.",
                              "The standard website remains included if you do not select this add-on."
                            )
                          : text(
                              "A taxa é definida em USD e será convertida para a moeda deste checkout. O site padrão continua incluído sem custo extra.",
                              "The fee is defined in USD and will be converted to this checkout currency. The standard website remains included at no extra cost."
                            )}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-5 py-4 text-xs leading-5 text-red-100/70">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                void continueCheckout()
              }
              disabled={
                submitting
              }
              className="group mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white px-5 text-sm font-semibold text-[#07101c] transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                  {text(
                    "Criando checkout...",
                    "Creating checkout..."
                  )}
                </>
              ) : (
                <>
                  {text(
                    "Continuar para pagamento",
                    "Continue to payment"
                  )}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[10px] leading-4 text-white/20">
              {isPizzaSystem
                ? text(
                    "Nenhum adicional é obrigatório. O PizzaSystem continua incluindo o site padrão.",
                    "No add-on is required. PizzaSystem still includes the standard website."
                  )
                : text(
                    "Os valores serão registrados no checkout antes do pagamento.",
                    "Prices will be locked in the checkout before payment."
                  )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
