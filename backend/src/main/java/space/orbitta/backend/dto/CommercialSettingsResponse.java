package space.orbitta.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CommercialSettingsResponse(
        BigDecimal customSiteIntegrationFeeUsd,
        BigDecimal standaloneSitePriceUsd,
        BigDecimal standaloneSiteMonthlyPriceUsd,
        String currency,
        LocalDateTime updatedAt
) {
}
