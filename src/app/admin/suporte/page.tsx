"use client";

import {
  CircleHelp,
  ExternalLink,
  LifeBuoy,
  Mail,
  MessageSquareText,
} from "lucide-react";

export default function AdminSupportPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-violet-200/40">
          <CircleHelp size={13} />
          Administração Orbitta
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Suporte
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/30">
          Central administrativa para acompanhar os canais de suporte e atendimento da Orbitta.
        </p>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <SupportCard
          icon={LifeBuoy}
          title="Atendimento"
          description="Área preparada para centralizar chamados e solicitações dos clientes."
          badge="Em preparação"
        />

        <SupportCard
          icon={MessageSquareText}
          title="Conversas"
          description="Os atendimentos integrados aparecerão aqui quando o módulo de tickets for ativado."
          badge="Em preparação"
        />

        <SupportCard
          icon={Mail}
          title="Contato"
          description="Enquanto o módulo próprio não estiver ativo, use os canais oficiais da Orbitta para suporte."
          badge="Disponível"
        />
      </section>

      <section className="mt-6 rounded-[26px] border border-white/[0.06] bg-[#08101d] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/[0.08] bg-violet-300/[0.03] text-violet-200/50">
            <ExternalLink size={17} />
          </div>

          <div>
            <h2 className="text-sm font-medium text-white/80">
              Página ativa
            </h2>

            <p className="mt-2 text-xs leading-6 text-white/30">
              Esta rota agora existe e não cai mais em 404. O módulo completo de tickets pode ser ligado depois sem precisar alterar o menu do Admin.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SupportCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/[0.06] bg-[#08101d] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/[0.08] bg-violet-300/[0.03] text-violet-200/50">
        <Icon size={17} />
      </div>

      <h2 className="mt-5 text-sm font-medium text-white/80">
        {title}
      </h2>

      <p className="mt-2 text-xs leading-6 text-white/28">
        {description}
      </p>

      <div className="mt-5 inline-flex rounded-full border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-white/30">
        {badge}
      </div>
    </article>
  );
}
