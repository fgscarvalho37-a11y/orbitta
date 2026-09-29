package space.orbitta.backend.dto;

import java.math.BigDecimal;

public record UpsertCatalogPlanPriceRequest(
        BigDecimal monthlyPrice,
        BigDecimal setupPrice,
        Boolean active
) {
}
