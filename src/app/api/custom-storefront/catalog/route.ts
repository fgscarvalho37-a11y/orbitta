import { NextRequest, NextResponse } from "next/server";

// Server-side proxy prevents cross-origin cookies and keeps the API host
// under Orbitta control. Only public, scoped PizzaSystem endpoints are used.
export const dynamic = "force-dynamic";
const SERVICE = "https://pizzasystem-api.onrender.com";
const slugPattern = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export async function GET(request: NextRequest) {
  const store = request.nextUrl.searchParams.get("store")?.trim().toLowerCase() ?? "";
  if (!slugPattern.test(store)) {
    return NextResponse.json({ error: "Invalid store" }, { status: 400 });
  }
  const urls = [
    `${SERVICE}/api/products/available?store=${encodeURIComponent(store)}`,
    `${SERVICE}/api/crusts/active?store=${encodeURIComponent(store)}`,
    `${SERVICE}/api/store/status?store=${encodeURIComponent(store)}`,
    `${SERVICE}/api/store/profile?store=${encodeURIComponent(store)}`,
  ];
  try {
    const responses = await Promise.all(urls.map(url => fetch(url, {
      cache: "no-store", signal: AbortSignal.timeout(12000),
      headers: { Accept: "application/json" },
    })));
    if (responses.some(response => !response.ok)) {
      return NextResponse.json({ error: "Pizzaria indisponível no PizzaSystem" },
        { status: 502 });
    }
    const [products, crusts, status, profile] = await Promise.all(
      responses.map(response => response.json())
    );
    if (!Array.isArray(products) || !Array.isArray(crusts)) {
      return NextResponse.json({ error: "Invalid store response" }, { status: 502 });
    }
    // PizzaSystem returns some images as relative /uploads paths.
    // Resolve them against the trusted PizzaSystem frontend, not orbitta.space.
    const image = (value: unknown) => {
      if (typeof value !== "string" || !value) return null;
      if (value.startsWith("/uploads/")) return "https://pizzasystem.orbitta.space" + value;
      if (/^https:\/\//i.test(value)) return value;
      return null;
    };
    const liveProducts = products.map((p: Record<string, unknown>) => ({
      ...p, imageUrl: image(p.imageUrl),
    }));
    const liveProfile = profile && typeof profile === "object" ? {
      ...profile, logoUrl: image(profile.logoUrl), coverImageUrl: image(profile.coverImageUrl),
    } : profile;
    return NextResponse.json({ storeSlug: store, products: liveProducts, crusts, status, profile: liveProfile },
      { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "PizzaSystem temporariamente indisponível" }, { status: 503 });
  }
}
