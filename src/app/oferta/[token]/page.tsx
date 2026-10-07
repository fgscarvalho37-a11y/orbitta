"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  Orbit,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";
import { secureFetch } from "@/lib/secureFetch";

const API_URL =
  "/backend";

type OfferType =
  | "PIZZASYSTEM"
  | "SITE_ONLY"
  | "SITE_PLUS_PIZZASYSTEM";

type PublicOffer = {
  token: string;
  offerType: OfferType;
  title: string;
  description: string | null;
  monthlyPrice: number;
  setupPrice: number;
  totalInitialPrice: number;
  currency: string;
  oneTimeOnly: boolean;
  available: boolean;
  expiresAt: string | null;
};

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

export default function CustomOfferPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const {
    locale,
    text,
  } =
    useLanguage();

  const token =
    Array.isArray(
      params.token
    )
      ? params.token[0]
      : String(
          params.token ??
            ""
        );

  const [
    offer,
    setOffer,
  ] =
    useState<PublicOffer | null>(
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
    accepting,
    setAccepting,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let active =
      true;

    async function load() {
      try {
        setLoading(
          true
        );
        setError(
          ""
        );

        const response =
          await fetch(
            `${API_URL}/api/custom-offers/${encodeURIComponent(
              token
            )}`,
            {
              cache:
                "no-store",
              headers: {
                Accept:
                  "application/json",
              },
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
                "Esta oferta não foi encontrada.",
                "This offer was not found."
              )
          );
        }

        if (active) {
          setOffer(
            body
          );
        }
      } catch (
        caught
      ) {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : text(
                  "Não foi possível carregar esta oferta.",
                  "Could not load this offer."
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

    void load();

    return () => {
      active =
        false;
    };
  }, [
    token,
    text,
  ]);

  async function accept() {
    if (
      !offer ||
      !offer.available ||
      accepting
    ) {
      return;
    }

    try {
      setAccepting(
        true
      );
      setError(
        ""
      );

      const response =
        await secureFetch(
          `${API_URL}/api/custom-offers/${encodeURIComponent(
            token
          )}/accept`,
          {
            method:
              "POST",
            credentials:
              "include",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (
        response.status ===
          401 ||
        response.status ===
          403
      ) {
        router.push(
          `/login?returnUrl=${encodeURIComponent(
            `/oferta/${token}`
          )}`
        );
        return;
      }

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
              "Não foi possível abrir o pagamento.",
              "Could not open payment."
            )
        );
      }

      if (!body?.id) {
        throw new Error(
          text(
            "O checkout não foi criado corretamente.",
            "The checkout was not created correctly."
          )
        );
      }

      router.push(
        `/checkout/${body.id}`
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível continuar.",
              "Could not continue."
            )
      );
    } finally {
      setAccepting(
        false
      );
    }
  }

  const typeLabel =
    offer?.offerType ===
    "SITE_ONLY"
      ? text(
          "Site avulso",
          "Standalone website"
        )
      : offer?.offerType ===
          "SITE_PLUS_PIZZASYSTEM"
        ? text(
            "Site + PizzaSystem",
            "Website + PizzaSystem"
          )
        : "PizzaSystem";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="orbitta-grid absolute inset-0 opacity-20" />
        <div className="absolute left-[-15%] top-[-20%] h-[650px] w-[650px] rounded-full bg-violet-500/[0.08] blur-[130px]" />
        <div className="absolute bottom-[-25%] right-[-10%] h-[650px] w-[650px] rounded-full bg-cyan-400/[0.07] blur-[130px]" />
      </div>

      <header className="relative z-20 border-b border-white/[0.05]">
        <div className="mx-auto flex h-20 max-w-[1300px] items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft
              size={15}
            />
            Orbitta
          </Link>

          <LanguageSwitcher compact />
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1300px] items-center justify-center px-6 py-14">
        {loading ? (
          <div className="flex items-center gap-3 text-sm text-white/35">
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            {text(
              "Carregando oferta...",
              "Loading offer..."
            )}
          </div>
        ) : error &&
          !offer ? (
          <div className="max-w-lg rounded-[30px] border border-red-300/[0.08] bg-[#08101d] p-8 text-center">
            <h1 className="text-2xl font-semibold">
              {text(
                "Oferta indisponível",
                "Offer unavailable"
              )}
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/40">
              {error}
            </p>
          </div>
        ) : offer ? (
          <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-between rounded-[32px] border border-white/[0.07] bg-white/[0.025] p-7 sm:p-9">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/12 bg-violet-300/[0.05] text-violet-200/75">
                  <Orbit
                    size={22}
                  />
                </div>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-cyan-200/65">
                  <Sparkles
                    size={12}
                  />
                  {text(
                    "Oferta personalizada",
                    "Custom offer"
                  )}
                </div>

                <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/28">
                  {typeLabel}
                </p>

                <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                  {
                    offer.title
                  }
                </h1>

                {offer.description && (
                  <p className="mt-5 text-sm leading-7 text-white/42">
                    {
                      offer.description
                    }
                  </p>
                )}
              </div>

              <div className="mt-10 space-y-3 text-xs text-white/32">
                <div className="flex items-center gap-2">
                  <LockKeyhole
                    size={13}
                  />
                  {text(
                    "O comprador é identificado automaticamente pela conta usada para aceitar a oferta.",
                    "The buyer is identified automatically by the account used to accept the offer."
                  )}
                </div>

                {offer.expiresAt && (
                  <div className="flex items-center gap-2">
                    <CalendarClock
                      size={13}
                    />
                    {text(
                      "Oferta válida até",
                      "Offer valid until"
                    )}{" "}
                    {new Intl.DateTimeFormat(
                      locale,
                      {
                        dateStyle:
                          "medium",
                      }
                    ).format(
                      new Date(
                        offer.expiresAt
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-cyan-300/[0.12] bg-[#08101d] p-7 shadow-[0_35px_110px_rgba(0,0,0,0.34)] sm:p-9">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-200/45">
                <CreditCard
                  size={13}
                />
                {text(
                  "Condições negociadas",
                  "Negotiated terms"
                )}
              </div>

              <div className="mt-7 space-y-3">
                {offer.oneTimeOnly ? (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <p className="text-xs text-white/38">
                      {text(
                        "Pagamento único",
                        "One-time payment"
                      )}
                    </p>

                    <p className="mt-2 text-4xl font-semibold tracking-[-0.045em]">
                      {formatMoney(
                        offer.setupPrice,
                        offer.currency,
                        locale
                      )}
                    </p>

                    <p className="mt-2 text-[10px] text-white/22">
                      {text(
                        "Sem mensalidade vinculada a esta oferta.",
                        "No monthly subscription is attached to this offer."
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                      <p className="text-xs text-white/38">
                        {text(
                          "Mensalidade personalizada",
                          "Custom monthly price"
                        )}
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <p className="text-4xl font-semibold tracking-[-0.045em]">
                          {formatMoney(
                            offer.monthlyPrice,
                            offer.currency,
                            locale
                          )}
                        </p>

                        <span className="pb-1 text-xs text-white/25">
                          {text(
                            "/ mês",
                            "/ month"
                          )}
                        </span>
                      </div>
                    </div>

                    {offer.setupPrice >
                      0 && (
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <div>
                          <p className="text-xs text-white/45">
                            {offer.offerType ===
                            "SITE_PLUS_PIZZASYSTEM"
                              ? text(
                                  "Taxa inicial / integração",
                                  "Setup / integration fee"
                                )
                              : text(
                                  "Taxa inicial",
                                  "Setup fee"
                                )}
                          </p>

                          <p className="mt-1 text-[10px] text-white/22">
                            {text(
                              "Cobrança única no primeiro pagamento",
                              "One-time charge on the first payment"
                            )}
                          </p>
                        </div>

                        <p className="text-lg font-semibold text-white/75">
                          {formatMoney(
                            offer.setupPrice,
                            offer.currency,
                            locale
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-cyan-300/[0.08] bg-cyan-300/[0.025] p-5">
                      <div>
                        <p className="text-xs text-cyan-100/65">
                          {text(
                            "Primeiro pagamento",
                            "First payment"
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-white/22">
                          {text(
                            "Mensalidade + eventual taxa inicial",
                            "Monthly price plus any setup fee"
                          )}
                        </p>
                      </div>

                      <p className="text-xl font-semibold text-cyan-100/80">
                        {formatMoney(
                          offer.totalInitialPrice,
                          offer.currency,
                          locale
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {!offer.available && (
                <div className="mt-5 rounded-2xl border border-amber-300/[0.08] bg-amber-300/[0.035] px-5 py-4 text-xs leading-5 text-amber-100/65">
                  {text(
                    "Este link foi desativado ou expirou e não pode mais gerar um checkout.",
                    "This link was disabled or expired and can no longer create a checkout."
                  )}
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
                  void accept()
                }
                disabled={
                  accepting ||
                  !offer.available
                }
                className="group mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-semibold text-[#07101c] transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {accepting ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    {text(
                      "Preparando checkout...",
                      "Preparing checkout..."
                    )}
                  </>
                ) : (
                  <>
                    <Check
                      size={15}
                    />
                    {text(
                      "Aceitar oferta e continuar",
                      "Accept offer and continue"
                    )}
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[10px] leading-4 text-white/20">
                {text(
                  "Ao continuar, você entra no checkout da Orbitta para revisar os valores e aceitar os termos antes do pagamento.",
                  "After continuing, you enter the Orbitta checkout to review the amounts and accept the terms before payment."
                )}
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
