"use client";

import {
  useLanguage,
  type MarketCode,
} from "@/i18n/LanguageProvider";

const markets: Array<{
  code: MarketCode;
  flag: string;
  label: string;
}> = [
  {
    code: "BR",
    flag: "🇧🇷",
    label: "Brasil",
  },
  {
    code: "US",
    flag: "🇺🇸",
    label: "United States",
  },
  {
    code: "GB",
    flag: "🇬🇧",
    label: "United Kingdom",
  },
  {
    code: "AU",
    flag: "🇦🇺",
    label: "Australia",
  },
];

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const {
    market,
    setMarket,
  } =
    useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 text-[10px] font-semibold tracking-[0.04em] text-white/45"
      aria-label="Country / region"
    >
      {markets.map(
        (item) => (
          <button
            key={
              item.code
            }
            type="button"
            onClick={() =>
              setMarket(
                item.code
              )
            }
            className={
              market ===
              item.code
                ? "rounded-full bg-white px-2.5 py-1 text-[#07101c]"
                : "rounded-full px-2.5 py-1 transition hover:text-white"
            }
            aria-pressed={
              market ===
              item.code
            }
            title={
              item.label
            }
          >
            <span
              aria-hidden="true"
            >
              {item.flag}
            </span>

            {!compact && (
              <span className="ml-1.5">
                {item.code}
              </span>
            )}
          </button>
        )
      )}

      <span className="sr-only">
        Country and region selector
      </span>
    </div>
  );
}
