"use client";

import { secureFetch } from "@/lib/secureFetch";

import Link from "next/link";
import {
  Boxes,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  Loader2,
  Power,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

const API_URL = "/backend";

type Client = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
};

type DemoAccount = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  totalAccesses: number;
  lastAccessAt: string | null;
  recentAccesses: string[];
};

type EmptyDemoAccount = {
  configured: false;
};

function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(date);
}

export default function AdminSettingsPage() {
  const { text } =
    useLanguage();

  const [
    clients,
    setClients,
  ] = useState<Client[]>([]);

  const [
    demo,
    setDemo,
  ] =
    useState<DemoAccount | null>(
      null
    );

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState("");

  const [
    loadingDemo,
    setLoadingDemo,
  ] = useState(true);

  const [
    savingDemo,
    setSavingDemo,
  ] = useState(false);

  const [
    changingStatus,
    setChangingStatus,
  ] = useState(false);

  const [
    demoError,
    setDemoError,
  ] = useState("");

  const [
    demoSuccess,
    setDemoSuccess,
  ] = useState("");

  async function loadDemo() {
    try {
      setLoadingDemo(true);
      setDemoError("");

      const [
        clientsResponse,
        demoResponse,
      ] =
        await Promise.all([
          secureFetch(
            `${API_URL}/api/admin/clients`,
            {
              credentials:
                "include",
              cache:
                "no-store",
            }
          ),
          secureFetch(
            `${API_URL}/api/admin/demo-account`,
            {
              credentials:
                "include",
              cache:
                "no-store",
            }
          ),
        ]);

      if (
        !clientsResponse.ok ||
        !demoResponse.ok
      ) {
        throw new Error(
          text(
            "Não foi possível carregar a conta de demonstração.",
            "Could not load the demo account."
          )
        );
      }

      const clientData:
        Client[] =
        await clientsResponse.json();

      const demoData:
        | DemoAccount
        | EmptyDemoAccount =
        await demoResponse.json();

      setClients(
        clientData
      );

      if (
        "configured" in
          demoData &&
        demoData.configured ===
          false
      ) {
        setDemo(null);

        if (
          clientData.length >
          0
        ) {
          setSelectedUserId(
            String(
              clientData[0].id
            )
          );
        }

        return;
      }

      const current =
        demoData as DemoAccount;

      setDemo(
        current
      );

      setSelectedUserId(
        String(
          current.id
        )
      );
    } catch (caught) {
      setDemoError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível carregar a conta de demonstração.",
              "Could not load the demo account."
            )
      );
    } finally {
      setLoadingDemo(false);
    }
  }

  useEffect(() => {
    void loadDemo();
  }, []);

  async function saveDemoAccount() {
    if (!selectedUserId) {
      return;
    }

    try {
      setSavingDemo(true);
      setDemoError("");
      setDemoSuccess("");

      const response =
        await secureFetch(
          `${API_URL}/api/admin/demo-account`,
          {
            method: "PUT",
            credentials:
              "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              userId:
                Number(
                  selectedUserId
                ),
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          text(
            "Não foi possível definir a conta de demonstração.",
            "Could not set the demo account."
          )
        );
      }

      const updated:
        DemoAccount =
        await response.json();

      setDemo(updated);
      setDemoSuccess(
        text(
          "Conta de demonstração atualizada.",
          "Demo account updated."
        )
      );
    } catch (caught) {
      setDemoError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível salvar.",
              "Could not save."
            )
      );
    } finally {
      setSavingDemo(false);
    }
  }

  async function toggleDemoStatus() {
    if (!demo) {
      return;
    }

    try {
      setChangingStatus(true);
      setDemoError("");
      setDemoSuccess("");

      const response =
        await secureFetch(
          `${API_URL}/api/admin/demo-account/status`,
          {
            method: "PATCH",
            credentials:
              "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              active:
                !demo.active,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          text(
            "Não foi possível alterar o acesso da conta demo.",
            "Could not change demo account access."
          )
        );
      }

      const updated:
        DemoAccount =
        await response.json();

      setDemo(updated);

      setDemoSuccess(
        updated.active
          ? text(
              "Conta demo ativada.",
              "Demo account enabled."
            )
          : text(
              "Conta demo desativada. Novos logins estão bloqueados.",
              "Demo account disabled. New logins are blocked."
            )
      );
    } catch (caught) {
      setDemoError(
        caught instanceof Error
          ? caught.message
          : text(
              "Não foi possível alterar o acesso.",
              "Could not change access."
            )
      );
    } finally {
      setChangingStatus(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-violet-200/40">
          <Settings size={13} />
          {text(
            "Sistema",
            "System"
          )}
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          {text(
            "Configurações",
            "Settings"
          )}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
          {text(
            "Controles administrativos da Orbitta, incluindo a conta usada nas demonstrações.",
            "Orbitta administrative controls, including the account used for demos."
          )}
        </p>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <SettingsLink
          href="/admin/produtos"
          icon={Boxes}
          title={text(
            "Produtos e planos",
            "Products & plans"
          )}
          description={text(
            "Gerencie catálogo, planos, preços e disponibilidade dos produtos Orbitta.",
            "Manage the catalog, plans, pricing and product availability."
          )}
        />

        <SettingsLink
          href="/admin/clientes"
          icon={Users}
          title={text(
            "Clientes",
            "Clients"
          )}
          description={text(
            "Consulte clientes, status de acesso e produtos contratados.",
            "Review clients, access status and purchased products."
          )}
        />

        <SettingsLink
          href="/admin/faturas"
          icon={ShieldCheck}
          title={text(
            "Financeiro",
            "Billing"
          )}
          description={text(
            "Acompanhe faturas, vencimentos e cobranças.",
            "Track invoices, due dates and charges."
          )}
        />

        <SettingsLink
          href="/"
          icon={ExternalLink}
          title={text(
            "Site público",
            "Public website"
          )}
          description={text(
            "Abra a landing page principal da Orbitta.",
            "Open the main Orbitta landing page."
          )}
        />
      </section>

      <section className="mt-6 rounded-[28px] border border-violet-300/[0.08] bg-[#08101d] p-6 sm:p-7">
        <div className="flex flex-col gap-5 border-b border-white/[0.05] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-200/40">
              <Eye size={14} />
              {text(
                "Demonstração",
                "Demo"
              )}
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white/85">
              {text(
                "Conta de teste",
                "Demo account"
              )}
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-white/30">
              {text(
                "Somente a conta marcada aqui registra o histórico de logins para demonstração. Nenhum acesso das contas normais é listado nesta área.",
                "Only the account selected here records demo login history. Regular client account access is not listed here."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadDemo()
            }
            disabled={
              loadingDemo
            }
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-white/40 transition hover:text-white/70 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                loadingDemo
                  ? "animate-spin"
                  : ""
              }
            />
            {text(
              "Atualizar",
              "Refresh"
            )}
          </button>
        </div>

        {demoError && (
          <div className="mt-5 rounded-2xl border border-red-300/[0.08] bg-red-300/[0.035] px-4 py-3 text-xs text-red-100/70">
            {demoError}
          </div>
        )}

        {demoSuccess && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-300/[0.08] bg-emerald-300/[0.035] px-4 py-3 text-xs text-emerald-100/70">
            <CheckCircle2
              size={13}
            />
            {demoSuccess}
          </div>
        )}

        {loadingDemo ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <Loader2
              size={20}
              className="animate-spin text-violet-200/50"
            />
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <select
                value={
                  selectedUserId
                }
                onChange={(
                  event
                ) =>
                  setSelectedUserId(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-white/[0.07] bg-[#07101c] px-4 text-sm text-white/65 outline-none"
              >
                {clients.map(
                  (client) => (
                    <option
                      key={
                        client.id
                      }
                      value={
                        client.id
                      }
                    >
                      {client.firstName}{" "}
                      {client.lastName} —{" "}
                      {client.email}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={() =>
                  void saveDemoAccount()
                }
                disabled={
                  !selectedUserId ||
                  savingDemo
                }
                className="h-11 rounded-xl bg-white px-5 text-xs font-semibold text-[#07101c] disabled:opacity-50"
              >
                {savingDemo
                  ? text(
                      "Salvando...",
                      "Saving..."
                    )
                  : text(
                      "Definir como conta demo",
                      "Set as demo account"
                    )}
              </button>
            </div>

            {demo ? (
              <>
                <div className="mt-6 rounded-[24px] border border-white/[0.06] bg-white/[0.018] p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-300/[0.04] text-violet-200/60">
                        <UserRound
                          size={18}
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium text-white/80">
                            {demo.firstName}{" "}
                            {demo.lastName}
                          </h3>

                          <span
                            className={
                              demo.active
                                ? "rounded-full border border-emerald-300/10 bg-emerald-300/[0.05] px-2.5 py-1 text-[9px] text-emerald-100/70"
                                : "rounded-full border border-red-300/10 bg-red-300/[0.05] px-2.5 py-1 text-[9px] text-red-100/70"
                            }
                          >
                            {demo.active
                              ? text(
                                  "Ativa",
                                  "Active"
                                )
                              : text(
                                  "Desativada",
                                  "Disabled"
                                )}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-white/28">
                          {demo.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void toggleDemoStatus()
                      }
                      disabled={
                        changingStatus
                      }
                      className={
                        demo.active
                          ? "flex h-10 items-center justify-center gap-2 rounded-xl border border-red-300/10 bg-red-300/[0.035] px-4 text-xs text-red-100/60 transition hover:bg-red-300/[0.07] disabled:opacity-50"
                          : "flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.035] px-4 text-xs text-emerald-100/65 transition hover:bg-emerald-300/[0.07] disabled:opacity-50"
                      }
                    >
                      {changingStatus ? (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <Power
                          size={13}
                        />
                      )}

                      {demo.active
                        ? text(
                            "Desativar conta",
                            "Disable account"
                          )
                        : text(
                            "Ativar conta",
                            "Enable account"
                          )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.018] p-5">
                    <Eye
                      size={16}
                      className="text-violet-200/55"
                    />

                    <div className="mt-4 text-2xl font-semibold text-white/85">
                      {demo.totalAccesses}
                    </div>

                    <div className="mt-1 text-[10px] text-white/25">
                      {text(
                        "Logins registrados",
                        "Recorded logins"
                      )}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.018] p-5">
                    <Clock3
                      size={16}
                      className="text-cyan-200/55"
                    />

                    <div className="mt-4 text-sm font-medium text-white/70">
                      {formatDateTime(
                        demo.lastAccessAt
                      )}
                    </div>

                    <div className="mt-1 text-[10px] text-white/25">
                      {text(
                        "Último acesso",
                        "Last access"
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[22px] border border-white/[0.06]">
                  <div className="border-b border-white/[0.05] bg-white/[0.018] px-5 py-4">
                    <div className="text-xs font-medium text-white/60">
                      {text(
                        "Últimos acessos",
                        "Recent accesses"
                      )}
                    </div>
                  </div>

                  {demo.recentAccesses
                    .length ===
                  0 ? (
                    <div className="px-5 py-8 text-center text-xs text-white/25">
                      {text(
                        "Nenhum login registrado ainda.",
                        "No logins recorded yet."
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.045]">
                      {demo.recentAccesses.map(
                        (
                          accessedAt,
                          index
                        ) => (
                          <div
                            key={
                              `${accessedAt}-${index}`
                            }
                            className="flex items-center justify-between px-5 py-3"
                          >
                            <span className="text-xs text-white/45">
                              {formatDateTime(
                                accessedAt
                              )}
                            </span>

                            <span className="text-[9px] uppercase tracking-[0.12em] text-emerald-200/45">
                              login
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[22px] border border-dashed border-white/[0.08] px-5 py-8 text-center text-xs text-white/25">
                {text(
                  "Nenhuma conta de demonstração definida ainda. Escolha uma conta acima.",
                  "No demo account selected yet. Choose an account above."
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function SettingsLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-white/[0.06] bg-[#08101d] p-5 transition hover:border-violet-300/[0.12] hover:bg-[#091321]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/[0.08] bg-violet-300/[0.03] text-violet-200/50">
          <Icon size={17} />
        </div>

        <ExternalLink
          size={14}
          className="text-white/15 transition group-hover:text-violet-200/50"
        />
      </div>

      <h2 className="mt-5 text-sm font-medium text-white/80">
        {title}
      </h2>

      <p className="mt-2 text-xs leading-6 text-white/28">
        {description}
      </p>
    </Link>
  );
}
