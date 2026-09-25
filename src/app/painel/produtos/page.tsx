"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  PackageOpen,
  Pizza,
  RefreshCw,
  WalletCards,
} from "lucide-react";

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

const API_URL = "/backend";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "Não definida";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
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

export default function ProductsPage() {
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/client/products`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        window.location.href = `/login?returnUrl=${encodeURIComponent(
          "/painel/produtos"
        )}`;
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar produtos: ${response.status}`
        );
      }

      const data: ClientProduct[] = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setProducts([]);
      setError("Não foi possível carregar seus produtos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-7 lg:px-10">
        <div className="mb-8">
          <div className="h-8 w-52 animate-pulse rounded-lg bg-white/[0.05]" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-lg bg-white/[0.03]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[300px] animate-pulse rounded-[26px] border border-white/[0.05] bg-[#08101d]/60"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      <div className="pointer-events-none absolute left-[10%] top-[-240px] h-[520px] w-[520px] rounded-full bg-violet-500/[0.04] blur-[140px]" />
      <div className="pointer-events-none absolute right-[-150px] top-[200px] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.035] blur-[130px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/20">
              Orbitta
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Meus produtos
            </h1>

            <p className="mt-3 max-w-xl text-xs leading-5 text-white/30">
              Acesse e acompanhe os produtos vinculados à sua conta.
            </p>
          </div>

          <button
            type="button"
            onClick={loadProducts}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/40 transition hover:bg-white/[0.05] hover:text-white/70"
          >
            <RefreshCw size={13} />
            Atualizar
          </button>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.03] px-5 py-4 text-xs text-red-200/60">
            {error}
          </div>
        ) : null}

        {!error && products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex min-h-[380px] flex-col items-center justify-center rounded-[28px] border border-white/[0.06] bg-[#08101d]/70 px-6 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.025]">
              <PackageOpen size={23} className="text-white/20" />
            </div>

            <h2 className="mt-5 text-base font-medium text-white/65">
              Nenhum produto contratado
            </h2>

            <p className="mt-2 max-w-md text-xs leading-5 text-white/25">
              Quando você contratar um produto Orbitta, ele aparecerá
              aqui para gerenciamento e acesso.
            </p>

            <Link
              href="/produtos"
              className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-white/90"
            >
              Conhecer produtos
              <ArrowRight size={13} />
            </Link>
          </motion.div>
        ) : null}

        {!error && products.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]/70 transition hover:border-white/[0.1] hover:bg-[#0a1321]/80"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-orange-300 via-red-400 to-violet-500 text-[#090b12] shadow-[0_12px_35px_rgba(251,146,60,0.1)]">
                      <Pizza size={21} />
                    </div>

                    <div
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider ${getStatusClasses(
                        product.status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDotClasses(
                          product.status
                        )}`}
                      />
                      {getStatusLabel(product.status)}
                    </div>
                  </div>

                  <h2 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-white/80">
                    {product.name}
                  </h2>

                  <p className="mt-1.5 min-h-10 text-xs leading-5 text-white/25">
                    {product.subtitle ?? "Produto Orbitta"}
                  </p>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.018] px-4 py-3">
                      <div className="flex items-center gap-2 text-[10px] text-white/25">
                        <WalletCards size={12} />
                        Plano
                      </div>

                      <div className="text-[10px] font-medium text-white/55">
                        {product.planName}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.018] px-4 py-3">
                      <div className="text-[10px] text-white/25">
                        Mensalidade
                      </div>

                      <div className="text-[10px] font-medium text-white/55">
                        {formatCurrency(product.monthlyPrice)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.018] px-4 py-3">
                      <div className="flex items-center gap-2 text-[10px] text-white/25">
                        <CalendarDays size={12} />
                        Renovação
                      </div>

                      <div className="text-[10px] font-medium text-white/55">
                        {formatDate(product.renewalDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-white/[0.05] p-4">
                  <Link
                    href={`/painel/produtos/${product.id}`}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#07101c] transition hover:bg-white/90"
                  >
                    Gerenciar
                    <ArrowRight size={13} />
                  </Link>

                  {product.systemUrl ? (
                    <a
                      href={product.systemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir sistema"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
                    >
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
              </motion.article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
