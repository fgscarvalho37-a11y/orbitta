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
