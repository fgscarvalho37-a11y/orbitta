"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Globe2,
  PackageOpen,
  Pizza,
  RefreshCw,
  Server,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ClientProduct = {
  id: number;
  name: string;
  subtitle: string | null;
  planName: string;
  monthlyPrice: number;
  domain: string | null;
  systemUrl: string | null;
  status: "ACTIVE" | "SUSPENDED" | "CANCELLED";
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Não definida";
  }

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function externalUrl(
  value: string | null
) {
  if (!value) {
    return null;
  }

  const trimmed =
    value.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getStatusLabel(status: ClientProduct["status"]) {
  switch (status) {
    case "ACTIVE":
      return "Ativo";

    case "SUSPENDED":
      return "Suspenso";

    case "CANCELLED":
      return "Cancelado";

    default:
      return status;
  }
}

function getStatusClasses(status: ClientProduct["status"]) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-300/[0.08] bg-emerald-300/[0.04] text-emerald-200/60";

    case "SUSPENDED":
      return "border-amber-300/[0.08] bg-amber-300/[0.04] text-amber-200/60";

    case "CANCELLED":
      return "border-red-300/[0.08] bg-red-300/[0.04] text-red-200/60";

    default:
      return "border-white/[0.08] bg-white/[0.04] text-white/50";
  }
}

function getStatusDotClasses(status: ClientProduct["status"]) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-400";

    case "SUSPENDED":
      return "bg-amber-400";

    case "CANCELLED":
      return "bg-red-400";

    default:
      return "bg-white/40";
  }
}

