package space.orbitta.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record CatalogPlanResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal monthlyPrice,
        BigDecimal setupPrice,
        String currency,
        boolean active,
        int displayOrder,
        List<CatalogPlanPriceResponse> regionalPrices
) {
}