"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Preview = {
  title: string;
  html: string;
  css: string;
  javascript: string;
  updatedAt: string;
};

// Preview ZIP code always runs in a separate, opaque-origin sandbox:
// never in the Orbitta site's origin or with admin/customer cookies.
function srcDoc(preview: Preview) {
  const html = preview.html;
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] ?? html;
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] ?? "";
  // Keep inline CSS from the original HTML; links to remote stylesheets
  // and scripts are blocked. App JS is appended after the document body.
  const inlineStyles = Array.from(head.matchAll(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi))
    .map(match => match[0]).join("\n");
  const cleanedBody = body
    .replace(/<script\b[^>]*\bsrc\s*=[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "");
  const safeJs = preview.javascript.replace(/<\/script/gi, "<\\/script");
  const safeCss = preview.css.replace(/<\/style/gi, "<\\/style");
  return `<!DOCTYPE html><html lang="pt-BR"><head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; img-src https: data:; media-src https: data:; font-src https: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; navigate-to 'none'">
    ${inlineStyles}
    <style>${safeCss}</style>
    </head><body>${cleanedBody}<script>${safeJs}</script></body></html>`;
}

export default function PublicWebsitePreview() {
  const { slug } = useParams<{ slug: string }>();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!/^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/.test(slug)) {
      setError("Link de apresentação inválido.");
      return;
    }
    fetch(`/backend/api/public/site-previews/${encodeURIComponent(slug)}`,
      { cache: "no-store" })
      .then(async res => {
        if (!res.ok) throw new Error("Esta apresentação não está disponível.");
        return await res.json() as Preview;
      })
      .then(result => { if (active) setPreview(result); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : "Erro ao carregar prévia."); });
    return () => { active = false; };
  }, [slug]);

  return <div className="flex min-h-screen flex-col bg-[#0a101b]">
    <div className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#091321] px-4 py-2 text-xs text-white sm:px-6">
      <div className="flex items-center gap-3">
        <strong className="tracking-[.18em]">ORBITTA</strong>
        <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-2 py-1 text-amber-100">
          PRÉVIA DE APRESENTAÇÃO
        </span>
      </div>
      <span className="text-white/60">Demonstração visual · Pedidos e pagamentos desativados</span>
    </div>
    {error ? <div role="alert" className="grid flex-1 place-items-center p-8 text-center text-sm text-white/70">
      {error}
    </div> : !preview ? <div className="grid flex-1 place-items-center p-8 text-sm text-white/60">
      Preparando apresentação...
    </div> : <iframe
      key={preview.updatedAt}
      title={`Prévia — ${preview.title}`}
      srcDoc={srcDoc(preview)}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="min-h-[720px] w-full flex-1 border-0 bg-white"
      style={{ height: "calc(100vh - 44px)" }}
    />}
  </div>;
}
