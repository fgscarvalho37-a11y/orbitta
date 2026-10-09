"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, MessageSquareText, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { secureFetch } from "@/lib/secureFetch";

const API = "/backend";
type Project = {
  id: number; checkoutId: number; customerName: string; customerEmail: string;
  businessName: string; contactEmail: string; contactPhone: string | null;
  businessType: string | null; projectBrief: string;
  requestedPages: string | null; designReferences: string | null;
  preferredDomain: string | null; status: string; deliveryUrl: string | null;
};
type Message = { id: number; authorName: string; authorRole: string; message: string; createdAt: string };

export default function SiteProjectConversation({ id, admin = false }: { id: number; admin?: boolean }) {
  const { text, locale } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [delivering, setDelivering] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const refresh = useCallback(async (initial = false) => {
    try {
      const [projectResponse, messagesResponse] = await Promise.all([
        fetch(`${API}/api/site-projects/${id}`, { credentials: "include", cache: "no-store" }),
        fetch(`${API}/api/site-projects/${id}/messages`, { credentials: "include", cache: "no-store" }),
      ]);
      if (projectResponse.status === 401 || projectResponse.status === 403) {
        throw new Error(text("Acesso não autorizado a este projeto.", "Not authorized to access this project."));
      }
      if (!projectResponse.ok || !messagesResponse.ok) {
        throw new Error(text("Não foi possível carregar o projeto.", "Could not load this project."));
      }
      const [nextProject, nextMessages] = await Promise.all([projectResponse.json(), messagesResponse.json()]);
      setProject(nextProject);
      setMessages(nextMessages);
      if (initial) setDeliveryUrl(nextProject.deliveryUrl ?? "");
    } catch (caught) {
      if (initial) setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      if (initial) setLoading(false);
    }
  }, [id, text]);

  useEffect(() => {
    void refresh(true);
    const interval = window.setInterval(() => void refresh(false), 8000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true); setError("");
    try {
      const response = await secureFetch(`${API}/api/site-projects/${id}/messages`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content.trim() }),
      });
      if (!response.ok) throw new Error(text("Falha ao enviar mensagem.", "Could not send message."));
      setContent("");
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally { setSending(false); }
  }

  async function deliver(event: FormEvent) {
    event.preventDefault();
    if (!admin || !deliveryUrl.trim() || delivering) return;
    setDelivering(true); setError("");
    try {
      const response = await secureFetch(`${API}/api/admin/site-projects/${id}/delivery`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryUrl: deliveryUrl.trim(), message: deliveryMessage.trim() }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? text("Não foi possível enviar o site.", "Could not deliver the website."));
      }
      setDeliveryMessage(""); await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally { setDelivering(false); }
  }

  async function setStatus(status: string) {
    if (!admin || statusSaving) return;
    setStatusSaving(true); setError("");
    try {
      const response = await secureFetch(`${API}/api/admin/site-projects/${id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(text("Não foi possível alterar o status.", "Could not update status."));
      await refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setStatusSaving(false); }
  }

  const statuses: Record<string, string> = {
    BRIEF_RECEIVED: text("Briefing recebido", "Brief received"),
    IN_PROGRESS: text("Em desenvolvimento", "In progress"),
    IN_REVIEW: text("Em revisão", "In review"),
    DELIVERED: text("Site entregue", "Delivered"),
  };

  if (loading) return <div className="flex min-h-96 items-center justify-center text-white/60"><Loader2 className="animate-spin" size={28} /></div>;

  if (!project) return <div className="mx-auto max-w-3xl p-8 text-red-200">{error || text("Projeto não encontrado.", "Project not found.")}</div>;

  return (
    <div className="mx-auto max-w-[1350px] space-y-6 px-5 py-8 text-white sm:px-8 lg:py-12">
      <Link href={admin ? "/admin/sites" : "/painel/sites"} className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-white">
        <ArrowLeft size={14} />{text("Voltar aos meus sites", "Back to websites")}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/55">Orbitta Sites · #{project.id}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{project.businessName}</h1>
          <p className="mt-2 text-sm text-white/45">{admin ? project.customerEmail : project.contactEmail}</p>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs text-cyan-100">{statuses[project.status] ?? project.status}</span>
      </div>

      {project.deliveryUrl && /^https:\/\//i.test(project.deliveryUrl) && (
        <a href={project.deliveryUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5 text-emerald-100">
          <div className="flex items-center gap-3"><CheckCircle2 size={23} />
            <div><strong className="block text-sm">{text("Seu site está disponível!", "Your website is ready!")}</strong>
              <span className="block break-all text-xs opacity-70">{project.deliveryUrl}</span></div>
          </div><ExternalLink size={18} />
        </a>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b1321]">
          <header className="flex items-center gap-3 border-b border-white/[0.07] p-5">
            <MessageSquareText size={18} className="text-cyan-200" />
            <div><h2 className="font-medium">{text("Conversa com a Orbitta", "Chat with Orbitta")}</h2>
              <p className="text-xs text-white/35">{text("Mensagens privadas, vinculadas à sua compra. Atualização automática.", "Private messages for your purchase. Refreshes automatically.")}</p>
            </div>
          </header>
          <div className="flex min-h-[330px] max-h-[520px] flex-col gap-4 overflow-y-auto p-5">
            {messages.length === 0 && <p className="m-auto max-w-md text-center text-sm leading-7 text-white/35">
              {text("Conte sobre suas ideias! A conversa ficará registrada aqui.", "Tell us about your ideas! This conversation will be saved here.")}
            </p>}
            {messages.map((message) => {
              const mine = admin ? message.authorRole === "ADMIN" : message.authorRole !== "ADMIN";
              return <article key={message.id} className={`max-w-[88%] rounded-2xl border p-4 ${mine ? "ml-auto border-cyan-300/15 bg-cyan-300/10" : "mr-auto border-white/10 bg-white/[0.04]"}`}>
                <div className="mb-2 flex items-center gap-3 text-[10px] text-white/40">
                  <strong>{message.authorRole === "ADMIN" ? "Orbitta" : message.authorName}</strong>
                  <span>{new Date(message.createdAt).toLocaleString(locale)}</span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white/85">{message.message}</p>
              </article>;
            })}
          </div>
          <form onSubmit={send} className="flex items-end gap-3 border-t border-white/[0.08] p-4">
            <textarea rows={2} maxLength={4000} required value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={text("Escreva sua mensagem...", "Type your message...")}
              className="min-h-12 flex-1 resize-y rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white outline-none focus:border-cyan-200/35" />
            <button disabled={sending || !content.trim()} type="submit"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-200 text-[#07101c] disabled:opacity-40">
              {sending ? <Loader2 size={19} className="animate-spin" /> : <Send size={19} />}
            </button>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1321] p-6">
            <h2 className="mb-5 text-base font-semibold">{text("Informações do projeto", "Project brief")}</h2>
            {[
              [text("Empresa", "Business"), project.businessName],
              [text("Contato", "Contact"), project.contactEmail],
              [text("Telefone", "Phone"), project.contactPhone],
              [text("Segmento", "Industry"), project.businessType],
              [text("Páginas desejadas", "Requested pages"), project.requestedPages],
              [text("Referências", "References"), project.designReferences],
              [text("Domínio", "Domain"), project.preferredDomain],
              [text("Objetivo e estilo", "Goals and style"), project.projectBrief],
            ].filter((pair) => pair[1]).map(([label, value]) => (
              <div key={label} className="mb-4 border-b border-white/[0.05] pb-4 last:mb-0 last:border-0 last:pb-0">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-white/35">{label}</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white/70">{value}</p>
              </div>
            ))}
          </section>

          {admin && <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1321] p-6">
            <h2 className="mb-4 font-semibold">{text("Gerenciar entrega", "Delivery management")}</h2>
            <label className="block text-xs text-white/45">{text("Etapa do projeto", "Project stage")}</label>
            <select value={project.status} disabled={statusSaving}
              onChange={(event) => void setStatus(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[#111c2a] px-3 text-sm">
              {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <form onSubmit={deliver} className="mt-6 space-y-3">
              <label className="block text-xs text-white/45">{text("URL do site pronto (HTTPS)", "Website URL (HTTPS)")}</label>
              <input type="url" required pattern="https://.*" placeholder="https://www.example.com"
                value={deliveryUrl} onChange={(event) => setDeliveryUrl(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm outline-none" />
              <textarea rows={3} maxLength={2000} value={deliveryMessage}
                onChange={(event) => setDeliveryMessage(event.target.value)}
                placeholder={text("Mensagem opcional para o cliente", "Optional message to the customer")}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm outline-none" />
              <button type="submit" disabled={delivering || !deliveryUrl.trim()}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#07101c] disabled:opacity-40">
                {delivering ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                {text("Enviar site ao cliente", "Deliver website to client")}
              </button>
            </form>
          </section>}
        </aside>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-300/20 p-4 text-sm text-red-200">{error}</p>}
    </div>
  );
}
