package space.orbitta.backend.dto;

import java.math.BigDecimal;

public record UpsertCatalogPlanPriceRequest(
        BigDecimal monthlyPrice,
        BigDecimal regularMonthlyPrice,
        BigDecimal setupPrice,
        Boolean active
) {
}
