"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CircleHelp, Globe2, Layers3, LayoutTemplate, Loader2, Pizza, RefreshCw, Save } from "lucide-react";
import { secureFetch } from "@/lib/secureFetch";
import { useLanguage } from "@/i18n/LanguageProvider";

type PlanKey = "site" | "pizza" | "bundle";
type Settings = {
  standaloneSiteMonthlyPriceUsd: number;
  bundleMonthlyPriceUsd: number;
  siteRegularMonthlyPriceUsd: number;
  bundleRegularMonthlyPriceUsd: number;
  siteDescriptionPt: string | null; siteDescriptionEn: string | null;
  siteFeaturesPt: string | null; siteFeaturesEn: string | null;
  pizzaDescriptionPt: string | null; pizzaDescriptionEn: string | null;
  pizzaFeaturesPt: string | null; pizzaFeaturesEn: string | null;
  bundleDescriptionPt: string | null; bundleDescriptionEn: string | null;
  bundleFeaturesPt: string | null; bundleFeaturesEn: string | null;
};
type RegionalPrice = {
  regionCode: string; currency: string; monthlyPrice: number;
  regularMonthlyPrice: number | null; setupPrice: number; active: boolean;
};
type Product = { id: number; slug: string; active: boolean; plans: { id: number; active: boolean; regionalPrices: RegionalPrice[] }[] };
type Draft = { price: string; regularPrice: string; descriptionPt: string; descriptionEn: string; featuresPt: string; featuresEn: string };
type ContentKey = Exclude<keyof Settings, "standaloneSiteMonthlyPriceUsd" | "bundleMonthlyPriceUsd">;
const MARKETS = [
  { code: "BR", currency: "BRL", pt: "Brasil", en: "Brazil" },
  { code: "US", currency: "USD", pt: "Estados Unidos", en: "United States" },
  { code: "GB", currency: "GBP", pt: "Reino Unido", en: "United Kingdom" },
  { code: "AU", currency: "AUD", pt: "Austrália", en: "Australia" },
  { code: "EU", currency: "EUR", pt: "Europa", en: "Europe" },
] as const;
const DEFAULTS: Record<PlanKey, Omit<Draft, "price">> = {
  site: {
    descriptionPt: "Um site profissional criado para representar sua marca.",
    descriptionEn: "A professional website designed for your brand.",
    featuresPt: "Identidade visual personalizada\nSite responsivo\nContato e formulário",
    featuresEn: "Custom branded design\nMobile-friendly website\nContact form",
  },
  pizza: {
    descriptionPt: "Cardápio digital, pedidos e gestão para sua pizzaria.",
    descriptionEn: "Online menu, orders and management for your pizzeria.",
    featuresPt: "Cardápio e pedidos\nCozinha e acompanhamento\nEntrega e retirada",
    featuresEn: "Online menu and ordering\nKitchen and tracking\nDelivery and pickup",
  },
  bundle: {
    descriptionPt: "Site personalizado integrado ao PizzaSystem.",
    descriptionEn: "A custom website integrated with PizzaSystem.",
    featuresPt: "Tudo do PizzaSystem\nSite personalizado integrado\nAtendimento e entrega pelo painel",
    featuresEn: "Everything in PizzaSystem\nIntegrated custom website\nPrivate project chat and delivery",
  },
};
const EMPTY = (key: PlanKey): Draft => ({ price: "", regularPrice: "", ...DEFAULTS[key] });
function decimal(value: string) {
  const num = Number(value.trim().replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(num) ? num : NaN;
}
function inputPrice(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value).replace(".", ",");
}
function getCopy(settings: Settings, key: PlanKey, name: "DescriptionPt" | "DescriptionEn" | "FeaturesPt" | "FeaturesEn") {
  const prop = `${key}${name}` as ContentKey;
  const raw = settings[prop];
  return raw === null || raw === undefined ? DEFAULTS[key][(name.charAt(0).toLowerCase() + name.slice(1)) as keyof Omit<Draft,"price">] : raw;
}

