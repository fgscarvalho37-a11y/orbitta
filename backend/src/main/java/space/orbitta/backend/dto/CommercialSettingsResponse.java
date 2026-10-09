package space.orbitta.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CommercialSettingsResponse(
        BigDecimal customSiteIntegrationFeeUsd,
        BigDecimal standaloneSitePriceUsd,
        String currency,
        LocalDateTime updatedAt
) {
}
