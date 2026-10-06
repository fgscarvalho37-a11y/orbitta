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

  if (
    normalized === "GB" ||
    normalized === "UK"
  ) {
    return {
      marketCode: "GB",
      countryCode: "GB",
      currency: "GBP",
    };
  }

  if (normalized === "AU") {
    return {
      marketCode: "AU",
      countryCode: "AU",
      currency: "AUD",
    };
  }

  if (normalized === "CA") {
    return {
      marketCode: "CA",
      countryCode: "CA",
      currency: "CAD",
    };
  }

  const euroCountries = new Set([
    "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE",
    "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
  ]);

  if (normalized && euroCountries.has(normalized)) {
    return {
      marketCode: "EU",
      countryCode: normalized,
      currency: "EUR",
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
