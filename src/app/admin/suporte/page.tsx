"use client";

import {
  CircleHelp,
  Clock3,
  Loader2,
  Mail,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const API_URL = "/backend";

type Ticket = {
  id: number;
  code: string;
  productName: string;
  category: string;
  subject: string;
  message: string;
  status:
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED";
  customerName: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminSupportPage() {
  const [tickets, setTickets] =
    useState<Ticket[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/admin/support/tickets`,
          {
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar os chamados."
          );
        }

        const data: Ticket[] =
          await response.json();

        if (!cancelled) {
          setTickets(data);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Não foi possível carregar o suporte."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status !== "RESOLVED"
      ).length,
    [tickets]
  );

  return (
    <div className="mx-auto w-full max-w-[1300px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-violet-200/40">
          <CircleHelp size={13} />
          Administração Orbitta
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Suporte
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
          Chamados enviados pelos clientes aparecem aqui sem depender de dados demonstrativos.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <SupportMetric
          icon={MessageSquareText}
          label="Chamados"
          value={tickets.length}
        />
        <SupportMetric
          icon={Clock3}
          label="Em andamento"
          value={activeCount}
        />
        <SupportMetric
          icon={Mail}
          label="Resolvidos"
          value={
            tickets.length -
            activeCount
          }
        />
      </section>

      <section className="mt-6 overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#08101d]">
        <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5">
          <div>
            <h2 className="text-sm font-medium text-white/75">
              Central de chamados
            </h2>
            <p className="mt-1 text-[10px] text-white/20">
              Dados persistidos e vinculados à conta do cliente.
            </p>
          </div>

          <ShieldCheck
            size={16}
            className="text-white/20"
          />
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2
              size={22}
              className="animate-spin text-violet-200/50"
            />
          </div>
        ) : error ? (
          <div className="p-8 text-sm text-red-200/60">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-10 text-center text-xs text-white/25">
            Nenhum chamado recebido.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[0.7fr_1.3fr_1.8fr_1fr_1fr_0.9fr] gap-4 border-b border-white/[0.04] px-6 py-3 text-[9px] uppercase tracking-[0.13em] text-white/18">
                <span>ID</span>
                <span>Cliente</span>
                <span>Assunto</span>
                <span>Produto</span>
                <span>Atualização</span>
                <span>Status</span>
              </div>

              {tickets.map(
                (ticket) => (
                  <article
                    key={ticket.id}
                    className="grid grid-cols-[0.7fr_1.3fr_1.8fr_1fr_1fr_0.9fr] gap-4 border-b border-white/[0.035] px-6 py-5 last:border-0"
                  >
                    <span className="text-xs text-white/28">
                      {ticket.code}
                    </span>

                    <div>
                      <div className="text-xs text-white/55">
                        {ticket.customerName ||
                          ticket.customerEmail}
                      </div>
                      <div className="mt-1 text-[9px] text-white/18">
                        {ticket.customerEmail}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-white/60">
                        {ticket.subject}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/22">
                        {ticket.message}
                      </p>
                    </div>

                    <div className="text-xs text-white/30">
                      {ticket.productName}
                      <div className="mt-1 text-[9px] text-white/18">
                        {ticket.category}
                      </div>
                    </div>

                    <span className="text-[10px] text-white/25">
                      {new Intl.DateTimeFormat(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      ).format(
                        new Date(
                          ticket.updatedAt
                        )
                      )}
                    </span>

                    <span
                      className={
                        ticket.status ===
                        "RESOLVED"
                          ? "h-fit w-fit rounded-full border border-emerald-300/10 bg-emerald-300/[0.04] px-2.5 py-1 text-[9px] text-emerald-200/55"
                          : "h-fit w-fit rounded-full border border-violet-300/10 bg-violet-300/[0.04] px-2.5 py-1 text-[9px] text-violet-200/55"
                      }
                    >
                      {ticket.status ===
                      "RESOLVED"
                        ? "Resolvido"
                        : ticket.status ===
                            "IN_PROGRESS"
                          ? "Em atendimento"
                          : "Aberto"}
                    </span>
                  </article>
                )
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SupportMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-[22px] border border-white/[0.06] bg-[#08101d] p-5">
      <Icon
        size={16}
        className="text-violet-200/45"
      />
      <div className="mt-4 text-2xl font-semibold text-white/80">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/20">
        {label}
      </div>
    </article>
  );
}
