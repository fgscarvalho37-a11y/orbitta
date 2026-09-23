package space.orbitta.backend.dto;

import java.math.BigDecimal;

public record UpdateCatalogPlanRequest(
        String name,
        String slug,
        String description,
        BigDecimal monthlyPrice,
        BigDecimal setupPrice,
        String currency,
        Boolean active,
        Integer displayOrder
) {
}