"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Addon = { id: number; name: string; price: number; active?: boolean };
type Product = { id: number; name: string; price: number; available: boolean;
  addonGroups?: { active: boolean; addons: Addon[] }[]; allowCrust?: boolean };
type Crust = { id: number; active: boolean; price: number };
type Storefront = {
  siteSlug: string; storeSlug: string; displayName: string; published: boolean;
  html: string; css: string; javascript: string;
};
type Catalog = { storeSlug: string; products: Product[]; crusts: Crust[];
  status: { open: boolean; message: string }; profile: Record<string, unknown> };
type CartInput = { productId: number; quantity: number;
  observation?: string; crustId?: number | null; addonIds?: number[] };

// Restricted bridge contract for independently generated ZIP designs.
// Templates never receive session cookies or private client information.
const BRIDGE = `
(function () {
  "use strict";
  let snapshot = null, subscribers = [];
  window.OrbittaStore = Object.freeze({
    ready: function (callback) {
      if (typeof callback !== 'function') return;
      if (snapshot) callback(snapshot);
      else subscribers.push(callback);
    },
    getData: function () { return snapshot; },
    checkout: function (items) {
      window.parent.postMessage({ type: "orbitta:checkout", items: items }, "*");
    }
  });
  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    if (!event.data || event.data.type !== "orbitta:init") return;
    snapshot = Object.freeze(event.data.payload);
    subscribers.forEach(function (callback) { try { callback(snapshot); } catch (err) { console.error(err); } });
    subscribers = [];
  });
  window.parent.postMessage({ type: "orbitta:ready" }, "*");
})();
`;

function safeInline(code: string) {
  return code.replace(/<\/script/gi, "<\\/script");
}
function makeDoc(site: Storefront) {
  const body = site.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? site.html;
  const clean = body.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script\b[^>]*\/\s*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "");
  const title = site.displayName.replace(/[<&"]/g, "");
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri 'none'; form-action 'none'; connect-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:; object-src 'none'">
<title>${title}</title><style>${safeInline(site.css)}</style></head>
<body>${clean}
<script>${safeInline(BRIDGE)}</script><script>${safeInline(site.javascript)}</script>
</body></html>`;
}

function validateCart(items: unknown, catalog: Catalog): CartInput[] {
  if (!catalog.status?.open) throw Error("Esta pizzaria não está recebendo pedidos agora.");
  if (!Array.isArray(items) || items.length < 1 || items.length > 35) {
    throw Error("Escolha de 1 a 35 itens para continuar.");
  }
  return items.map(raw => {
    if (!raw || typeof raw !== "object") throw Error("Carrinho inválido.");
    const item = raw as Record<string, unknown>;
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(productId) || !Number.isSafeInteger(quantity) ||
        quantity < 1 || quantity > 25) throw Error("Produto ou quantidade inválida.");
    const product = catalog.products.find(p => p.id === productId && p.available !== false);
    if (!product) throw Error("Um produto não está disponível neste estabelecimento.");
    const observation = typeof item.observation === "string" ? item.observation : "";
    if (observation.length > 300) throw Error("Observação acima de 300 caracteres.");
    const crustId = item.crustId == null ? null : Number(item.crustId);
    if (crustId !== null &&
       (!Number.isSafeInteger(crustId) || !product.allowCrust ||
        !catalog.crusts.some(c => c.id === crustId && c.active))) {
      throw Error("Borda selecionada inválida.");
    }
    const addonIds = item.addonIds ?? [];
    if (!Array.isArray(addonIds) || addonIds.length > 30) throw Error("Adicionais inválidos.");
    const validAddons = (product.addonGroups ?? []).filter(g => g.active)
      .flatMap(g => g.addons.filter(a => a.active !== false).map(a => a.id));
    const extras = addonIds.map(Number);
    if (extras.some(id => !Number.isSafeInteger(id) || !validAddons.includes(id)) ||
        new Set(extras).size !== extras.length) throw Error("Adicional indisponível.");
    return { productId, quantity, observation, crustId, addonIds: extras };
  });
}

export default function BrandedMenuPage() {
  const params = useParams<{ slug: string }>();
  const siteSlug = String(params.slug ?? "");
  const frame = useRef<HTMLIFrameElement>(null);
  const [site, setSite] = useState<Storefront | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (!/^[a-z0-9-]{1,80}$/.test(siteSlug)) {
      setError("Endereço de cardápio inválido."); setLoaded(true); return;
    }
    void (async () => {
      try {
        const res = await fetch(`/backend/api/public/custom-storefronts/${encodeURIComponent(siteSlug)}`,
          { cache: "no-store" });
        if (!res.ok) throw Error("Este site ainda não foi publicado.");
        const data: Storefront = await res.json();
        const catalogRes = await fetch(`/api/custom-storefront/catalog?store=${encodeURIComponent(data.storeSlug)}`,
          { cache: "no-store" });
        if (!catalogRes.ok) throw Error("Não foi possível carregar o cardápio do PizzaSystem.");
        const menu: Catalog = await catalogRes.json();
        if (active) { setSite(data); setCatalog(menu); }
      } catch (e) { if (active) setError(e instanceof Error ? e.message : "Erro ao abrir cardápio"); }
      finally { if (active) setLoaded(true); }
    })();
    return () => { active = false; };
  }, [siteSlug]);

  const onMessage = useCallback((event: MessageEvent) => {
    if (!frame.current || event.source !== frame.current.contentWindow ||
        event.origin !== "null" || !site || !catalog) return;
    const request = event.data as { type?: string; items?: unknown } | null;
    if (!request) return;
    if (request.type === "orbitta:ready") {
      frame.current.contentWindow?.postMessage({
        type: "orbitta:init",
        payload: { storeSlug: site.storeSlug, displayName: site.displayName,
          products: catalog.products, crusts: catalog.crusts,
          status: catalog.status, profile: catalog.profile },
      }, "*");
    }
    if (request.type === "orbitta:checkout") {
      try {
        const items = validateCart(request.items, catalog);
        const json = JSON.stringify(items).replace(/[\u007f-\uffff]/g,
          char => "\\u" + char.charCodeAt(0).toString(16).padStart(4,"0"));
        const token = btoa(json).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
        if (token.length > 5500) throw Error("Pedido longo demais. Reduza a quantidade de itens.");
        const url = new URL("https://pizzasystem.orbitta.space/checkout");
        url.searchParams.set("store",site.storeSlug);
        url.searchParams.set("importCart",token);
        window.location.assign(url.toString());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível transferir o pedido.");
      }
    }
  },[site,catalog]);
  useEffect(() => { window.addEventListener("message",onMessage);
    return () => window.removeEventListener("message",onMessage); },[onMessage]);

  return <main className="min-h-screen bg-[#080c13] text-white">
    {!loaded && <div className="grid min-h-screen place-items-center text-sm text-white/50">Carregando cardápio...</div>}
    {error && <div role="alert" className="fixed left-1/2 top-5 z-50 w-[min(560px,94vw)] -translate-x-1/2 rounded-2xl border border-red-200/30 bg-red-950/95 p-4 text-sm shadow-2xl">
      {error}<button onClick={() => setError("")} className="ml-4 underline">Fechar</button></div>}
    {loaded && !site && <div className="grid min-h-screen place-items-center p-8 text-center text-white/60">Site não disponível.</div>}
    {site && catalog && <iframe ref={frame} title={site.displayName} srcDoc={makeDoc(site)}
      sandbox="allow-scripts" referrerPolicy="no-referrer"
      className="h-screen min-h-[680px] w-full border-0 bg-white"
      loading="eager" />}
  </main>;
}