export default function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = use(params);

  const [product, setProduct] =
    useState<ClientProduct | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadProduct() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/client/products/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.status === 404) {
        setProduct(null);

        setError(
          "Este produto não existe ou não pertence à sua conta."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar produto: ${response.status}`
        );
      }

      const data: ClientProduct =
        await response.json();

      setProduct(data);
    } catch (err) {
      console.error(err);

      setProduct(null);

      setError(
        "Não foi possível carregar este produto."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-7 lg:px-10">
        <div className="h-[420px] animate-pulse rounded-[28px] border border-white/[0.05] bg-[#08101d]/60" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-7 lg:px-10">
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-white/[0.06] bg-[#08101d]/70 px-6 text-center">
          <PackageOpen
            size={32}
            className="text-white/15"
          />

          <h1 className="mt-5 text-lg font-medium text-white/65">
            Produto não encontrado
          </h1>

          <p className="mt-2 max-w-md text-xs leading-5 text-white/25">
            {error ??
              "Não foi possível encontrar este produto."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/painel/produtos"
              className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/50 transition hover:bg-white/[0.05] hover:text-white/75"
            >
              <ArrowLeft size={13} />
              Voltar aos produtos
            </Link>

            <button
              type="button"
              onClick={loadProduct}
              className="flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#07101c]"
            >
              <RefreshCw size={13} />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const services = [
    {
      name: "Aplicação",
      detail: product.name,
      online: product.status === "ACTIVE",
    },
    {
      name: "Banco de dados",
      detail: "Produção",
      online: product.status === "ACTIVE",
    },
    {
      name: "Domínio",
      detail:
        product.domain ?? "Não configurado",
      online:
        product.status === "ACTIVE" &&
        Boolean(product.domain),
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      <div className="pointer-events-none absolute left-[15%] top-[-220px] h-[520px] w-[520px] rounded-full bg-violet-500/[0.04] blur-[140px]" />

      <div className="pointer-events-none absolute right-[-120px] top-[180px] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.035] blur-[130px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        {/* VOLTAR */}
        <Link
          href="/painel/produtos"
          className="group inline-flex items-center gap-2 text-xs text-white/25 transition hover:text-white/60"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />

          Meus produtos
        </Link>

        {/* HEADER */}
        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mt-7 flex flex-col justify-between gap-7 xl:flex-row xl:items-end"
        >
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-300 via-red-400 to-violet-500 text-[#090b12] shadow-[0_15px_45px_rgba(251,146,60,0.14)]">
              <Pizza size={27} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                  {product.name}
                </h1>

                <span
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider ${getStatusClasses(
                    product.status
                  )}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${getStatusDotClasses(
                      product.status
                    )}`}
                  />

                  {getStatusLabel(
                    product.status
                  )}
                </span>
              </div>

              <p className="mt-2 text-sm text-white/25">
                {product.subtitle ??
                  "Produto Orbitta"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {externalUrl(
              product.domain
            ) ? (
              <a
                href={
                  externalUrl(
                    product.domain
                  )!
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-5 text-xs font-semibold text-white/70 transition hover:bg-white/[0.07]"
              >
                Abrir loja

                <Globe2
                  size={13}
                />
              </a>
            ) : null}

            {product.systemUrl ? (
              <a
                href={product.systemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-white/90"
              >
                Abrir sistema

                <ExternalLink
                  size={13}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            ) : null}
          </div>
        </motion.section>

        {/* INFO */}
        <section className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={WalletCards}
            label="Plano"
            value={product.planName}
          />

          <InfoCard
            icon={CreditCard}
            label="Mensalidade"
            value={formatCurrency(
              product.monthlyPrice
            )}
          />

          <InfoCard
            icon={CalendarDays}
            label="Próxima renovação"
            value={formatDate(
              product.renewalDate
            )}
          />

          <InfoCard
            icon={Globe2}
            label="Domínio"
            value={
              product.domain ??
              "Não configurado"
            }
          />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          {/* PRODUTO */}
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.12,
            }}
            className="rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="border-b border-white/[0.05] px-6 py-5">
              <div className="text-xs font-medium text-white/60">
                Informações do produto
              </div>

              <div className="mt-1 text-[10px] text-white/20">
                Dados da sua assinatura Orbitta
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail
                  label="Produto"
                  value={product.name}
                />

                <Detail
                  label="Plano contratado"
                  value={product.planName}
                />

                <Detail
                  label="Status"
                  value={getStatusLabel(
                    product.status
                  )}
                />

                <Detail
                  label="Mensalidade"
                  value={formatCurrency(
                    product.monthlyPrice
                  )}
                />

                <Detail
                  label="Renovação"
                  value={formatDate(
                    product.renewalDate
                  )}
                />

                <Detail
                  label="Domínio"
                  value={
                    product.domain ??
                    "Não configurado"
                  }
                />
              </div>

              <div className="mt-6 border-t border-white/[0.05] pt-6">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/20">
                  Registro
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Detail
                    label="Criado em"
                    value={formatDateTime(
                      product.createdAt
                    )}
                  />

                  <Detail
                    label="Última atualização"
                    value={formatDateTime(
                      product.updatedAt
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* INFRA */}
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.18,
            }}
            className="rounded-[26px] border border-white/[0.06] bg-[#08101d]/70"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
              <div>
                <div className="text-xs font-medium text-white/60">
                  Infraestrutura
                </div>

                <div className="mt-1 text-[10px] text-white/20">
                  Serviços do produto
                </div>
              </div>

              <Server
                size={16}
                className="text-white/20"
              />
            </div>

            <div className="p-5">
              <div className="space-y-2">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-white/[0.018] p-4"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        service.online
                          ? "bg-emerald-300/[0.04] text-emerald-200/50"
                          : "bg-white/[0.03] text-white/20"
                      }`}
                    >
                      <CheckCircle2 size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-white/55">
                        {service.name}
                      </div>

                      <div className="mt-1 truncate text-[10px] text-white/20">
                        {service.detail}
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 text-[9px] ${
                        service.online
                          ? "text-emerald-200/45"
                          : "text-white/20"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          service.online
                            ? "bg-emerald-400"
                            : "bg-white/20"
                        }`}
                      />

                      {service.online
                        ? "Online"
                        : "Indisponível"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-cyan-300/[0.06] bg-cyan-300/[0.025] p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-cyan-200/50"
                  />

                  <div>
                    <div className="text-xs text-white/55">
                      Ambiente gerenciado
                    </div>

                    <p className="mt-1.5 text-[10px] leading-5 text-white/25">
                      Os serviços vinculados ao produto são
                      administrados pela infraestrutura Orbitta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-white/[0.06] bg-[#08101d]/70 p-5"
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-white/20">
        <Icon size={13} />
        {label}
      </div>

      <div className="mt-4 truncate text-sm font-medium text-white/65">
        {value}
      </div>
    </motion.div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.018] p-4">
      <div className="text-[9px] uppercase tracking-[0.14em] text-white/20">
        {label}
      </div>

      <div className="mt-2 break-words text-xs text-white/55">
        {value}
      </div>
    </div>
  );
}