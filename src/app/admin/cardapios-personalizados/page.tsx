"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Eye, EyeOff, FileArchive, Loader2, RefreshCw, Upload } from "lucide-react";
import { secureFetch } from "@/lib/secureFetch";
import { useLanguage } from "@/i18n/LanguageProvider";

type Site = { id: number; siteSlug: string; storeSlug: string;
  displayName: string; published: boolean };
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
export default function BrandedStorefrontAdmin() {
  const { text } = useLanguage();
  const [sites, setSites] = useState<Site[]>([]);
  const [siteSlug, setSiteSlug] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<number|null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await fetch("/backend/api/admin/custom-storefronts",
        { credentials: "include", cache: "no-store" });
      if (!response.ok) throw Error(text("Não foi possível listar os sites.", "Could not load websites."));
      setSites(await response.json());
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  },[text]);
  useEffect(() => { void load(); },[load]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");setNotice("");
    if (!SLUG.test(siteSlug) || !SLUG.test(storeSlug)) {
      setError(text("Use slugs minúsculos, com números e hífens, sem espaços.",
        "Use lowercase slugs with numbers and hyphens, without spaces."));return;
    }
    if (!file || !/\.zip$/i.test(file.name) || file.size>4_000_000) {
      setError(text("Escolha um ZIP de até 4 MB.", "Choose a ZIP up to 4 MB."));return;
    }
    setSaving(true);
    try {
      const body=new FormData();
      body.append("siteSlug",siteSlug);
      body.append("storeSlug",storeSlug);
      body.append("displayName",displayName);
      body.append("published","false");
      body.append("file",file,file.name);
      const response=await secureFetch("/backend/api/admin/custom-storefronts",
        { method:"POST",credentials:"include",body });
      if (!response.ok) {
        const json=await response.json().catch(()=>null);
        throw Error(json?.message || json?.detail ||
          text("Erro ao importar. Confira se a loja existe no PizzaSystem.",
            "Import error. Make sure the store exists in PizzaSystem."));
      }
      const saved:Site=await response.json();
      setNotice(text("ZIP recebido! Site salvo como rascunho. Publique após conferir.",
        "ZIP imported! Saved as a draft. Publish after reviewing.")+" "+
        `/p/${saved.siteSlug}`);
      setFile(null);
      await load();
    } catch (err) {setError(err instanceof Error?err.message:String(err));}
    finally {setSaving(false);}
  }

  async function toggle(site:Site) {
    setWorkingId(site.id);setError("");setNotice("");
    try {
      const res=await secureFetch(`/backend/api/admin/custom-storefronts/${site.id}/publish`,
        { method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ published:!site.published }) });
      if (!res.ok) throw Error(text("Falha ao atualizar publicação.", "Could not update publication."));
      await load();
    } catch (err) {setError(err instanceof Error?err.message:String(err));}
    finally {setWorkingId(null);}
  }

  function reuse(site:Site) {setSiteSlug(site.siteSlug);setStoreSlug(site.storeSlug);
    setDisplayName(site.displayName);window.scrollTo({top:0,behavior:"smooth"});}

  return <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 text-white sm:px-8">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/60">ORBITTA STUDIO</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        {text("Cardápios personalizados", "Custom storefronts")}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
        {text("Importe o frontend ZIP de uma pizzaria, vincule-o ao slug real dela no PizzaSystem e publique em orbitta.space/p/nome. O checkout, os pagamentos e o painel continuam no PizzaSystem.",
          "Import a pizzeria ZIP design, bind it to its PizzaSystem store slug and publish at orbitta.space/p/name. Checkout, payments and admin stay with PizzaSystem.")}
      </p>
    </div>
    {error && <p role="alert" className="rounded-xl border border-red-300/25 bg-red-300/5 p-4 text-sm text-red-200">{error}</p>}
    {notice && <p role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200/25 bg-emerald-300/5 p-4 text-sm text-emerald-200"><CheckCircle2 size={17}/>{notice}</p>}
    <form onSubmit={submit} className="grid gap-5 rounded-[28px] border border-white/10 bg-[#0b1423] p-7 sm:grid-cols-2">
      <h2 className="col-span-full text-xl font-semibold">{text("Novo site ou atualizar ZIP existente", "New website or update existing ZIP")}</h2>
      <label className="text-xs text-white/60">{text("Nome da pizzaria", "Restaurant name")}
        <input required maxLength={120} value={displayName} onChange={e=>setDisplayName(e.target.value)}
          placeholder="Pizzaria Bella Massa" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none" />
      </label>
      <label className="text-xs text-white/60">{text("Endereço na Orbitta", "Orbitta site address")}
        <div className="mt-2 flex h-12 items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm">
          <span className="mr-1 shrink-0 text-white/35">/p/</span>
          <input required value={siteSlug} maxLength={80} onChange={e=>setSiteSlug(e.target.value.toLowerCase())}
            placeholder="bella-massa" className="min-w-0 flex-1 bg-transparent outline-none" />
        </div>
      </label>
      <label className="text-xs text-white/60">{text("Slug real da loja no PizzaSystem", "PizzaSystem store slug")}
        <input required value={storeSlug} maxLength={80}
          onChange={e=>setStoreSlug(e.target.value.toLowerCase())} placeholder="bella-massa"
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm outline-none" />
        <span className="mt-2 block text-[11px] leading-5 text-white/35">{text(
          "Precisa ser exatamente o mesmo slug cadastrado no PizzaSystem dessa pizzaria.",
          "Must match this restaurant's slug in PizzaSystem exactly."
        )}</span>
      </label>
      <label className="text-xs text-white/60">{text("Arquivo de frontend ZIP", "Frontend ZIP archive")}
        <span className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm">
          <FileArchive size={19} className="text-cyan-200/70"/>
          <input type="file" accept=".zip,application/zip" required
            onChange={e=>setFile(e.target.files?.[0]??null)}
            className="min-w-0 w-full file:mr-2 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:text-white"/>
        </span>
        <span className="mt-2 block text-[11px] leading-5 text-white/35">
          index.html + app.js + style.css (opcional) + assets/*.png/jpg/webp. Máximo 4 MB.
        </span>
      </label>
      <div className="col-span-full flex flex-wrap items-center gap-4">
        <button disabled={saving} type="submit"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-200 px-6 py-3 text-sm font-semibold text-[#07101c] disabled:opacity-45">
          {saving?<Loader2 size={17} className="animate-spin"/>:<Upload size={17}/>}
          {text("Importar ZIP (rascunho)", "Import ZIP (draft)")}
        </button>
        <span className="max-w-lg text-xs leading-5 text-white/40">
          {text("O código do ZIP roda isolado; nunca recebe senhas, sessão do admin ou chaves de pagamento.",
            "ZIP code runs isolated and never receives admin credentials or payment keys.")}
        </span>
      </div>
    </form>
    <section className="rounded-[28px] border border-white/10 bg-[#0b1423] p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{text("Sites cadastrados", "Registered websites")}</h2>
        <button onClick={()=>void load()} className="inline-flex items-center gap-2 text-xs text-white/55">
          <RefreshCw size={15}/>{text("Atualizar", "Refresh")}
        </button>
      </div>
      {loading?<Loader2 className="animate-spin"/>:sites.length===0?
        <p className="text-sm text-white/40">{text("Nenhum ZIP importado ainda.", "No ZIP designs uploaded yet.")}</p>:
        <div className="space-y-3">{sites.map(site=><article key={site.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
          <div><div className="flex items-center gap-2">
            <strong className="font-medium">{site.displayName}</strong>
            <span className={`rounded-full border px-2 py-1 text-[10px] ${site.published?"border-emerald-200/30 text-emerald-200":"border-amber-200/25 text-amber-200"}`}>
              {site.published?text("Publicado","Published"):text("Rascunho","Draft")}
            </span></div>
            <p className="mt-2 text-xs text-white/45">orbitta.space/p/{site.siteSlug} · PizzaSystem: {site.storeSlug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={()=>reuse(site)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">
              {text("Trocar ZIP", "Replace ZIP")}
            </button>
            {site.published && <Link href={`/p/${site.siteSlug}`} target="_blank"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs">
              {text("Abrir", "Open")}<ArrowUpRight size={14}/>
            </Link>}
            <button disabled={workingId===site.id} onClick={()=>void toggle(site)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#07101c] disabled:opacity-40">
              {site.published?<EyeOff size={15}/>:<Eye size={15}/>}
              {site.published?text("Despublicar","Unpublish"):text("Publicar","Publish")}
            </button>
          </div>
        </article>)}</div>}
    </section>
  </main>;
}
