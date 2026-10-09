package space.orbitta.backend.dto;

import java.math.BigDecimal;

public record UpdateCommercialSettingsRequest(
        BigDecimal customSiteIntegrationFeeUsd,
        BigDecimal standaloneSitePriceUsd
) {
}
