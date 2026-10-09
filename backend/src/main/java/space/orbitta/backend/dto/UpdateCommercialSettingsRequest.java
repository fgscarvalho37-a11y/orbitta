package space.orbitta.backend.dto;

import java.math.BigDecimal;

public record UpdateCommercialSettingsRequest(
        BigDecimal customSiteIntegrationFeeUsd,
        BigDecimal standaloneSitePriceUsd,
        BigDecimal standaloneSiteMonthlyPriceUsd,
        BigDecimal bundleMonthlyPriceUsd,
        String siteDescriptionPt,
        String siteDescriptionEn,
        String siteFeaturesPt,
        String siteFeaturesEn,
        String pizzaDescriptionPt,
        String pizzaDescriptionEn,
        String pizzaFeaturesPt,
        String pizzaFeaturesEn,
        String bundleDescriptionPt,
        String bundleDescriptionEn,
        String bundleFeaturesPt,
        String bundleFeaturesEn
) {
}
