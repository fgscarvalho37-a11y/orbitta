"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  Globe2,
  Loader2,
  Mail,
  Package,
  PackagePlus,
  Pencil,
  Phone,
  Power,
  ReceiptText,
  RefreshCw,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";

import EditClientProductModal, {
  EditableClientProduct,
} from "@/components/admin/EditClientProductModal";

import CreateClientProductModal, {
  CreatedClientProduct,
} from "@/components/admin/CreateClientProductModal";

const API_URL = "/backend";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
  createdAt: string;
};

type ClientProduct = {
  id: number;
  name: string;
  subtitle: string | null;
  planName: string;
  monthlyPrice: number;
  domain: string | null;
  systemUrl: string | null;
  status: string;
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type Invoice = {
  id: number;
  invoiceNumber: string;
  productId: number;
  productName: string;
  amount: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const dateOnly = value.split("T")[0];
  const [year, month, day] = dateOnly.split("-");

  if (!year || !month || !day) {
    return "—";
  }

  return `${day}/${month}/${year}`;
}

function productStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Ativo";
    case "INACTIVE":
      return "Inativo";
    case "SUSPENDED":
      return "Suspenso";
    default:
      return status;
  }
}

function invoiceStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "PAID":
      return "Paga";
    case "OVERDUE":
      return "Vencida";
    case "CANCELLED":
      return "Cancelada";
    default:
      return status;
  }
}

function invoiceStatusClass(status: string) {
  switch (status) {
    case "PAID":
      return "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200/70";

    case "OVERDUE":
      return "border-red-300/10 bg-red-300/[0.05] text-red-200/70";

    case "CANCELLED":
      return "border-white/[0.07] bg-white/[0.03] text-white/35";

    default:
      return "border-amber-300/10 bg-amber-300/[0.05] text-amber-200/70";
  }
}

