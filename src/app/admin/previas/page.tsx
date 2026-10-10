"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Check, Copy, Eye, EyeOff, FileArchive,
  LoaderCircle, RefreshCcw, UploadCloud,
} from "lucide-react";
import { secureFetch } from "@/lib/secureFetch";

type Preview = {
  id: number; slug: string; title: string; published: boolean; updatedAt: string;
};
const slugPattern = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export default function CustomerPreviewsAdmin() {
  const [items, setItems] = useState<Preview[]>([]);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/backend/api/admin/site-previews",
        { cache: "no-store", credentials: "include" });
      if (!response.ok) throw new Error("Não foi possível carregar as prévias.");
      const result = await response.json() as Preview[];
      setItems(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao listar prévias.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");
    const id = slug.trim().toLowerCase();
    if (!slugPattern.test(id)) {
      setError("O endereço deve ter letras minúsculas, números e hífens, até 80 caracteres.");
      return;
    }
    if (!title.trim()) { setError("Informe o nome do cliente."); return; }
    if (!file || !/\.zip$/i.test(file.name) || file.size > 4_000_000) {
      setError("Selecione um arquivo .zip de até 4 MB.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.set("slug", id);
      body.set("title", title.trim());
      body.set("file", file, file.name);
      const res = await secureFetch("/backend/api/admin/site-previews", {
        method: "POST", credentials: "include", body,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || json?.detail || "Não foi possível importar o ZIP. Verifique os arquivos.");
      }
      const created = await res.json() as Preview;
      setSuccess(`Prévia salva! Link permanente: https://orbitta.space/preview/${created.slug}`);
      setFile(null);
      const input = document.getElementById("preview-zip") as HTMLInputElement | null;
      if (input) input.value = "";
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha no envio do ZIP.");
    } finally {
      setUploading(false);
    }
  }

  async function publish(item: Preview) {
    setError(""); setSuccess(""); setUpdatingId(item.id);
    try {
      const res = await secureFetch(`/backend/api/admin/site-previews/${item.id}/publish`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ published: !item.published }),
      });
      if (!res.ok) throw new Error("Não foi possível alterar a visibilidade.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro ao publicar.");
    } finally {
      setUpdatingId(null);
    }
  }

  function replace(item: Preview) {
    setSlug(item.slug);
    setTitle(item.title);
    setSuccess("Selecione o ZIP atualizado abaixo. Use o mesmo endereço para substituir sem mudar o link.");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copy(item: Preview) {
    try {
      await navigator.clipboard.writeText(`https://orbitta.space/preview/${item.slug}`);
      setCopiedSlug(item.slug);
    } catch {
      setError("Não foi possível copiar automaticamente. Abra o link e copie da barra do navegador.");
    }
  }

  return <main className="mx-auto max-w-6xl space-y-9 px-5 py-10 text-white sm:px-8">
    <header>
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/60">Orbitta Studio · Apresentações</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Prévias para clientes</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
        Publique uma proposta visual com endereço próprio na Orbitta. Para atualizar, envie outro ZIP
        usando o mesmo identificador — o link que você mandou no WhatsApp continua igual.
        Não precisa criar uma loja no PizzaSystem.
      </p>
    </header>

    {error && <div role="alert" className="rounded-xl border border-rose-200/25 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
    {success && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200/20 bg-emerald-300/5 p-4 text-sm text-emerald-100">
      <Check size={18} className="mt-0.5 shrink-0"/><span>{success}</span>
    </div>}

    <form onSubmit={upload} className="grid gap-5 rounded-[26px] border border-white/10 bg-[#0c1524] p-6 sm:grid-cols-2 sm:p-8">
      <div className="sm:col-span-2">
        <h2 className="text-xl font-semibold">Criar ou substituir uma prévia</h2>
        <p className="mt-2 text-xs leading-6 text-white/45">
          A prévia é pública para qualquer pessoa com o link. Nenhum botão pode cobrar valores reais.
        </p>
      </div>
      <label className="block text-sm text-white/75">
        Nome do estabelecimento
        <input required maxLength={140} value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Mini Pizza Matos"
          className="mt-2 block h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-white outline-none focus:border-cyan-300/50"/>
      </label>
      <label className="block text-sm text-white/75">
        Identificador do link
        <div className="mt-2 flex h-12 items-center rounded-xl border border-white/10 bg-white/[0.045] px-4 focus-within:border-cyan-300/50">
          <span className="shrink-0 text-xs text-white/40">/preview/</span>
          <input required maxLength={80} value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replaceAll(" ","-"))}
            placeholder="mini-pizza-matos" className="min-w-0 w-full bg-transparent text-sm outline-none" />
        </div>
      </label>
      <label className="block text-sm text-white/75 sm:col-span-2">
        Arquivo ZIP do frontend
        <span className="mt-2 flex min-h-14 items-center gap-3 rounded-xl border border-dashed border-cyan-200/30 bg-cyan-200/[0.035] px-4">
          <FileArchive size={20} className="shrink-0 text-cyan-100/70"/>
          <input id="preview-zip" type="file" accept=".zip,application/zip" required
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="min-w-0 w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:text-white"/>
        </span>
        <span className="mt-2 block text-xs leading-6 text-white/40">
          index.html na raiz; style.css e app.js opcionais; fotos em assets/*.png, *.jpg ou *.webp. Até 4 MB.
        </span>
      </label>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={uploading}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-200 px-6 py-3 text-sm font-semibold text-[#071321] disabled:opacity-50">
          {uploading ? <LoaderCircle size={18} className="animate-spin"/> : <UploadCloud size={18}/>}
          {uploading ? "Enviando..." : "Hospedar / atualizar prévia"}
        </button>
        <span className="text-xs text-white/45">Mesmo identificador = substitui o conteúdo no mesmo endereço.</span>
      </div>
    </form>

    <section className="rounded-[26px] border border-white/10 bg-[#0c1524] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Links de apresentação</h2>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white">
          <RefreshCcw size={15}/>Atualizar
        </button>
      </div>
      {fetching ? <LoaderCircle className="mt-8 animate-spin"/> :
        items.length===0 ? <p className="mt-8 text-sm text-white/45">Nenhuma prévia hospedada ainda.</p> :
        <div className="mt-6 space-y-4">
          {items.map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{item.title}</h3>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${item.published ? "border-emerald-200/25 text-emerald-100" : "border-amber-200/20 text-amber-100"}`}>
                  {item.published ? "Público" : "Oculto"}
                </span>
              </div>
              <p className="mt-2 break-all text-xs text-cyan-100/75">
                https://orbitta.space/preview/{item.slug}
              </p>
              <p className="mt-1 text-[11px] text-white/35">
                Atualizado: {new Date(item.updatedAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {item.published && <Link href={`/preview/${item.slug}`} target="_blank"
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/80">
                Abrir <ArrowUpRight size={14}/>
              </Link>}
              <button onClick={() => void copy(item)} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/80">
                {copiedSlug === item.slug ? <Check size={14}/> : <Copy size={14}/>} Copiar
              </button>
              <button onClick={() => replace(item)} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/80">
                Trocar ZIP
              </button>
              <button onClick={() => void publish(item)} disabled={updatingId===item.id}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#071321] disabled:opacity-50">
                {item.published ? <EyeOff size={14}/> : <Eye size={14}/>}
                {item.published ? "Ocultar" : "Publicar"}
              </button>
            </div>
          </article>)}
        </div>}
    </section>
  </main>;
}
