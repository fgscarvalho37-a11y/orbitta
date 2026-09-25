"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ExternalLink,
  Globe2,
  Link2,
  LockKeyhole,
  Pizza,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const API_URL = "/backend";

type ClientProduct = {
  id: number;
  name: string;
  planName: string;
  domain: string | null;
  systemUrl: string | null;
  status:
    | "ACTIVE"
    | "SUSPENDED"
    | "CANCELLED";
};

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

function displayAddress(
  value: string | null
) {
  if (!value) {
    return "Endereço em preparação";
  }

  return value
    .replace(
      /^https?:\/\//,
      ""
    )
    .replace(
      /\/$/,
      ""
    );
}

export default function DominiosPage() {
  const [
    products,
    setProducts,
  ] =
    useState<ClientProduct[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/client/products`,
          {
            method: "GET",
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

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar seus endereços."
        );
      }

      const data =
        await response.json();

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os endereços."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const productsWithStorefront =
    products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(
            "pizza"
          )
    );

  return (
    <div className="relative overflow-hidden">

      <div className="pointer-events-none absolute right-[-180px] top-[-200px] h-[650px] w-[650px] rounded-full bg-cyan-400/[0.035] blur-[150px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10">

        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-cyan-300/45">
              <Globe2 size={12} />
              Endereços
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Loja online
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
              Aqui aparecem os endereços públicos dos seus produtos. O endereço hospedado do PizzaSystem não exige a compra de um domínio próprio.
            </p>

          </div>

          <button
            type="button"
            onClick={
              loadProducts
            }
            className="flex h-10 w-fit items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/70"
          >
            <RefreshCw
              size={13}
            />
            Atualizar
          </button>

        </section>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.025] p-5 text-xs text-red-200/60">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 h-60 animate-pulse rounded-[28px] border border-white/[0.05] bg-[#08101d]/60" />
        ) : productsWithStorefront.length ===
          0 ? (
          <div className="mt-8 rounded-[28px] border border-white/[0.06] bg-[#08101d]/70 p-8 text-center">

            <Globe2
              size={30}
              className="mx-auto text-white/15"
            />

            <h2 className="mt-4 text-lg font-medium text-white/65">
              Nenhuma loja online ainda
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-white/25">
              Quando um produto com loja pública for ativado, o endereço aparecerá aqui.
            </p>

          </div>
        ) : (
          <section className="mt-8 grid gap-5">

            {productsWithStorefront.map(
              (product) => {

                const publicUrl =
                  externalUrl(
                    product.domain
                  );

                const active =
                  product.status ===
                  "ACTIVE";

                return (
                  <article
                    key={
                      product.id
                    }
                    className="overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#08101d]/75"
                  >

                    <div className="flex flex-col justify-between gap-6 border-b border-white/[0.05] p-6 sm:p-8 lg:flex-row lg:items-center">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/[0.08] bg-cyan-300/[0.04] text-cyan-200/55">
                          <Pizza
                            size={21}
                          />
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h2 className="text-lg font-semibold text-white/75">
                              {product.name}
                            </h2>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider ${
                                active
                                  ? "border-emerald-300/[0.08] bg-emerald-300/[0.04] text-emerald-200/55"
                                  : "border-amber-300/[0.08] bg-amber-300/[0.04] text-amber-200/55"
                              }`}
                            >
                              {active
                                ? "Ativo"
                                : product.status}
                            </span>

                          </div>

                          <div className="mt-2 flex items-center gap-2 text-xs text-white/30">

                            <Link2
                              size={12}
                            />

                            <span className="break-all">
                              {displayAddress(
                                product.domain
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        {publicUrl ? (
                          <a
                            href={
                              publicUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#07101c]"
                          >
                            Abrir loja
                            <ExternalLink
                              size={12}
                            />
                          </a>
                        ) : null}

                        <Link
                          href={
                            `/painel/produtos/${product.id}`
                          }
                          className="flex h-10 items-center rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05]"
                        >
                          Gerenciar produto
                        </Link>

                      </div>

                    </div>

                    <div className="grid gap-px bg-white/[0.04] sm:grid-cols-3">

                      <div className="bg-[#08101d] p-5">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/20">
                          <Globe2 size={12} />
                          Hospedagem
                        </div>
                        <p className="mt-3 text-sm text-white/60">
                          Incluída
                        </p>
                      </div>

                      <div className="bg-[#08101d] p-5">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/20">
                          <LockKeyhole size={12} />
                          HTTPS
                        </div>
                        <p className="mt-3 text-sm text-white/60">
                          Protegido
                        </p>
                      </div>

                      <div className="bg-[#08101d] p-5">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/20">
                          <ShieldCheck size={12} />
                          Plano
                        </div>
                        <p className="mt-3 text-sm text-white/60">
                          {product.planName}
                        </p>
                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

        <section className="mt-6 rounded-[24px] border border-cyan-300/[0.06] bg-cyan-300/[0.02] p-6">

          <h3 className="text-sm font-medium text-white/60">
            Domínio próprio é opcional
          </h3>

          <p className="mt-2 max-w-4xl text-xs leading-6 text-white/25">
            O endereço hospedado pela Orbitta pode ser usado sem comprar outro domínio. Se você quiser usar algo como pizzariadojoao.com.br, esse domínio precisa existir em um registrador e depois ser conectado à Orbitta. A hospedagem da aplicação continua sendo a mesma.
          </p>

        </section>

      </div>

    </div>
  );
}