export default function OrbittaFixedPlansAdmin() {
  const { text } = useLanguage();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [region, setRegion] = useState("US");
  const [drafts, setDrafts] = useState<Record<PlanKey, Draft>>({
    site: EMPTY("site"), pizza: EMPTY("pizza"), bundle: EMPTY("bundle"),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<PlanKey | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pizzaPlan = products.find((p) => p.slug === "pizzasystem" && p.active)?.plans.find((p) => p.active);
  const regional = pizzaPlan?.regionalPrices?.find((p) => p.regionCode === region);
  const market = MARKETS.find((m) => m.code === region) ?? MARKETS[1];

  const load = useCallback(async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const [settingsResult, productResult] = await Promise.all([
        secureFetch("/backend/api/admin/commercial-settings", { credentials: "include", cache: "no-store" }),
        secureFetch("/backend/api/admin/catalog/products", { credentials: "include", cache: "no-store" }),
      ]);
      if (settingsResult.status === 401 || settingsResult.status === 403) {
        window.location.assign("/login");
        return;
      }
      if (!settingsResult.ok || !productResult.ok) throw Error(text("Não foi possível carregar os planos.", "Could not load plans."));
      const incoming: Settings = await settingsResult.json();
      const catalog: Product[] = await productResult.json();
      setSettings(incoming); setProducts(catalog);
      const mainPlan = catalog.find(p => p.slug === "pizzasystem" && p.active)?.plans.find(p => p.active);
      const us = mainPlan?.regionalPrices.find(p => p.regionCode === "US");
      setDrafts({
        site: { price: inputPrice(incoming.standaloneSiteMonthlyPriceUsd), regularPrice: inputPrice(incoming.siteRegularMonthlyPriceUsd), ...{
          descriptionPt: getCopy(incoming, "site", "DescriptionPt"), descriptionEn: getCopy(incoming, "site", "DescriptionEn"),
          featuresPt: getCopy(incoming, "site", "FeaturesPt"), featuresEn: getCopy(incoming, "site", "FeaturesEn"),
        }},
        pizza: { price: inputPrice(us?.monthlyPrice), regularPrice: inputPrice(us?.regularMonthlyPrice), ...{
          descriptionPt: getCopy(incoming, "pizza", "DescriptionPt"), descriptionEn: getCopy(incoming, "pizza", "DescriptionEn"),
          featuresPt: getCopy(incoming, "pizza", "FeaturesPt"), featuresEn: getCopy(incoming, "pizza", "FeaturesEn"),
        }},
        bundle: { price: inputPrice(incoming.bundleMonthlyPriceUsd), regularPrice: inputPrice(incoming.bundleRegularMonthlyPriceUsd), ...{
          descriptionPt: getCopy(incoming, "bundle", "DescriptionPt"), descriptionEn: getCopy(incoming, "bundle", "DescriptionEn"),
          featuresPt: getCopy(incoming, "bundle", "FeaturesPt"), featuresEn: getCopy(incoming, "bundle", "FeaturesEn"),
        }},
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally { setLoading(false); }
  }, [text]);

  useEffect(() => { void load(); }, [load]);

  function changeMarket(value: string) {
    setRegion(value);
    const plan = products.find(p => p.slug === "pizzasystem" && p.active)?.plans.find(p => p.active);
    const pricing = plan?.regionalPrices.find(p => p.regionCode === value);
    setDrafts(current => ({ ...current, pizza: {
      ...current.pizza, price: inputPrice(pricing?.monthlyPrice),
      regularPrice: inputPrice(pricing?.regularMonthlyPrice),
    } }));
  }
  function edit(key: PlanKey, field: keyof Draft, value: string) {
    setDrafts(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    setSuccess("");
  }

  async function save(key: PlanKey) {
    if (!settings || saving) return;
    const draft = drafts[key];
    const price = decimal(draft.price);
    const regularPrice = draft.regularPrice.trim() ? decimal(draft.regularPrice) : 0;
    if (!Number.isFinite(regularPrice) || regularPrice < 0) {
      setError(text("Informe um preço riscado válido.", "Enter a valid crossed-out price.")); return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError(text("Informe uma mensalidade maior que zero.", "Enter a monthly price above zero.")); return;
    }
    if (draft.descriptionPt.length > 600 || draft.descriptionEn.length > 600 ||
        draft.featuresPt.length > 1600 || draft.featuresEn.length > 1600 ||
        !draft.descriptionPt.trim() || !draft.descriptionEn.trim() ||
        !draft.featuresPt.trim() || !draft.featuresEn.trim()) {
      setError(text("Preencha as descrições e funcionalidades (limite: 600 e 1600 caracteres).",
        "Complete descriptions and features (limits: 600 and 1600 characters).")); return;
    }
    if (key === "pizza" && !pizzaPlan) {
      setError(text("O produto PizzaSystem precisa ter um plano ativo no catálogo.", "PizzaSystem needs an active catalog plan."));
      return;
    }
    setSaving(key); setError(""); setSuccess("");
    try {
      const descriptions = {
        [`${key}DescriptionPt`]: draft.descriptionPt,
        [`${key}DescriptionEn`]: draft.descriptionEn,
        [`${key}FeaturesPt`]: draft.featuresPt,
        [`${key}FeaturesEn`]: draft.featuresEn,
      };
      const payload: Record<string, string | number> = { ...descriptions };
      if (key === "site") {
        payload.standaloneSiteMonthlyPriceUsd = price;
        payload.siteRegularMonthlyPriceUsd = regularPrice;
      }
      if (key === "bundle") {
        payload.bundleMonthlyPriceUsd = price;
        payload.bundleRegularMonthlyPriceUsd = regularPrice;
      }
      if (key === "pizza") {
        const pricing = await secureFetch(
          `/backend/api/admin/catalog/plans/${pizzaPlan!.id}/prices/${region}`, {
            method: "PUT", credentials: "include",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              monthlyPrice: price,
              regularMonthlyPrice: regularPrice > 0 ? regularPrice : null,
              setupPrice: 0, active: true,
            }),
          }
        );
        if (!pricing.ok) {
          const data = await pricing.json().catch(() => null);
          throw Error(data?.message ?? text("Falha ao salvar o preço do PizzaSystem.", "Could not save PizzaSystem price."));
        }
      }
      const response = await secureFetch("/backend/api/admin/commercial-settings", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw Error(data?.message ?? text("Falha ao salvar descrição e funcionalidades.", "Could not save descriptions and features."));
      }
      setSettings(await response.json());
      setSuccess(text("Plano salvo. As alterações aparecem na vitrine.", "Plan saved. Updates appear on the storefront."));
      // Refresh catalog prices without clearing the current form.
      if (key === "pizza") {
        const res = await secureFetch("/backend/api/admin/catalog/products", { credentials: "include", cache: "no-store" });
        if (res.ok) setProducts(await res.json());
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally { setSaving(null); }
  }

  const cards = [
    { key: "site" as PlanKey, name: text("Site", "Website"), desc: text("Site avulso", "Standalone website"), currency: "USD", Icon: LayoutTemplate },
    { key: "pizza" as PlanKey, name: "PizzaSystem", desc: text("Sistema de pedidos", "Online ordering"), currency: market.currency, Icon: Pizza },
    { key: "bundle" as PlanKey, name: text("Site + PizzaSystem", "Website + PizzaSystem"), desc: text("Pacote completo", "Complete bundle"), currency: "USD", Icon: Layers3 },
  ];
  return (
    <main className="mx-auto max-w-[1460px] px-6 pb-24 pt-12 text-white lg:px-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/55">{text("Catálogo de assinaturas", "Subscription catalog")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{text("Seus 3 planos", "Your 3 plans")}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
            {text("Três ofertas fixas. Edite mensalidade, descrição e funcionalidades de cada uma. Sem taxa inicial nem cobrança única.",
              "Three fixed plans. Edit the monthly price, description and features of each. No setup or one-time charges.")}
          </p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading || !!saving}
          className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs text-white/65 hover:text-white">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {text("Atualizar", "Refresh")}
        </button>
      </div>

      {error && <div role="alert" className="mt-7 rounded-2xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-200">{error}</div>}
      {success && <div role="status" className="mt-7 flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-sm text-emerald-200"><Check size={17} />{success}</div>}
      {loading ? <div className="mt-14 flex gap-3 text-sm text-white/45"><Loader2 className="animate-spin" />{text("Carregando planos...", "Loading plans...")}</div> :
        <div className="mt-9 grid items-start gap-5 xl:grid-cols-3">
          {cards.map(({ key, name, desc, currency, Icon }) => {
            const draft = drafts[key];
            return <section key={key} className="overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#0b1423]">
              <div className="border-b border-white/[0.07] p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200/20 bg-violet-200/5 text-violet-200"><Icon size={22} /></div>
                  <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/50">{text("Plano mensal", "Monthly plan")}</span>
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">{name}</h2>
                <p className="mt-2 text-xs text-white/45">{desc}</p>
              </div>
              <div className="space-y-5 p-6">
                {key === "pizza" && <>
                  <label className="block text-xs font-semibold text-white/65">{text("Região do preço", "Price region")}</label>
                  <select value={region} onChange={(event) => changeMarket(event.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#111c2a] px-3 text-sm text-white">
                    {MARKETS.map(m => <option key={m.code} value={m.code}>{text(m.pt, m.en)} ({m.currency})</option>)}
                  </select>
                  {!pizzaPlan && <p className="flex gap-2 text-xs leading-5 text-amber-100/70"><CircleHelp size={15} className="shrink-0" />
                    {text("Ative o plano PizzaSystem no catálogo existente para liberar o preço regional.",
                      "Activate the existing PizzaSystem catalog plan to enable regional pricing.")}</p>}
                </>}
                <label className="block">
                  <span className="text-xs font-medium text-white/65">{text("Mensalidade", "Monthly price")} ({currency})</span>
                  <input inputMode="decimal" value={draft.price} onChange={event => edit(key, "price", event.target.value)}
                    placeholder="79,90" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-lg font-semibold outline-none focus:border-violet-200/40" />
                  <span className="mt-2 block text-[11px] text-white/35">{text("Cobrança mensal. Sem implantação.", "Monthly billing. No setup fee.")}</span>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-white/65">{text("Preço riscado (opcional)", "Regular price (optional)")} ({currency})</span>
                  <input inputMode="decimal" value={draft.regularPrice} onChange={event => edit(key, "regularPrice", event.target.value)}
                    placeholder="99,90" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm outline-none focus:border-violet-200/40" />
                  <span className="mt-2 block text-[11px] text-white/35">{text("Só aparece se for maior que a mensalidade. Deixe vazio para ocultar.", "Only shown when above the monthly price. Leave empty to hide.")}</span>
                </label>
                {(["Pt", "En"] as const).map(lang => {
                  const description = `description${lang}` as keyof Draft;
                  const features = `features${lang}` as keyof Draft;
                  return <div key={lang} className="space-y-4 border-t border-white/[0.06] pt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-200/65">{lang === "Pt" ? "Português" : "English"}</p>
                    <label className="block">
                      <span className="text-xs text-white/65">{text("Descrição na vitrine", "Storefront description")}</span>
                      <textarea value={draft[description]} onChange={event => edit(key, description, event.target.value)}
                        maxLength={600} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 outline-none focus:border-violet-200/40" />
                    </label>
                    <label className="block">
                      <span className="text-xs text-white/65">{text("O que está incluído — um item por linha", "What's included — one feature per line")}</span>
                      <textarea value={draft[features]} onChange={event => edit(key, features, event.target.value)}
                        maxLength={1600} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 outline-none focus:border-violet-200/40" />
                    </label>
                  </div>;
                })}
                <button type="button" onClick={() => void save(key)} disabled={!!saving || (key === "pizza" && !pizzaPlan)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-200 text-sm font-semibold text-[#07101c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
                  {saving === key ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                  {text("Salvar plano", "Save plan")}
                </button>
              </div>
            </section>;
          })}
        </div>}
      <p className="mt-7 text-center text-xs leading-6 text-white/35">
        {text("Os nomes e os três tipos de plano são fixos. As alterações são salvas no backend, não apenas no navegador.",
          "The three plan types and names are fixed. Updates are saved on the server, not just in this browser.")}
      </p>
    </main>
  );
}
