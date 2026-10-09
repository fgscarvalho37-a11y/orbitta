package space.orbitta.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CommercialSettingsResponse(
        BigDecimal customSiteIntegrationFeeUsd,
        BigDecimal standaloneSitePriceUsd,
        BigDecimal standaloneSiteMonthlyPriceUsd,
        BigDecimal bundleMonthlyPriceUsd,
        BigDecimal siteRegularMonthlyPriceUsd,
        BigDecimal bundleRegularMonthlyPriceUsd,
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
        String bundleFeaturesEn,
        String currency,
        LocalDateTime updatedAt
) {
}
