"use client";

import {
  Boxes,
  Loader2,
  PackagePlus,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

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

type ProductForm = {
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  landingPageUrl: string;
  active: boolean;
  displayOrder: string;
};

const initialForm: ProductForm = {
  name: "",
  slug: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  landingPageUrl: "",
  active: true,
  displayOrder: "0",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<
    CatalogProduct[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [form, setForm] =
    useState<ProductForm>(initialForm);

  const loadProducts = useCallback(
    async (manual = false) => {
      try {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await fetch(
          `${API_URL}/api/admin/catalog/products`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erro ao carregar catálogo: ${response.status}`
          );
        }

        const data: CatalogProduct[] =
          await response.json();

        setProducts(data);
      } catch (err) {
        console.error(err);

        setError(
          "Não foi possível carregar os produtos."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function updateForm<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateSlug(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: generateSlug(value),
    }));
  }

  function openCreateModal() {
    setForm(initialForm);
    setError(null);
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (saving) {
      return;
    }

    setCreateOpen(false);
    setForm(initialForm);
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Informe o nome do produto.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Informe o slug do produto.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/admin/catalog/products`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim(),
            subtitle:
              form.subtitle.trim() || null,
            description:
              form.description.trim() || null,
            imageUrl:
              form.imageUrl.trim() || null,
            landingPageUrl:
              form.landingPageUrl.trim() || null,
            active: form.active,
            displayOrder:
              Number(form.displayOrder) || 0,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Não foi possível criar o produto.";

        try {
          const data = await response.json();

          if (typeof data?.message === "string") {
            message = data.message;
          }
        } catch {
          // resposta sem JSON
        }

        throw new Error(message);
      }

      const created: CatalogProduct =
        await response.json();

      setProducts((current) => [
        ...current,
        created,
      ]);

      setCreateOpen(false);
      setForm(initialForm);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o produto."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}

        <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-violet-200/35">
              <Boxes size={13} />
              Catálogo Orbitta
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              Produtos
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/30">
              Gerencie os produtos e planos
              disponíveis para novas
              contratações.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadProducts(true)}
              disabled={refreshing}
              className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Atualizar
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50"
            >
              <Plus size={15} />
              Novo produto
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && !createOpen && (
          <div className="mt-6 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-5 py-4 text-xs text-red-100/70">
            {error}
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2
                size={22}
                className="animate-spin text-violet-200/50"
              />

              <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                Carregando catálogo
              </span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/[0.08] bg-white/[0.015] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/[0.08] bg-violet-300/[0.035] text-violet-200/50">
              <PackagePlus size={22} />
            </div>

            <h2 className="mt-5 text-lg font-medium text-white/80">
              Nenhum produto cadastrado
            </h2>

            <p className="mt-2 max-w-md text-xs leading-6 text-white/25">
              Cadastre o primeiro produto da
              Orbitta. Depois você poderá
              adicionar e configurar os planos.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50"
            >
              <Plus size={15} />
              Criar primeiro produto
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-[26px] border border-white/[0.06] bg-[#08101d] p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-white/85">
                        {product.name}
                      </h2>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${
                          product.active
                            ? "border-emerald-300/[0.12] bg-emerald-300/[0.04] text-emerald-200/60"
                            : "border-white/[0.07] bg-white/[0.025] text-white/25"
                        }`}
                      >
                        {product.active
                          ? "Ativo"
                          : "Inativo"}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-violet-200/35">
                      /{product.slug}
                    </div>

                    {product.subtitle && (
                      <p className="mt-3 text-sm text-white/35">
                        {product.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs text-white/30">
                    {product.plans.length}{" "}
                    {product.plans.length === 1
                      ? "plano"
                      : "planos"}
                  </div>
                </div>

                {product.plans.length > 0 && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {product.plans.map(
                      (plan) => (
                        <div
                          key={plan.id}
                          className="rounded-2xl border border-white/[0.055] bg-white/[0.018] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm text-white/70">
                                {plan.name}
                              </div>

                              <div className="mt-1 text-[10px] text-white/20">
                                /{plan.slug}
                              </div>
                            </div>

                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                plan.active
                                  ? "bg-emerald-300"
                                  : "bg-white/20"
                              }`}
                            />
                          </div>

                          <div className="mt-5">
                            <span className="text-xl font-semibold text-white/85">
                              {new Intl.NumberFormat(
                                "pt-BR",
                                {
                                  style:
                                    "currency",
                                  currency:
                                    plan.currency,
                                }
                              ).format(
                                plan.monthlyPrice
                              )}
                            </span>

                            <span className="ml-1 text-[10px] text-white/25">
                              /mês
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}

      {createOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/[0.08] bg-[#08101d] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">
                  Novo produto
                </h2>

                <p className="mt-1 text-xs text-white/25">
                  Cadastre um produto no catálogo
                  da Orbitta.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-white/30 transition hover:bg-white/[0.04] hover:text-white/70"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                    Nome
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                    placeholder="PizzaSystem"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                    Slug
                  </span>

                  <input
                    value={form.slug}
                    onChange={(event) =>
                      updateForm(
                        "slug",
                        generateSlug(
                          event.target.value
                        )
                      )
                    }
                    placeholder="pizzasystem"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                    Subtítulo
                  </span>

                  <input
                    value={form.subtitle}
                    onChange={(event) =>
                      updateForm(
                        "subtitle",
                        event.target.value
                      )
                    }
                    placeholder="Sistema completo para pizzarias"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                    Descrição
                  </span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Descrição comercial do produto..."
                    className="mt-2 w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                    URL da imagem
                  </span>

                  <input
                    value={form.imageUrl}
                    onChange={(event) =>
                      updateForm(
                        "imageUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                    Landing page
                  </span>

                  <input
                    value={form.landingPageUrl}
                    onChange={(event) =>
                      updateForm(
                        "landingPageUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-violet-300/25"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                    Ordem
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={form.displayOrder}
                    onChange={(event) =>
                      updateForm(
                        "displayOrder",
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none transition focus:border-violet-300/25"
                  />
                </label>

                <div className="flex items-end">
                  <label className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4">
                    <span className="text-xs text-white/45">
                      Produto ativo
                    </span>

                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) =>
                        updateForm(
                          "active",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 accent-violet-300"
                    />
                  </label>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-300/[0.08] bg-red-300/[0.035] px-4 py-3 text-xs text-red-100/70">
                  {error}
                </div>
              )}

              <div className="mt-7 flex justify-end gap-3 border-t border-white/[0.06] pt-5">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={saving}
                  className="h-11 rounded-xl border border-white/[0.07] px-5 text-xs text-white/40 transition hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-40"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Plus size={14} />
                  )}

                  {saving
                    ? "Criando..."
                    : "Criar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}