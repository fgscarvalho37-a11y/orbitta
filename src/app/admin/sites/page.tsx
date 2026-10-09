"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Globe2, Loader2 } from "lucide-react";

type Project = { id: number; businessName: string; customerName: string; customerEmail: string; status: string; updatedAt: string };
export default function AdminSitesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/backend/api/admin/site-projects", { credentials: "include", cache: "no-store" })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Não foi possível carregar os projetos.")))
      .then(setProjects).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);
  return <main className="mx-auto max-w-6xl px-5 py-10 text-white sm:px-8">
    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/55">Orbitta Sites · Admin</p>
    <h1 className="mt-3 text-3xl font-semibold">Sites contratados</h1>
    <p className="mt-3 text-sm text-white/45">Briefings, mensagens dos clientes, acompanhamento e entrega do site pronto.</p>
    {loading ? <Loader2 className="mt-10 animate-spin" /> : error ? <p className="mt-8 text-red-200">{error}</p> :
      projects.length ? <div className="mt-9 space-y-4">
        {projects.map((project) => <Link key={project.id} href={`/admin/sites/${project.id}`}
          className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0b1321] p-5 hover:border-cyan-200/20">
          <div className="flex items-center gap-4"><Globe2 size={24} className="text-cyan-200/70" />
            <div><h2 className="font-medium">{project.businessName}</h2>
              <p className="mt-1 text-xs text-white/45">{project.customerName} · {project.customerEmail}</p>
              <p className="mt-1 text-xs text-cyan-100/60">{project.status.replaceAll("_", " ")}</p>
            </div></div><ArrowRight size={18} className="shrink-0 text-white/40" />
        </Link>)}
      </div> : <div className="mt-9 rounded-2xl border border-dashed border-white/10 p-8 text-sm text-white/40">
        Ainda não há briefing de site pago.
      </div>}
  </main>;
}