export default function AdminClientDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const clientId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [client, setClient] = useState<Client | null>(
    null
  );

  const [products, setProducts] = useState<
    ClientProduct[]
  >([]);

  const [invoices, setInvoices] = useState<Invoice[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changingStatus, setChangingStatus] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [success, setSuccess] = useState<string | null>(
    null
  );

  const [editingProduct, setEditingProduct] =
    useState<ClientProduct | null>(null);

  const [creatingProduct, setCreatingProduct] =
    useState(false);

  async function loadData(isRefresh = false) {
    if (!clientId) {
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [
        clientResponse,
        productsResponse,
        invoicesResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/admin/clients/${clientId}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        ),

        fetch(
          `${API_URL}/api/admin/clients/${clientId}/products`,
          {
            credentials: "include",
            cache: "no-store",
          }
        ),

        fetch(
          `${API_URL}/api/admin/clients/${clientId}/invoices`,
          {
            credentials: "include",
            cache: "no-store",
          }
        ),
      ]);

      if (
        clientResponse.status === 401 ||
        clientResponse.status === 403 ||
        productsResponse.status === 401 ||
        productsResponse.status === 403 ||
        invoicesResponse.status === 401 ||
        invoicesResponse.status === 403
      ) {
        router.replace("/login");
        return;
      }

      if (clientResponse.status === 404) {
        setError("Cliente não encontrado.");
        setClient(null);
        return;
      }

      if (
        !clientResponse.ok ||
        !productsResponse.ok ||
        !invoicesResponse.ok
      ) {
        throw new Error(
          "Não foi possível carregar os dados do cliente."
        );
      }

      const [
        clientData,
        productsData,
        invoicesData,
      ] = await Promise.all([
        clientResponse.json(),
        productsResponse.json(),
        invoicesResponse.json(),
      ]);

      setClient(clientData);

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : []
      );

      setInvoices(
        Array.isArray(invoicesData)
          ? invoicesData
          : []
      );
    } catch (err) {
      console.error(
        "Erro ao carregar cliente:",
        err
      );

      setError(
        "Não foi possível carregar os dados do cliente."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleStatusChange() {
    if (!client || changingStatus) {
      return;
    }

    const nextStatus = !client.active;

    const confirmed = window.confirm(
      nextStatus
        ? `Deseja reativar a conta de ${client.firstName} ${client.lastName}?`
        : `Deseja desativar a conta de ${client.firstName} ${client.lastName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingStatus(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `${API_URL}/api/admin/clients/${client.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            active: nextStatus,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        router.replace("/login");
        return;
      }

      if (response.status === 404) {
        throw new Error(
          "Cliente não encontrado."
        );
      }

      if (!response.ok) {
        throw new Error(
          "Não foi possível alterar o status do cliente."
        );
      }

      const updatedClient: Client =
        await response.json();

      setClient(updatedClient);

      setSuccess(
        updatedClient.active
          ? "Cliente reativado com sucesso."
          : "Cliente desativado com sucesso."
      );

      window.setTimeout(() => {
        setSuccess(null);
      }, 3500);
    } catch (err) {
      console.error(
        "Erro ao alterar status:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar o status do cliente."
      );
    } finally {
      setChangingStatus(false);
    }
  }

  function handleProductSaved(
    updatedProduct: EditableClientProduct
  ) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === updatedProduct.id
          ? updatedProduct
          : product
      )
    );

    setSuccess("Produto atualizado com sucesso.");

    window.setTimeout(() => {
      setSuccess(null);
    }, 3500);
  }

  function handleProductCreated(
    createdProduct: CreatedClientProduct
  ) {
    setProducts((currentProducts) => [
      createdProduct,
      ...currentProducts,
    ]);

    setSuccess("Produto adicionado com sucesso.");

    window.setTimeout(() => {
      setSuccess(null);
    }, 3500);
  }

  useEffect(() => {
    loadData();
  }, [clientId]);

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) => product.status === "ACTIVE"
      ).length,
    [products]
  );

  const pendingInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.status === "PENDING" ||
          invoice.status === "OVERDUE"
      ),
    [invoices]
  );

  const pendingAmount = useMemo(
    () =>
      pendingInvoices.reduce(
        (total, invoice) =>
          total + Number(invoice.amount ?? 0),
        0
      ),
    [pendingInvoices]
  );

  const initials = client
    ? `${client.firstName?.charAt(0) ?? ""}${
        client.lastName?.charAt(0) ?? ""
      }`.toUpperCase()
    : "";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={22}
            className="animate-spin text-violet-300"
          />

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Carregando cliente
          </span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8 lg:px-10">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-2 text-xs text-white/35 transition hover:text-white/70"
        >
          <ArrowLeft size={14} />
          Voltar para clientes
        </Link>

        <div className="mt-8 rounded-[26px] border border-white/[0.06] bg-[#08101d] px-6 py-16 text-center">
          <UserRound
            size={28}
            className="mx-auto text-white/15"
          />

          <h1 className="mt-4 text-lg text-white/70">
            Cliente não encontrado
          </h1>

          <p className="mt-2 text-xs text-white/25">
            {error ??
              "Não encontramos esse cliente."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-2 text-xs text-white/35 transition hover:text-white/70"
        >
          <ArrowLeft size={14} />
          Clientes
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleStatusChange}
            disabled={changingStatus}
            className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
              client.active
                ? "border-red-300/[0.10] bg-red-300/[0.035] text-red-200/55 hover:border-red-300/20 hover:bg-red-300/[0.07] hover:text-red-100"
                : "border-emerald-300/[0.10] bg-emerald-300/[0.035] text-emerald-200/60 hover:border-emerald-300/20 hover:bg-emerald-300/[0.07] hover:text-emerald-100"
            }`}
          >
            {changingStatus ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Power size={14} />
            )}

            {changingStatus
              ? "Alterando..."
              : client.active
                ? "Desativar cliente"
                : "Reativar cliente"}
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || changingStatus}
            className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/40 transition hover:bg-white/[0.05] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.03] px-5 py-4 text-xs text-red-200/70">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-300/[0.08] bg-emerald-300/[0.03] px-5 py-4 text-xs text-emerald-200/70">
          <CheckCircle2 size={14} />
          {success}
        </div>
      )}

      <header
        className={`mt-7 rounded-[28px] border p-6 sm:p-7 ${
          client.active
            ? "border-white/[0.06] bg-[#08101d]"
            : "border-red-300/[0.07] bg-[#08101d]"
        }`}
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                client.active
                  ? "bg-gradient-to-br from-violet-300 to-cyan-300 text-[#07101c]"
                  : "bg-white/[0.05] text-white/35"
              }`}
            >
              {initials || "CL"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                  {client.firstName}{" "}
                  {client.lastName}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] ${
                    client.active
                      ? "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200/70"
                      : "border-red-300/10 bg-red-300/[0.05] text-red-200/70"
                  }`}
                >
                  {client.active ? (
                    <CheckCircle2 size={10} />
                  ) : (
                    <XCircle size={10} />
                  )}

                  {client.active
                    ? "Ativo"
                    : "Inativo"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/30">
                <span className="flex items-center gap-2">
                  <Mail size={12} />
                  {client.email}
                </span>

                <span className="flex items-center gap-2">
                  <Phone size={12} />
                  {client.phone || "Sem telefone"}
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays size={12} />
                  Cliente desde{" "}
                  {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left xl:text-right">
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/20">
              Identificação
            </div>

            <div className="mt-2 font-mono text-xs text-white/45">
              CLIENT-
              {String(client.id).padStart(4, "0")}
            </div>
          </div>
        </div>
      </header>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-white/[0.06] bg-[#08101d] p-5">
          <Package
            size={17}
            className="text-violet-300/60"
          />

          <div className="mt-5 text-2xl font-semibold text-white/85">
            {products.length}
          </div>

          <div className="mt-1 text-[10px] text-white/25">
            Produtos vinculados
          </div>
        </div>

        <div className="rounded-[22px] border border-emerald-300/[0.06] bg-[#08101d] p-5">
          <CheckCircle2
            size={17}
            className="text-emerald-300/60"
          />

          <div className="mt-5 text-2xl font-semibold text-emerald-100/80">
            {activeProducts}
          </div>

          <div className="mt-1 text-[10px] text-white/25">
            Produtos ativos
          </div>
        </div>

        <div className="rounded-[22px] border border-amber-300/[0.06] bg-[#08101d] p-5">
          <ReceiptText
            size={17}
            className="text-amber-300/60"
          />

          <div className="mt-5 text-2xl font-semibold text-white/85">
            {pendingInvoices.length}
          </div>

          <div className="mt-1 text-[10px] text-white/25">
            Faturas em aberto
          </div>
        </div>

        <div className="rounded-[22px] border border-violet-300/[0.06] bg-[#08101d] p-5">
          <CircleDollarSign
            size={17}
            className="text-violet-300/60"
          />

          <div className="mt-5 text-2xl font-semibold text-white/85">
            {formatMoney(pendingAmount)}
          </div>

          <div className="mt-1 text-[10px] text-white/25">
            Valor em aberto
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[26px] border border-white/[0.06] bg-[#08101d]">
        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <WalletCards
                size={15}
                className="text-violet-300/60"
              />

              <h2 className="text-sm font-medium text-white/80">
                Produtos
              </h2>
            </div>

            <p className="mt-1.5 text-[10px] text-white/25">
              Sistemas vinculados a este cliente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreatingProduct(true)}
            disabled={!client.active}
            title={
              client.active
                ? "Adicionar produto"
                : "Reative o cliente para adicionar produtos"
            }
            className="flex h-9 items-center gap-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.06] px-3.5 text-[10px] text-violet-100/70 transition hover:bg-violet-300/[0.11] hover:text-violet-100 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <PackagePlus size={13} />
            Adicionar produto
          </button>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-14 text-center text-xs text-white/25">
            Nenhum produto vinculado.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.045]">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-300/[0.05]">
                      <Package
                        size={15}
                        className="text-violet-200/60"
                      />
                    </div>

                    <div>
                      <div className="text-sm text-white/75">
                        {product.name}
                      </div>

                      <div className="mt-1 text-[10px] text-white/25">
                        {product.subtitle ||
                          "Produto Orbitta"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                    Plano
                  </div>

                  <div className="mt-1.5 text-xs text-white/50">
                    {product.planName} ·{" "}
                    {formatMoney(
                      Number(product.monthlyPrice)
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                    Renovação
                  </div>

                  <div className="mt-1.5 text-xs text-white/50">
                    {formatDate(
                      product.renewalDate
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:justify-end">
                  <span
                    className={`rounded-full border px-2.5 py-1.5 text-[9px] ${
                      product.status === "ACTIVE"
                        ? "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200/70"
                        : product.status ===
                            "SUSPENDED"
                          ? "border-amber-300/10 bg-amber-300/[0.05] text-amber-200/70"
                          : "border-white/[0.07] bg-white/[0.03] text-white/35"
                    }`}
                  >
                    {productStatusLabel(
                      product.status
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => setEditingProduct(product)}
                    title="Editar produto"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/25 transition hover:border-violet-300/15 hover:bg-violet-300/[0.05] hover:text-violet-200/70"
                  >
                    <Pencil size={13} />
                  </button>

                  {product.domain && (
                    <a
                      href={`https://${product.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      title={product.domain}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/25 transition hover:bg-white/[0.04] hover:text-white/60"
                    >
                      <Globe2 size={13} />
                    </a>
                  )}

                  {product.systemUrl && (
                    <a
                      href={product.systemUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Abrir sistema"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/25 transition hover:bg-white/[0.04] hover:text-white/60"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]">
        <div className="border-b border-white/[0.05] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <ReceiptText
              size={15}
              className="text-violet-300/60"
            />

            <h2 className="text-sm font-medium text-white/80">
              Faturas
            </h2>
          </div>

          <p className="mt-1.5 text-[10px] text-white/25">
            Histórico financeiro deste cliente.
          </p>
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-14 text-center text-xs text-white/25">
            Nenhuma fatura encontrada.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.045]">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-center"
              >
                <div>
                  <div className="font-mono text-xs text-white/60">
                    {invoice.invoiceNumber}
                  </div>

                  <div className="mt-1.5 text-[10px] text-white/25">
                    {invoice.productName}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                    Valor
                  </div>

                  <div className="mt-1.5 text-xs text-white/60">
                    {formatMoney(
                      Number(invoice.amount)
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                    Vencimento
                  </div>

                  <div className="mt-1.5 text-xs text-white/45">
                    {formatDate(invoice.dueDate)}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                    Pagamento
                  </div>

                  <div className="mt-1.5 text-xs text-white/45">
                    {invoice.paidAt
                      ? formatDate(invoice.paidAt)
                      : "—"}
                  </div>
                </div>

                <div className="lg:text-right">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1.5 text-[9px] ${invoiceStatusClass(
                      invoice.status
                    )}`}
                  >
                    {invoiceStatusLabel(
                      invoice.status
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <CreateClientProductModal
        open={creatingProduct}
        clientId={client.id}
        onClose={() => setCreatingProduct(false)}
        onCreated={handleProductCreated}
      />

      <EditClientProductModal
        open={editingProduct !== null}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaved={handleProductSaved}
      />
    </div>
  );
}