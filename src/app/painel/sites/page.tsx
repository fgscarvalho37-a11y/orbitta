"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Globe2, Loader2, Plus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

type Item = { id: number; businessName: string; status: string; deliveryUrl: string | null; updatedAt: string };
export default function MyWebsitesPage() {
  const { text, locale } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/backend/api/site-projects", { credentials: "include", cache: "no-store" })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(text("Erro ao carregar sites.", "Could not load websites."))))
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [text]);

  return <div className="mx-auto max-w-5xl px-5 py-10 text-white">
    <div className="flex flex-wrap items-center justify-between gap-5">
      <div><p className="text-xs uppercase tracking-wider text-cyan-100/55">Orbitta Sites</p>
        <h1 className="mt-3 text-3xl font-semibold">{text("Meus sites", "My websites")}</h1>
        <p className="mt-3 text-sm text-white/45">{text("Acompanhe projetos, converse com a Orbitta e receba suas entregas.", "Track projects, chat with Orbitta and receive your websites.")}</p>
      </div>
      <Link href="/site-checkout" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#07101c]"><Plus size={16} />{text("Novo site", "New website")}</Link>
    </div>
    {loading ? <Loader2 className="mt-14 animate-spin text-white/50" /> : error ? <p role="alert" className="mt-8 text-red-200">{error}</p> :
      items.length ? <div className="mt-9 grid gap-4">
        {items.map((site) => <Link key={site.id} href={`/painel/sites/${site.id}`}
          className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0b1321] p-6 hover:border-cyan-200/25">
          <div className="flex items-center gap-4"><Globe2 className="text-cyan-200/70" size={26} />
            <div><h2 className="font-semibold">{site.businessName}</h2>
              <p className="mt-1 text-xs text-white/40">{site.status.replaceAll("_", " ")} · {new Date(site.updatedAt).toLocaleDateString(locale)}</p>
            </div></div><ArrowRight className="shrink-0 text-white/40" size={19} />
        </Link>)}
      </div> : <div className="mt-10 rounded-[28px] border border-dashed border-white/10 p-9 text-center text-white/55">
        {text("Quando você confirmar a compra e enviar o briefing, seu projeto aparecerá aqui.", "Once payment and the brief are complete, your project appears here.")}
      </div>}
  </div>;
}
