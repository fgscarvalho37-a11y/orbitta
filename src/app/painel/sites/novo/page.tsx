"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, Save, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { secureFetch } from "@/lib/secureFetch";

type FormValues = {
  businessName: string; contactEmail: string; contactPhone: string;
  businessType: string; projectBrief: string; requestedPages: string;
  designReferences: string; preferredDomain: string;
};
const empty: FormValues = {
  businessName: "", contactEmail: "", contactPhone: "", businessType: "",
  projectBrief: "", requestedPages: "", designReferences: "", preferredDomain: "",
};

export default function WebsiteBriefPage() {
  const { text } = useLanguage();
  const router = useRouter();
  const [checkoutId, setCheckoutId] = useState(0);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<FormValues>(empty);

  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get("checkoutId"));
    if (!Number.isSafeInteger(id) || id < 1) {
      setError(text("Compra não identificada.", "Purchase not identified."));
      setChecking(false);
      return;
    }
    setCheckoutId(id);
    let alive = true;
    async function check() {
      try {
        const response = await fetch(`/backend/api/site-projects/by-checkout/${id}`, {
          credentials: "include", cache: "no-store",
        });
        if (!alive) return;
        if (response.status === 401 || response.status === 403) {
          window.location.replace("/login?returnUrl=" + encodeURIComponent(`/painel/sites/novo?checkoutId=${id}`));
          return;
        }
        if (response.status === 402) {
          setReady(false);
          setError(text("Aguardando confirmação do pagamento. A página verifica automaticamente.",
            "Waiting for payment confirmation. This page refreshes automatically."));
          return;
        }
        if (response.status === 204) {
          setReady(true); setError(""); return;
        }
        if (response.ok) {
          const existing: { id: number } = await response.json();
          window.location.replace(`/painel/sites/${existing.id}`);
          return;
        }
        setError(text("Não foi possível verificar a contratação.", "Could not validate the purchase."));
      } catch {
        if (alive) setError(text("Falha na conexão. Tentando novamente...", "Connection issue. Retrying..."));
      } finally {
        if (alive) setChecking(false);
      }
    }
    void check();
    const interval = window.setInterval(() => void check(), 5000);
    return () => { alive = false; window.clearInterval(interval); };
  }, [text]);

  function field(key: keyof FormValues, label: string, placeholder = "", multiline = false, required = false) {
    const common = {
      value: values[key], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((current) => ({ ...current, [key]: event.target.value })),
      required, placeholder,
      className: "mt-2 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-200/50",
    };
    return <label className="block text-xs text-white/70">
      {label}{required ? " *" : ""}
      {multiline ? <textarea {...common} rows={5} maxLength={key === "projectBrief" ? 4000 : 1000} />
        : <input {...common} maxLength={key === "contactEmail" ? 255 : 255} />}
    </label>;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || saving) return;
    setSaving(true); setError("");
    try {
      const response = await secureFetch("/backend/api/site-projects", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId, ...values }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? text("Não foi possível enviar o briefing.", "Could not submit your website brief."));
      }
      const project: { id: number } = await response.json();
      router.replace(`/painel/sites/${project.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 text-white">
      <Link href="/painel/sites" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white">
        <ArrowLeft size={15} /> {text("Meus sites", "My websites")}
      </Link>
      <div className="mt-10">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-200/60">
          <ShieldCheck size={15} /> Orbitta Sites
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          {text("Conte como será seu site.", "Tell us about your website.")}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
          {text("Este formulário só é liberado após a confirmação do pagamento. Depois, você entra no chat privado para enviar mais referências e acompanhar a criação.",
            "This form is available only after payment confirmation. Then you'll join your private chat to share more references and follow development.")}
        </p>
      </div>
      <section className="mt-10 rounded-[28px] border border-white/[0.1] bg-[#0b1423] p-6 sm:p-9">
        {checking ? <div className="flex items-center gap-2 text-sm text-white/55"><Loader2 className="animate-spin" size={17} />{text("Verificando pagamento...", "Checking payment...")}</div> :
        ready ? <>
          <p className="mb-7 flex items-center gap-2 text-sm text-emerald-200"><CheckCircle2 size={17} />{text("Pagamento confirmado. Vamos começar!", "Payment confirmed. Let's get started!")}</p>
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            {field("businessName", text("Nome da sua empresa", "Business name"), text("Nome comercial", "Trading name"), false, true)}
            {field("contactEmail", text("E-mail para contato", "Contact email"), "you@example.com", false, true)}
            {field("contactPhone", text("WhatsApp / telefone", "Phone / WhatsApp"))}
            {field("businessType", text("Segmento", "Business category"), text("Restaurante, loja...", "Restaurant, shop..."))}
            <div className="sm:col-span-2">{field("projectBrief", text("Como você imagina o site?", "What do you envision?"),
              text("Descreva o objetivo, estilo, cores, funções e público.", "Describe goals, style, colors, features, and audience."), true, true)}</div>
            <div className="sm:col-span-2">{field("requestedPages", text("Páginas desejadas", "Pages you need"),
              text("Início, sobre, contato...", "Home, about, contact..."), true)}</div>
            <div className="sm:col-span-2">{field("designReferences", text("Referências e sites de exemplo", "References and example websites"), "https://...", true)}</div>
            <div className="sm:col-span-2">{field("preferredDomain", text("Domínio desejado (opcional)", "Desired domain (optional)"), "example.com")}</div>
            <button disabled={saving} type="submit" className="sm:col-span-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-200 text-sm font-semibold text-[#07101c] disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
              {text("Enviar briefing e abrir conversa", "Submit brief and open chat")}
            </button>
          </form>
        </> : <div className="space-y-4 text-sm text-amber-100/70">
          <p>{error || text("Verificando aprovação...", "Checking approval...")}</p>
          <Link href={checkoutId ? `/checkout/${checkoutId}` : "/site-checkout"} className="inline-block rounded-xl border border-white/15 px-4 py-3 text-white/80">
            {text("Ver minha compra", "View my purchase")}
          </Link>
        </div>}
        {ready && error && <p role="alert" className="mt-6 text-sm text-red-300">{error}</p>}
      </section>
    </div>
  );
}
