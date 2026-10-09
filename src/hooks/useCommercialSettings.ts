"use client";

import {
  useEffect,
  useState,
} from "react";

const API_URL =
  "/backend";

type CommercialSettings = {
  customSiteIntegrationFeeUsd:
    number;
  standaloneSitePriceUsd: number;
  standaloneSiteMonthlyPriceUsd: number;
  bundleMonthlyPriceUsd: number;
  siteRegularMonthlyPriceUsd: number;
  bundleRegularMonthlyPriceUsd: number;
  siteDescriptionPt: string | null;
  siteDescriptionEn: string | null;
  siteFeaturesPt: string | null;
  siteFeaturesEn: string | null;
  pizzaDescriptionPt: string | null;
  pizzaDescriptionEn: string | null;
  pizzaFeaturesPt: string | null;
  pizzaFeaturesEn: string | null;
  bundleDescriptionPt: string | null;
  bundleDescriptionEn: string | null;
  bundleFeaturesPt: string | null;
  bundleFeaturesEn: string | null;
  currency:
    string;
  updatedAt:
    string | null;
};

export function useCommercialSettings() {
  const [
    settings,
    setSettings,
  ] =
    useState<CommercialSettings>({
      customSiteIntegrationFeeUsd:
        200,
      standaloneSitePriceUsd: 0,
      standaloneSiteMonthlyPriceUsd: 0,
      bundleMonthlyPriceUsd: 0,
      siteRegularMonthlyPriceUsd: 0,
      bundleRegularMonthlyPriceUsd: 0,
      siteDescriptionPt: null,
      siteDescriptionEn: null,
      siteFeaturesPt: null,
      siteFeaturesEn: null,
      pizzaDescriptionPt: null,
      pizzaDescriptionEn: null,
      pizzaFeaturesPt: null,
      pizzaFeaturesEn: null,
      bundleDescriptionPt: null,
      bundleDescriptionEn: null,
      bundleFeaturesPt: null,
      bundleFeaturesEn: null,
      currency:
        "USD",
      updatedAt:
        null,
    });

  useEffect(() => {
    let active =
      true;

    async function load() {
      try {
        const response =
          await fetch(
            `${API_URL}/api/commercial-settings`,
            {
              cache:
                "no-store",
            }
          );

        if (
          !active ||
          !response.ok
        ) {
          return;
        }

        const data:
          CommercialSettings =
          await response.json();

        setSettings(
          data
        );
      } catch {
      }
    }

    void load();

    return () => {
      active =
        false;
    };
  }, []);

  return settings;
}

export function formatUsd(
  value:
    number,
  locale:
    string
) {
  return new Intl.NumberFormat(
    locale,
    {
      style:
        "currency",
      currency:
        "USD",
      minimumFractionDigits:
        0,
      maximumFractionDigits:
        2,
    }
  ).format(
    value
  );
}
