"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AppLocale =
  | "pt-BR"
  | "en-US";

export type MarketCode =
  | "BR"
  | "US"
  | "GB"
  | "AU"
  | "EU"
  | "CA";

type LanguageContextValue = {
  locale: AppLocale;
  isEnglish: boolean;
  market: MarketCode;
  setMarket: (
    market: MarketCode
  ) => void;
  setLocale: (
    locale: AppLocale
  ) => void;
  text: (
    pt: string,
    en: string
  ) => string;
};

const LanguageContext =
  createContext<LanguageContextValue | null>(
    null
  );

const STORAGE_KEY =
  "orbitta-language";

const MARKET_STORAGE_KEY =
  "orbitta-market";

const VALID_MARKETS:
  MarketCode[] = [
    "BR",
    "US",
    "GB",
    "AU",
    "EU",
    "CA",
  ];

function isMarketCode(
  value:
    | string
    | null
    | undefined
): value is MarketCode {
  return Boolean(
    value &&
      VALID_MARKETS.includes(
        value as MarketCode
      )
  );
}

function localeForMarket(
  market: MarketCode
): AppLocale {
  return market === "BR"
    ? "pt-BR"
    : "en-US";
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    locale,
    setLocaleState,
  ] =
    useState<AppLocale>(
      "pt-BR"
    );

  const [
    market,
    setMarketState,
  ] =
    useState<MarketCode>(
      "BR"
    );

  useEffect(() => {
    let active = true;

    const savedMarket =
      window.localStorage.getItem(
        MARKET_STORAGE_KEY
      );

    const savedLocale =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (
      isMarketCode(
        savedMarket
      )
    ) {
      setMarketState(
        savedMarket
      );

      const nextLocale:
        AppLocale =
        savedLocale === "pt-BR" ||
        savedLocale === "en-US"
          ? savedLocale
          : localeForMarket(
              savedMarket
            );

      setLocaleState(
        nextLocale
      );

      document.documentElement.lang =
        nextLocale;

      return () => {
        active = false;
      };
    }

    async function detectMarket() {
      try {
        const response =
          await fetch(
            "/api/market",
            {
              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "market detection failed"
          );
        }

        const data:
          {
            marketCode?: string;
          } =
          await response.json();

        if (
          !active ||
          !isMarketCode(
            data.marketCode
          )
        ) {
          return;
        }

        const detectedMarket =
          data.marketCode;

        const detectedLocale =
          localeForMarket(
            detectedMarket
          );

        setMarketState(
          detectedMarket
        );

        setLocaleState(
          detectedLocale
        );

        document.documentElement.lang =
          detectedLocale;
      } catch {
        if (!active) {
          return;
        }

        const browserLocale =
          navigator.language
            .toLowerCase();

        const detectedLocale:
          AppLocale =
          browserLocale.startsWith(
            "pt"
          )
            ? "pt-BR"
            : "en-US";

        setLocaleState(
          detectedLocale
        );

        document.documentElement.lang =
          detectedLocale;
      }
    }

    void detectMarket();

    return () => {
      active = false;
    };
  }, []);

  function setMarket(
    nextMarket:
      MarketCode
  ) {
    setMarketState(
      nextMarket
    );

    window.localStorage.setItem(
      MARKET_STORAGE_KEY,
      nextMarket
    );

    const nextLocale =
      localeForMarket(
        nextMarket
      );

    setLocaleState(
      nextLocale
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      nextLocale
    );

    document.documentElement.lang =
      nextLocale;
  }

  function setLocale(
    nextLocale:
      AppLocale
  ) {
    setLocaleState(
      nextLocale
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      nextLocale
    );

    document.documentElement.lang =
      nextLocale;
  }

  const value =
    useMemo<LanguageContextValue>(
      () => ({
        locale,
        isEnglish:
          locale ===
          "en-US",
        market,
        setMarket,
        setLocale,
        text: (
          pt,
          en
        ) =>
          locale ===
          "en-US"
            ? en
            : pt,
      }),
      [
        locale,
        market,
      ]
    );

  return (
    <LanguageContext.Provider
      value={
        value
      }
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(
      LanguageContext
    );

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
