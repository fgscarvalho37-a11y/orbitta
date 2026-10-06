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

export type MarketCode = "BR" | "US" | "GB";

type LanguageContextValue = {
  locale: AppLocale;
  isEnglish: boolean;
  market: MarketCode;
  setMarket: (market: MarketCode) => void;
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

  const [market, setMarketState] =
    useState<MarketCode>("BR");

  useEffect(() => {
    const savedMarket =
      window.localStorage.getItem(MARKET_STORAGE_KEY);

    if (savedMarket === "BR" || savedMarket === "US" || savedMarket === "GB") {
      setMarketState(savedMarket);
    }

    const saved =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (
      saved === "pt-BR" ||
      saved === "en-US"
    ) {
      setLocaleState(
        saved
      );

      document.documentElement.lang =
        saved;

      return;
    }

    const detected:
      AppLocale =
      navigator.language
        .toLowerCase()
        .startsWith("pt")
        ? "pt-BR"
        : "en-US";

    setLocaleState(
      detected
    );

    document.documentElement.lang =
      detected;
  }, []);

  function setMarket(nextMarket: MarketCode) {
    setMarketState(nextMarket);
    window.localStorage.setItem(MARKET_STORAGE_KEY, nextMarket);

    const nextLocale: AppLocale =
      nextMarket === "BR" ? "pt-BR" : "en-US";

    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale;
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
