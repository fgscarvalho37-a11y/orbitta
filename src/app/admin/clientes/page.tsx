"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

const API_URL = "/backend";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: "CLIENT";
  active: boolean;
  createdAt: string;
};

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(client: Client) {
  const first =
    client.firstName?.trim().charAt(0) ?? "";

  const last =
    client.lastName?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "CL";
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(
    null
  );

  async function loadClients(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await fetch(
        `${API_URL}/api/admin/clients`,
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
        response.status === 401 ||
        response.status === 403
      ) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar clientes: ${response.status}`
        );
      }

      const data = await response.json();

      setClients(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Erro ao carregar clientes:",
        err
      );

      setError(
        "Não foi possível carregar os clientes."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) => {
      const fullName =
        `${client.firstName} ${client.lastName}`.toLowerCase();

      return (
        fullName.includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (client.phone ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [clients, search]);

  const activeClients = useMemo(
    () =>
      clients.filter(
        (client) => client.active
      ).length,
    [clients]
  );

  const inactiveClients =
    clients.length - activeClients;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={22}
            className="animate-spin text-violet-300"
          />

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Carregando clientes
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-violet-200/40">
            <Users size={13} />
            Administração
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            Clientes
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/30">
            Visualize as contas cadastradas na
            plataforma Orbitta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadClients(true)}
          disabled={refreshing}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
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
      </header>

      {error && (
        <div className="mt-7 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.03] px-5 py-4 text-xs text-red-200/70">
          {error}
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-white/[0.06] bg-[#08101d] p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/25">
            Total
          </div>

          <div className="mt-3 text-2xl font-semibold text-white/85">
            {clients.length}
          </div>
        </div>

        <div className="rounded-[22px] border border-emerald-300/[0.06] bg-[#08101d] p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/35">
            Ativos
          </div>

          <div className="mt-3 text-2xl font-semibold text-emerald-100/80">
            {activeClients}
          </div>
        </div>

        <div className="rounded-[22px] border border-white/[0.06] bg-[#08101d] p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/25">
            Inativos
          </div>

          <div className="mt-3 text-2xl font-semibold text-white/60">
            {inactiveClients}
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]">
        <div className="flex flex-col gap-4 border-b border-white/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white/80">
              Contas cadastradas
            </h2>

            <p className="mt-1 text-[10px] text-white/25">
              {filteredClients.length} cliente
              {filteredClients.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <div className="relative w-full sm:w-[320px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar cliente..."
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-9 pr-4 text-xs text-white/70 outline-none transition placeholder:text-white/20 focus:border-violet-300/20"
            />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <UserRound
              size={24}
              className="mx-auto text-white/15"
            />

            <p className="mt-4 text-xs text-white/25">
              Nenhum cliente encontrado.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.045]">
            {filteredClients.map(
              (client) => (
                <Link
                  key={client.id}
                  href={`/admin/clientes/${client.id}`}
                  className="group grid gap-5 px-5 py-5 transition hover:bg-white/[0.025] lg:grid-cols-[1.3fr_1.4fr_1fr_0.7fr] lg:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-cyan-300 text-[11px] font-bold text-[#07101c]">
                      {getInitials(client)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm text-white/75 transition group-hover:text-white">
                          {client.firstName}{" "}
                          {client.lastName}
                        </div>

                        <ChevronRight
                          size={13}
                          className="shrink-0 -translate-x-1 text-white/0 transition group-hover:translate-x-0 group-hover:text-violet-200/50"
                        />
                      </div>

                      <div className="mt-1 text-[9px] text-white/20">
                        Cliente #{client.id}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-white/35">
                      <Mail size={12} />

                      <span className="truncate">
                        {client.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-white/25">
                      <Phone size={12} />

                      <span>
                        {client.phone ||
                          "Sem telefone"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                      Cadastro
                    </div>

                    <div className="mt-1.5 text-xs text-white/45">
                      {formatDate(
                        client.createdAt
                      )}
                    </div>
                  </div>

                  <div className="lg:text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] ${
                        client.active
                          ? "border-emerald-300/10 bg-emerald-300/[0.05] text-emerald-200/70"
                          : "border-red-300/10 bg-red-300/[0.05] text-red-200/70"
                      }`}
                    >
                      {client.active ? (
                        <CheckCircle2
                          size={11}
                        />
                      ) : (
                        <XCircle
                          size={11}
                        />
                      )}

                      {client.active
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}