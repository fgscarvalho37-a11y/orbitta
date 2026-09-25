"use client";

import {
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const API_URL = "/backend";

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
  productId: number;
  planId: number;
  productName: string;
  planName: string;
  monthlyPrice: number;
  setupPrice: number;
  totalPrice: number;
  currency: string;
  status: string;
  externalReference: string;
  expiresAt: string | null;
  createdAt: string;
};

type ProductPricingProps = {
  slug: string;
};

function formatMoney(
  value: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

async function readErrorMessage(
  response: Response
) {
  const text = await response.text();

  if (!text) {
    return "Não foi possível concluir a solicitação.";
  }

  try {
    const data = JSON.parse(text);

    if (
      typeof data?.message === "string" &&
      data.message.trim()
    ) {
      return data.message;
    }

    if (
      typeof data?.error === "string" &&
      data.error.trim()
    ) {
      return data.error;
    }
  } catch {
    // A resposta não era JSON.
  }

  return text;
}

export default function ProductPricing({
  slug,
}: ProductPricingProps) {
  const router = useRouter();

  const [product, setProduct] =
    useState<CatalogProduct | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [unavailable, setUnavailable] =
    useState(false);

  const [contractingPlanId, setContractingPlanId] =
    useState<number | null>(null);

  const [checkoutError, setCheckoutError] =
    useState<string | null>(null);

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

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleContract(
    plan: CatalogPlan
  ) {
    if (contractingPlanId !== null) {
      return;
    }

    try {
      setContractingPlanId(plan.id);
      setCheckoutError(null);

      /*
       * Primeiro verificamos se existe uma sessão válida.
       *
       * O endpoint /api/auth/me já faz parte do fluxo
       * de autenticação do Orbitta.
       */
      const meResponse = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (
        meResponse.status === 401 ||
        meResponse.status === 403
      ) {
        const returnUrl =
          `/checkout/start?planId=${plan.id}`;

        router.push(
          `/login?returnUrl=${encodeURIComponent(
            returnUrl
          )}`
        );

        return;
      }

      if (!meResponse.ok) {
        throw new Error(
          "Não foi possível verificar sua sessão."
        );
      }

      /*
       * Cliente que já pagou e possui produto ativo
       * não deve abrir um segundo checkout do mesmo SaaS.
       *
       * Além de melhorar a experiência, isso evita que um
       * erro de regra de negócio apareça como "Internal Server Error"
       * caso o backend ainda esteja em uma versão anterior.
       */
      const activeProductsResponse =
        await fetch(
          `${API_URL}/api/client/products/active`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

      if (
        activeProductsResponse.ok
      ) {
        const activeProducts:
          Array<{
            name?: string;
            planName?: string;
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

      /*
       * Busca o token CSRF.
       */
      const csrfResponse = await fetch(
        `${API_URL}/api/csrf`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!csrfResponse.ok) {
        throw new Error(
          "Não foi possível iniciar a contratação."
        );
      }

      const csrf: CsrfResponse =
        await csrfResponse.json();

      if (
        !csrf.token ||
        !csrf.headerName
      ) {
        throw new Error(
          "Token de segurança inválido."
        );
      }

      /*
       * O frontend envia SOMENTE o ID do plano.
       *
       * Produto, preço, moeda e demais informações
       * são resolvidos novamente pelo backend.
       */
      const checkoutResponse = await fetch(
        `${API_URL}/api/checkout/subscriptions`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            [csrf.headerName]: csrf.token,
          },
          body: JSON.stringify({
            planId: plan.id,
          }),
        }
      );

      if (
        checkoutResponse.status === 401 ||
        checkoutResponse.status === 403
      ) {
        const returnUrl =
          `/checkout/start?planId=${plan.id}`;

        router.push(
          `/login?returnUrl=${encodeURIComponent(
            returnUrl
          )}`
        );

        return;
      }

      if (!checkoutResponse.ok) {
        const message =
          await readErrorMessage(
            checkoutResponse
          );

        throw new Error(message);
      }

      const checkout: CheckoutResponse =
        await checkoutResponse.json();

      /*
       * Próxima tela:
       * /checkout/[id]
       *
       * Ela será responsável pelo resumo da compra
       * e posteriormente pelo Mercado Pago.
       */
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
          : "Não foi possível iniciar a contratação."
      );
    } finally {
      setContractingPlanId(null);
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
              Carregando planos
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
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/55">
            Planos
          </p>

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Escolha como usar o{" "}
            {product.name}.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/35">
            Planos configurados diretamente
            pela Orbitta para contratação da
            plataforma.
          </p>
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
          {product.plans.map((plan) => {
            const contracting =
              contractingPlanId === plan.id;

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
                        {product.name}
                      </p>

                      <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em]">
                        {plan.name}
                      </h3>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] text-emerald-200/60">
                      <Check size={15} />
                    </div>
                  </div>

                  {plan.description && (
                    <p className="mt-5 min-h-[48px] text-sm leading-6 text-white/30">
                      {plan.description}
                    </p>
                  )}

                  <div className="mt-8">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-semibold tracking-[-0.05em] text-white">
                        {formatMoney(
                          Number(
                            plan.monthlyPrice
                          ),
                          plan.currency
                        )}
                      </span>

                      <span className="pb-1 text-xs text-white/25">
                        / mês
                      </span>
                    </div>

                    {Number(plan.setupPrice) >
                      0 && (
                      <p className="mt-2 text-[11px] text-white/25">
                        +{" "}
                        {formatMoney(
                          Number(
                            plan.setupPrice
                          ),
                          plan.currency
                        )}{" "}
                        de taxa inicial
                      </p>
                    )}
                  </div>

                  <div className="my-8 h-px bg-white/[0.06]" />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-white/45">
                      <Check
                        size={14}
                        className="text-cyan-300/60"
                      />
                      Acesso à plataforma
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/45">
                      <Check
                        size={14}
                        className="text-cyan-300/60"
                      />
                      Atualizações incluídas
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/45">
                      <Check
                        size={14}
                        className="text-cyan-300/60"
                      />
                      Suporte Orbitta
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleContract(plan)
                    }
                    disabled={
                      contractingPlanId !== null
                    }
                    className="group mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-sm font-semibold text-[#07101c] transition hover:scale-[1.01] hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {contracting ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        Contratar

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
          })}
        </div>
      </div>
    </section>
  );
}