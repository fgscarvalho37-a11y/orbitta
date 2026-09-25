"use client";

import {
  Boxes,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Edit3,
  Loader2,
  PackagePlus,
  Plus,
  Power,
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

type PlanForm = {
  name: string;
  slug: string;
  description: string;
  monthlyPrice: string;
  setupPrice: string;
  currency: string;
  active: boolean;
  displayOrder: string;
};

const initialProductForm: ProductForm = {
  name: "",
  slug: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  landingPageUrl: "",
  active: true,
  displayOrder: "0",
};

const initialPlanForm: PlanForm = {
  name: "",
  slug: "",
  description: "",
  monthlyPrice: "",
  setupPrice: "0",
  currency: "BRL",
  active: true,
  displayOrder: "0",
};

function generateSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseMoney(value: string) {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");

  const number = Number(normalized);

  return Number.isFinite(number) ? number : NaN;
}

function formatMoney(
  value: number,
  currency = "BRL"
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<
    CatalogProduct[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [success, setSuccess] = useState<
    string | null
  >(null);

  const [expandedProducts, setExpandedProducts] =
    useState<number[]>([]);

  const [productModalOpen, setProductModalOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<CatalogProduct | null>(null);

  const [productForm, setProductForm] =
    useState<ProductForm>(initialProductForm);

  const [planModalOpen, setPlanModalOpen] =
    useState(false);

  const [planProduct, setPlanProduct] =
    useState<CatalogProduct | null>(null);

  const [editingPlan, setEditingPlan] =
    useState<CatalogPlan | null>(null);

  const [planForm, setPlanForm] =
    useState<PlanForm>(initialPlanForm);

  const [saving, setSaving] = useState(false);

  const [changingStatus, setChangingStatus] =
    useState<string | null>(null);

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

  function showSuccess(message: string) {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess(null);
    }, 3500);
  }

  function toggleExpanded(productId: number) {
    setExpandedProducts((current) =>
      current.includes(productId)
        ? current.filter(
            (id) => id !== productId
          )
        : [...current, productId]
    );
  }

  function updateProductForm<
    K extends keyof ProductForm
  >(field: K, value: ProductForm[K]) {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updatePlanForm<
    K extends keyof PlanForm
  >(field: K, value: PlanForm[K]) {
    setPlanForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateProduct() {
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setError(null);
    setProductModalOpen(true);
  }

  function openEditProduct(
    product: CatalogProduct
  ) {
    setEditingProduct(product);

    setProductForm({
      name: product.name,
      slug: product.slug,
      subtitle: product.subtitle ?? "",
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
      landingPageUrl:
        product.landingPageUrl ?? "",
      active: product.active,
      displayOrder: String(
        product.displayOrder
      ),
    });

    setError(null);
    setProductModalOpen(true);
  }

  function closeProductModal() {
    if (saving) {
      return;
    }

    setProductModalOpen(false);
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setError(null);
  }

  function handleProductNameChange(
    value: string
  ) {
    setProductForm((current) => ({
      ...current,
      name: value,
      slug: editingProduct
        ? current.slug
        : generateSlug(value),
    }));
  }

  async function saveProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!productForm.name.trim()) {
      setError(
        "Informe o nome do produto."
      );
      return;
    }

    if (!productForm.slug.trim()) {
      setError(
        "Informe o slug do produto."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: productForm.name.trim(),
        slug: productForm.slug.trim(),
        subtitle:
          productForm.subtitle.trim() ||
          null,
        description:
          productForm.description.trim() ||
          null,
        imageUrl:
          productForm.imageUrl.trim() ||
          null,
        landingPageUrl:
          productForm.landingPageUrl.trim() ||
          null,
        active: productForm.active,
        displayOrder:
          Number(
            productForm.displayOrder
          ) || 0,
      };

      const editing = Boolean(
        editingProduct
      );

      const url = editingProduct
        ? `${API_URL}/api/admin/catalog/products/${editingProduct.id}`
        : `${API_URL}/api/admin/catalog/products`;

      const response = await fetch(url, {
        method: editingProduct
          ? "PUT"
          : "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            editing
              ? "Não foi possível atualizar o produto."
              : "Não foi possível criar o produto."
          )
        );
      }

      setProductModalOpen(false);
      setEditingProduct(null);
      setProductForm(initialProductForm);

      await loadProducts(true);

      showSuccess(
        editing
          ? "Produto atualizado."
          : "Produto criado."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o produto."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleProductStatus(
    product: CatalogProduct
  ) {
    const key = `product-${product.id}`;

    try {
      setChangingStatus(key);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/admin/catalog/products/${product.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: product.name,
            slug: product.slug,
            subtitle: product.subtitle,
            description:
              product.description,
            imageUrl: product.imageUrl,
            landingPageUrl:
              product.landingPageUrl,
            active: !product.active,
            displayOrder:
              product.displayOrder,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Não foi possível alterar o status do produto."
          )
        );
      }

      await loadProducts(true);

      showSuccess(
        product.active
          ? "Produto desativado."
          : "Produto ativado."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar o produto."
      );
    } finally {
      setChangingStatus(null);
    }
  }

  function openCreatePlan(
    product: CatalogProduct
  ) {
    setPlanProduct(product);
    setEditingPlan(null);
    setPlanForm(initialPlanForm);
    setError(null);
    setPlanModalOpen(true);
  }

  function openEditPlan(
    product: CatalogProduct,
    plan: CatalogPlan
  ) {
    setPlanProduct(product);
    setEditingPlan(plan);

    setPlanForm({
      name: plan.name,
      slug: plan.slug,
      description:
        plan.description ?? "",
      monthlyPrice: String(
        plan.monthlyPrice
      ).replace(".", ","),
      setupPrice: String(
        plan.setupPrice
      ).replace(".", ","),
      currency: plan.currency,
      active: plan.active,
      displayOrder: String(
        plan.displayOrder
      ),
    });

    setError(null);
    setPlanModalOpen(true);
  }

  function closePlanModal() {
    if (saving) {
      return;
    }

    setPlanModalOpen(false);
    setPlanProduct(null);
    setEditingPlan(null);
    setPlanForm(initialPlanForm);
    setError(null);
  }

  function handlePlanNameChange(
    value: string
  ) {
    setPlanForm((current) => ({
      ...current,
      name: value,
      slug: editingPlan
        ? current.slug
        : generateSlug(value),
    }));
  }

  async function savePlan(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!planProduct) {
      return;
    }

    if (!planForm.name.trim()) {
      setError("Informe o nome do plano.");
      return;
    }

    if (!planForm.slug.trim()) {
      setError("Informe o slug do plano.");
      return;
    }

    const monthlyPrice = parseMoney(
      planForm.monthlyPrice
    );

    const setupPrice = parseMoney(
      planForm.setupPrice || "0"
    );

    if (
      Number.isNaN(monthlyPrice) ||
      monthlyPrice < 0
    ) {
      setError(
        "Informe um valor mensal válido."
      );
      return;
    }

    if (
      Number.isNaN(setupPrice) ||
      setupPrice < 0
    ) {
      setError(
        "Informe uma taxa inicial válida."
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const editing = Boolean(
        editingPlan
      );

      const payload = editingPlan
        ? {
            name: planForm.name.trim(),
            slug: planForm.slug.trim(),
            description:
              planForm.description.trim() ||
              null,
            monthlyPrice,
            setupPrice,
            currency:
              planForm.currency
                .trim()
                .toUpperCase(),
            active: planForm.active,
            displayOrder:
              Number(
                planForm.displayOrder
              ) || 0,
          }
        : {
            productId: planProduct.id,
            name: planForm.name.trim(),
            slug: planForm.slug.trim(),
            description:
              planForm.description.trim() ||
              null,
            monthlyPrice,
            setupPrice,
            currency:
              planForm.currency
                .trim()
                .toUpperCase(),
            active: planForm.active,
            displayOrder:
              Number(
                planForm.displayOrder
              ) || 0,
          };

      const url = editingPlan
        ? `${API_URL}/api/admin/catalog/plans/${editingPlan.id}`
        : `${API_URL}/api/admin/catalog/plans`;

      const response = await fetch(url, {
        method: editingPlan
          ? "PUT"
          : "POST",
        credentials: "include",
        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            editing
              ? "Não foi possível atualizar o plano."
              : "Não foi possível criar o plano."
          )
        );
      }

      setPlanModalOpen(false);
      setPlanProduct(null);
      setEditingPlan(null);
      setPlanForm(initialPlanForm);

      await loadProducts(true);

      showSuccess(
        editing
          ? "Plano atualizado."
          : "Plano criado."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o plano."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePlanStatus(
    plan: CatalogPlan
  ) {
    const key = `plan-${plan.id}`;

    try {
      setChangingStatus(key);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/admin/catalog/plans/${plan.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: plan.name,
            slug: plan.slug,
            description: plan.description,
            monthlyPrice:
              plan.monthlyPrice,
            setupPrice: plan.setupPrice,
            currency: plan.currency,
            active: !plan.active,
            displayOrder:
              plan.displayOrder,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Não foi possível alterar o status do plano."
          )
        );
      }

      await loadProducts(true);

      showSuccess(
        plan.active
          ? "Plano desativado."
          : "Plano ativado."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar o plano."
      );
    } finally {
      setChangingStatus(null);
    }
  }

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
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
              onClick={() =>
                loadProducts(true)
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
              Atualizar
            </button>

            <button
              type="button"
              onClick={openCreateProduct}
              className="flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50"
            >
              <Plus size={15} />
              Novo produto
            </button>
          </div>
        </div>

        {success && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-5 py-4 text-xs text-emerald-100/70">
            <Check size={15} />
            {success}
          </div>
        )}

        {error &&
          !productModalOpen &&
          !planModalOpen && (
            <div className="mt-6 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-5 py-4 text-xs text-red-100/70">
              {error}
            </div>
          )}

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
              Orbitta e configure seus planos.
            </p>

            <button
              type="button"
              onClick={openCreateProduct}
              className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c]"
            >
              <Plus size={15} />
              Criar primeiro produto
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {products.map((product) => {
              const expanded =
                expandedProducts.includes(
                  product.id
                );

              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]"
                >
                  <div className="p-6">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white/85">
                            {product.name}
                          </h2>

                          <StatusBadge
                            active={
                              product.active
                            }
                          />
                        </div>

                        <div className="mt-2 text-xs text-violet-200/35">
                          /{product.slug}
                        </div>

                        {product.subtitle && (
                          <p className="mt-3 text-sm text-white/35">
                            {
                              product.subtitle
                            }
                          </p>
                        )}

                        {product.description && (
                          <p className="mt-2 max-w-2xl text-xs leading-6 text-white/20">
                            {
                              product.description
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditProduct(
                              product
                            )
                          }
                          className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] px-3.5 text-xs text-white/40 transition hover:bg-white/[0.04] hover:text-white/70"
                        >
                          <Edit3 size={14} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleProductStatus(
                              product
                            )
                          }
                          disabled={
                            changingStatus ===
                            `product-${product.id}`
                          }
                          className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] px-3.5 text-xs text-white/40 transition hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-40"
                        >
                          {changingStatus ===
                          `product-${product.id}` ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Power
                              size={14}
                            />
                          )}

                          {product.active
                            ? "Desativar"
                            : "Ativar"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openCreatePlan(
                              product
                            )
                          }
                          className="flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-semibold text-[#07101c] transition hover:bg-violet-50"
                        >
                          <Plus size={14} />
                          Adicionar plano
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleExpanded(
                          product.id
                        )
                      }
                      className="mt-6 flex w-full items-center justify-between rounded-2xl border border-white/[0.055] bg-white/[0.018] px-4 py-3 text-left transition hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <CircleDollarSign
                          size={16}
                          className="text-violet-200/45"
                        />

                        <div>
                          <div className="text-xs text-white/55">
                            Planos
                          </div>

                          <div className="mt-0.5 text-[10px] text-white/20">
                            {
                              product.plans
                                .length
                            }{" "}
                            {product.plans
                              .length === 1
                              ? "plano configurado"
                              : "planos configurados"}
                          </div>
                        </div>
                      </div>

                      {expanded ? (
                        <ChevronUp
                          size={16}
                          className="text-white/25"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-white/25"
                        />
                      )}
                    </button>
                  </div>

                  {expanded && (
                    <div className="border-t border-white/[0.05] bg-black/[0.08] p-6">
                      {product.plans
                        .length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/[0.07] px-5 py-8 text-center">
                          <p className="text-xs text-white/25">
                            Nenhum plano
                            configurado para este
                            produto.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              openCreatePlan(
                                product
                              )
                            }
                            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-violet-300/[0.1] bg-violet-300/[0.035] px-4 text-xs text-violet-100/60 transition hover:bg-violet-300/[0.07]"
                          >
                            <Plus size={14} />
                            Criar plano
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                          {product.plans.map(
                            (plan) => (
                              <div
                                key={
                                  plan.id
                                }
                                className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="text-sm font-medium text-white/75">
                                        {
                                          plan.name
                                        }
                                      </h3>

                                      <StatusBadge
                                        active={
                                          plan.active
                                        }
                                        small
                                      />
                                    </div>

                                    <div className="mt-1 text-[10px] text-white/20">
                                      /
                                      {
                                        plan.slug
                                      }
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditPlan(
                                        product,
                                        plan
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/25 transition hover:bg-white/[0.04] hover:text-white/60"
                                    title="Editar plano"
                                  >
                                    <Edit3
                                      size={
                                        13
                                      }
                                    />
                                  </button>
                                </div>

                                {plan.description && (
                                  <p className="mt-4 text-xs leading-5 text-white/25">
                                    {
                                      plan.description
                                    }
                                  </p>
                                )}

                                <div className="mt-5">
                                  <div>
                                    <span className="text-2xl font-semibold tracking-[-0.03em] text-white/85">
                                      {formatMoney(
                                        Number(
                                          plan.monthlyPrice
                                        ),
                                        plan.currency
                                      )}
                                    </span>

                                    <span className="ml-1 text-[10px] text-white/25">
                                      /mês
                                    </span>
                                  </div>

                                  {Number(
                                    plan.setupPrice
                                  ) > 0 && (
                                    <div className="mt-1 text-[10px] text-white/25">
                                      +
                                      {" "}
                                      {formatMoney(
                                        Number(
                                          plan.setupPrice
                                        ),
                                        plan.currency
                                      )}{" "}
                                      de taxa
                                      inicial
                                    </div>
                                  )}
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">
                                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/15">
                                    Ordem{" "}
                                    {
                                      plan.displayOrder
                                    }
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      togglePlanStatus(
                                        plan
                                      )
                                    }
                                    disabled={
                                      changingStatus ===
                                      `plan-${plan.id}`
                                    }
                                    className="flex items-center gap-2 text-[10px] text-white/30 transition hover:text-white/60 disabled:opacity-40"
                                  >
                                    {changingStatus ===
                                    `plan-${plan.id}` ? (
                                      <Loader2
                                        size={
                                          12
                                        }
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Power
                                        size={
                                          12
                                        }
                                      />
                                    )}

                                    {plan.active
                                      ? "Desativar"
                                      : "Ativar"}
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {productModalOpen && (
        <ModalShell
          title={
            editingProduct
              ? "Editar produto"
              : "Novo produto"
          }
          subtitle={
            editingProduct
              ? "Atualize as informações do produto."
              : "Cadastre um produto no catálogo da Orbitta."
          }
          onClose={closeProductModal}
          saving={saving}
        >
          <form onSubmit={saveProduct}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome">
                <input
                  value={productForm.name}
                  onChange={(event) =>
                    handleProductNameChange(
                      event.target.value
                    )
                  }
                  placeholder="PizzaSystem"
                  className={inputClass}
                />
              </Field>

              <Field label="Slug">
                <input
                  value={productForm.slug}
                  onChange={(event) =>
                    updateProductForm(
                      "slug",
                      generateSlug(
                        event.target.value
                      )
                    )
                  }
                  placeholder="pizzasystem"
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Subtítulo">
                  <input
                    value={
                      productForm.subtitle
                    }
                    onChange={(event) =>
                      updateProductForm(
                        "subtitle",
                        event.target.value
                      )
                    }
                    placeholder="Sistema completo para pizzarias"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Descrição">
                  <textarea
                    value={
                      productForm.description
                    }
                    onChange={(event) =>
                      updateProductForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Descrição comercial do produto..."
                    className={`${inputClass} h-auto resize-none py-3 leading-6`}
                  />
                </Field>
              </div>

              <Field label="URL da imagem">
                <input
                  value={
                    productForm.imageUrl
                  }
                  onChange={(event) =>
                    updateProductForm(
                      "imageUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
              </Field>

              <Field label="Landing page">
                <input
                  value={
                    productForm.landingPageUrl
                  }
                  onChange={(event) =>
                    updateProductForm(
                      "landingPageUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://..."
                  className={inputClass}
                />
              </Field>

              <Field label="Ordem">
                <input
                  type="number"
                  min="0"
                  value={
                    productForm.displayOrder
                  }
                  onChange={(event) =>
                    updateProductForm(
                      "displayOrder",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <ActiveField
                label="Produto ativo"
                checked={
                  productForm.active
                }
                onChange={(value) =>
                  updateProductForm(
                    "active",
                    value
                  )
                }
              />
            </div>

            {error && (
              <ModalError message={error} />
            )}

            <ModalActions
              saving={saving}
              editing={Boolean(
                editingProduct
              )}
              entity="produto"
              onCancel={closeProductModal}
            />
          </form>
        </ModalShell>
      )}

      {planModalOpen && planProduct && (
        <ModalShell
          title={
            editingPlan
              ? "Editar plano"
              : "Novo plano"
          }
          subtitle={`${planProduct.name} • configure livremente este plano.`}
          onClose={closePlanModal}
          saving={saving}
        >
          <form onSubmit={savePlan}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nome do plano">
                <input
                  value={planForm.name}
                  onChange={(event) =>
                    handlePlanNameChange(
                      event.target.value
                    )
                  }
                  placeholder="Ex: Essencial"
                  className={inputClass}
                />
              </Field>

              <Field label="Slug">
                <input
                  value={planForm.slug}
                  onChange={(event) =>
                    updatePlanForm(
                      "slug",
                      generateSlug(
                        event.target.value
                      )
                    )
                  }
                  placeholder="essencial"
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Descrição">
                  <textarea
                    value={
                      planForm.description
                    }
                    onChange={(event) =>
                      updatePlanForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="O que este plano oferece..."
                    className={`${inputClass} h-auto resize-none py-3 leading-6`}
                  />
                </Field>
              </div>

              <Field label="Valor mensal">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/25">
                    R$
                  </span>

                  <input
                    inputMode="decimal"
                    value={
                      planForm.monthlyPrice
                    }
                    onChange={(event) =>
                      updatePlanForm(
                        "monthlyPrice",
                        event.target.value
                      )
                    }
                    placeholder="79,90"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </Field>

              <Field label="Taxa inicial">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/25">
                    R$
                  </span>

                  <input
                    inputMode="decimal"
                    value={
                      planForm.setupPrice
                    }
                    onChange={(event) =>
                      updatePlanForm(
                        "setupPrice",
                        event.target.value
                      )
                    }
                    placeholder="0,00"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </Field>

              <Field label="Moeda">
                <input
                  value={
                    planForm.currency
                  }
                  maxLength={3}
                  onChange={(event) =>
                    updatePlanForm(
                      "currency",
                      event.target.value
                        .toUpperCase()
                        .slice(0, 3)
                    )
                  }
                  placeholder="BRL"
                  className={inputClass}
                />
              </Field>

              <Field label="Ordem">
                <input
                  type="number"
                  min="0"
                  value={
                    planForm.displayOrder
                  }
                  onChange={(event) =>
                    updatePlanForm(
                      "displayOrder",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <ActiveField
                  label="Plano disponível para contratação"
                  checked={
                    planForm.active
                  }
                  onChange={(value) =>
                    updatePlanForm(
                      "active",
                      value
                    )
                  }
                />
              </div>
            </div>

            {error && (
              <ModalError message={error} />
            )}

            <ModalActions
              saving={saving}
              editing={Boolean(editingPlan)}
              entity="plano"
              onCancel={closePlanModal}
            />
          </form>
        </ModalShell>
      )}
    </div>
  );
}

async function getErrorMessage(
  response: Response,
  fallback: string
) {
  try {
    const data = await response.json();

    if (
      data &&
      typeof data.message === "string" &&
      data.message.trim()
    ) {
      return data.message;
    }

    if (
      data &&
      typeof data.error === "string" &&
      data.error.trim()
    ) {
      return data.error;
    }
  } catch {
    // resposta sem JSON
  }

  return fallback;
}

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-white/15 focus:border-violet-300/25";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
        {label}
      </span>

      {children}
    </label>
  );
}

function ActiveField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-end">
      <label className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4">
        <span className="text-xs text-white/45">
          {label}
        </span>

        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          className="h-4 w-4 accent-violet-300"
        />
      </label>
    </div>
  );
}

function StatusBadge({
  active,
  small = false,
}: {
  active: boolean;
  small?: boolean;
}) {
  return (
    <span
      className={`rounded-full border uppercase tracking-[0.14em] ${
        small
          ? "px-2 py-0.5 text-[8px]"
          : "px-2.5 py-1 text-[9px]"
      } ${
        active
          ? "border-emerald-300/[0.12] bg-emerald-300/[0.04] text-emerald-200/60"
          : "border-white/[0.07] bg-white/[0.025] text-white/25"
      }`}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
  saving,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/[0.08] bg-[#08101d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">
              {title}
            </h2>

            <p className="mt-1 text-xs text-white/25">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-white/30 transition hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalError({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-5 rounded-xl border border-red-300/[0.08] bg-red-300/[0.035] px-4 py-3 text-xs text-red-100/70">
      {message}
    </div>
  );
}

function ModalActions({
  saving,
  editing,
  entity,
  onCancel,
}: {
  saving: boolean;
  editing: boolean;
  entity: "produto" | "plano";
  onCancel: () => void;
}) {
  return (
    <div className="mt-7 flex justify-end gap-3 border-t border-white/[0.06] pt-5">
      <button
        type="button"
        onClick={onCancel}
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
        ) : editing ? (
          <Check size={14} />
        ) : (
          <Plus size={14} />
        )}

        {saving
          ? "Salvando..."
          : editing
            ? `Salvar ${entity}`
            : `Criar ${entity}`}
      </button>
    </div>
  );
}