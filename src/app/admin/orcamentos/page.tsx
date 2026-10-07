"use client";

import {
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
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

type QuoteStatus =
  | "NEW"
  | "CONTACTED"
  | "CLOSED";

type QuoteRequest = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  projectType: string;
  message: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
};

function projectLabel(
  value: string,
  english: boolean
) {
  const labels:
    Record<
      string,
      [
        string,
        string
      ]
    > = {
      LANDING_PAGE: [
        "Landing page",
        "Landing page",
      ],
      BUSINESS_SITE: [
        "Site institucional",
        "Business website",
      ],
      ECOMMERCE: [
        "E-commerce",
        "E-commerce",
      ],
      SITE_PLUS_PIZZASYSTEM: [
        "Site + PizzaSystem",
        "Website + PizzaSystem",
      ],
      OTHER: [
        "Outro",
        "Other",
      ],
    };

  const label =
    labels[value];

  if (!label) {
    return value;
  }

  return english
    ? label[1]
    : label[0];
}

export default function QuoteRequestsAdminPage() {
  const {
    locale,
    text,
  } =
    useLanguage();

  const [
    requests,
    setRequests,
  ] =
    useState<QuoteRequest[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    updatingId,
    setUpdatingId,
  ] =
    useState<
      number | null
    >(
      null
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

          const response =
            await secureFetch(
              `${API_URL}/api/admin/quote-requests`,
              {
                credentials:
                  "include",
                cache:
                  "no-store",
              }
            );

          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            window.location.href =
              "/login?returnUrl=%2Fadmin%2Forcamentos";
            return;
          }

          if (!response.ok) {
            throw new Error(
              text(
                "Não foi possível carregar os orçamentos.",
                "Could not load quote requests."
              )
            );
          }

          setRequests(
            await response.json()
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

  async function setStatus(
    request:
      QuoteRequest,
    status:
      QuoteStatus
  ) {
    try {
      setUpdatingId(
        request.id
      );
      setError(
        ""
      );

      const response =
        await secureFetch(
          `${API_URL}/api/admin/quote-requests/${request.id}/status`,
          {
            method:
              "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                status,
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
              "Não foi possível atualizar o orçamento.",
              "Could not update the quote request."
            )
        );
      }

      setRequests(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              request.id
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
              "Não foi possível atualizar.",
              "Could not update."
            )
      );
    } finally {
      setUpdatingId(
        null
      );
    }
  }

  const newCount =
    useMemo(
      () =>
        requests.filter(
          (
            request
          ) =>
            request.status ===
            "NEW"
        ).length,
      [
        requests,
      ]
    );

  const isEnglish =
    locale.startsWith(
      "en"
    );

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-violet-200/35">
              {text(
                "Comercial",
                "Sales"
              )}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {text(
                "Orçamentos",
                "Quote requests"
              )}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/30">
              {text(
                "Solicitações enviadas pelo formulário público da Orbitta. Nenhum login é exigido do interessado.",
                "Requests submitted through the public Orbitta form. No account is required."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/45"
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-[#08101d] p-5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/25">
              {text(
                "Total",
                "Total"
              )}
            </div>
            <div className="mt-2 text-3xl font-semibold text-white/80">
              {
                requests.length
              }
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-300/[0.08] bg-cyan-300/[0.025] p-5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/35">
              {text(
                "Novos",
                "New"
              )}
            </div>
            <div className="mt-2 text-3xl font-semibold text-cyan-100/80">
              {
                newCount
              }
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-5 py-4 text-xs text-red-100/70">
            {error}
          </div>
        )}

        <section className="mt-7 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#08101d]">
          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-white/30">
              {text(
                "Carregando...",
                "Loading..."
              )}
            </div>
          ) : requests.length ===
            0 ? (
            <div className="px-6 py-16 text-center text-sm text-white/30">
              {text(
                "Nenhuma solicitação recebida ainda.",
                "No quote requests received yet."
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {requests.map(
                (
                  request
                ) => (
                  <article
                    key={
                      request.id
                    }
                    className="p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-white/80">
                            {
                              request.name
                            }
                          </h2>

                          <span className="rounded-full border border-violet-300/[0.08] bg-violet-300/[0.035] px-2.5 py-1 text-[9px] text-violet-100/55">
                            {projectLabel(
                              request.projectType,
                              isEnglish
                            )}
                          </span>

                          <span
                            className={
                              request.status ===
                              "NEW"
                                ? "rounded-full border border-cyan-300/[0.08] bg-cyan-300/[0.035] px-2.5 py-1 text-[9px] text-cyan-100/60"
                                : request.status ===
                                  "CONTACTED"
                                  ? "rounded-full border border-amber-300/[0.08] bg-amber-300/[0.035] px-2.5 py-1 text-[9px] text-amber-100/60"
                                  : "rounded-full border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-2.5 py-1 text-[9px] text-emerald-100/60"
                            }
                          >
                            {request.status ===
                            "NEW"
                              ? text(
                                  "Novo",
                                  "New"
                                )
                              : request.status ===
                                "CONTACTED"
                                ? text(
                                    "Contatado",
                                    "Contacted"
                                  )
                                : text(
                                    "Fechado",
                                    "Closed"
                                  )}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/32">
                          <a
                            href={`mailto:${request.email}`}
                            className="flex items-center gap-2 hover:text-white/60"
                          >
                            <Mail
                              size={12}
                            />
                            {
                              request.email
                            }
                          </a>

                          {request.phone && (
                            <div className="flex items-center gap-2">
                              <Phone
                                size={12}
                              />
                              {
                                request.phone
                              }
                            </div>
                          )}

                          {request.company && (
                            <div className="flex items-center gap-2">
                              <Building2
                                size={12}
                              />
                              {
                                request.company
                              }
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Clock3
                              size={12}
                            />
                            {new Intl.DateTimeFormat(
                              locale,
                              {
                                dateStyle:
                                  "medium",
                                timeStyle:
                                  "short",
                              }
                            ).format(
                              new Date(
                                request.createdAt
                              )
                            )}
                          </div>
                        </div>

                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.018] p-4">
                          <MessageSquareText
                            size={14}
                            className="mt-0.5 shrink-0 text-white/30"
                          />

                          <p className="whitespace-pre-wrap text-sm leading-6 text-white/42">
                            {
                              request.message
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void setStatus(
                              request,
                              "CONTACTED"
                            )
                          }
                          disabled={
                            updatingId ===
                            request.id
                          }
                          className="h-9 rounded-xl border border-amber-300/[0.08] bg-amber-300/[0.025] px-3 text-[10px] text-amber-100/55 disabled:opacity-50"
                        >
                          {text(
                            "Marcar contatado",
                            "Mark contacted"
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void setStatus(
                              request,
                              "CLOSED"
                            )
                          }
                          disabled={
                            updatingId ===
                            request.id
                          }
                          className="flex h-9 items-center gap-2 rounded-xl border border-emerald-300/[0.08] bg-emerald-300/[0.025] px-3 text-[10px] text-emerald-100/55 disabled:opacity-50"
                        >
                          <CheckCircle2
                            size={12}
                          />
                          {text(
                            "Fechar",
                            "Close"
                          )}
                        </button>
                      </div>
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
