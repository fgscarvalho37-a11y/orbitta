"use client";

import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Orbit,
} from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg rounded-[30px] border border-white/[0.06] bg-[#08101d] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/[0.09] bg-violet-300/[0.035] text-violet-200/55">
          <Orbit size={23} />
        </div>

        <div className="mt-6 text-[10px] uppercase tracking-[0.22em] text-violet-200/35">
          Orbitta Admin
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white/90">
          Página não encontrada
        </h1>

        <p className="mt-3 text-xs leading-6 text-white/30">
          Essa rota administrativa ainda não existe ou foi movida.
        </p>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/admin"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-[#07101c]"
          >
            <LayoutDashboard size={14} />
            Ir para o painel
          </Link>

          <button
            type="button"
            onClick={() => history.back()}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.07] px-4 text-xs text-white/45"
          >
            <ArrowLeft size={14} />
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
