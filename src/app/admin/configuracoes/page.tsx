"use client";

import Link from "next/link";
import {
  Boxes,
  ExternalLink,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-violet-200/40">
          <Settings size={13} />
          Sistema
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Configurações
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
          Acesse os principais controles administrativos da plataforma sem cair em rotas inexistentes.
        </p>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <SettingsLink
          href="/admin/produtos"
          icon={Boxes}
          title="Produtos e planos"
          description="Gerencie o catálogo, planos, preços e disponibilidade dos produtos Orbitta."
        />

        <SettingsLink
          href="/admin/clientes"
          icon={Users}
          title="Clientes"
          description="Consulte clientes, status de acesso e produtos contratados."
        />

        <SettingsLink
          href="/admin/faturas"
          icon={ShieldCheck}
          title="Financeiro"
          description="Acompanhe faturas, vencimentos e atualize cobranças."
        />

        <SettingsLink
          href="/"
          icon={ExternalLink}
          title="Site público"
          description="Abra a landing page principal da Orbitta."
        />
      </section>

      <section className="mt-6 rounded-[26px] border border-white/[0.06] bg-[#08101d] p-6">
        <h2 className="text-sm font-medium text-white/80">
          Configurações avançadas
        </h2>

        <p className="mt-2 max-w-2xl text-xs leading-6 text-white/30">
          Preferências globais, integrações e parâmetros internos podem ser adicionados nesta página conforme o backend ganhar essas configurações. Por enquanto, os controles já existentes continuam centralizados nas áreas acima.
        </p>
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
