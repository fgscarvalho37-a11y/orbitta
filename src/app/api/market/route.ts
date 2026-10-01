import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function resolveMarket(country: string | null) {
  const normalized = country?.trim().toUpperCase();

  if (normalized === "BR") {
    return {
      marketCode: "BR",
      countryCode: "BR",
      currency: "BRL",
    };
  }

  return {
    marketCode: "US",
    countryCode: normalized || "US",
    currency: "USD",
  };
}

export async function GET() {
  const requestHeaders = await headers();

  const country =
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    null;

  const market = resolveMarket(country);

  return NextResponse.json(market, {
    headers: {
      "cache-control": "private, no-store, max-age=0",
      "vary": "x-vercel-ip-country, cf-ipcountry",
    },
  });
}
