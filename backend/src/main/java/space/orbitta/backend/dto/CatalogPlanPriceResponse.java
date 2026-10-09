package space.orbitta.backend.dto;

import space.orbitta.backend.entity.CatalogPlanPrice;

import java.math.BigDecimal;

public record CatalogPlanPriceResponse(
        Long id,
        String regionCode,
        String currency,
        BigDecimal monthlyPrice,
        BigDecimal regularMonthlyPrice,
        BigDecimal setupPrice,
        boolean active,
        int displayOrder
) {

    public static CatalogPlanPriceResponse from(
            CatalogPlanPrice price
    ) {
        return new CatalogPlanPriceResponse(
                price.getId(),
                price.getRegionCode(),
                price.getCurrency(),
                price.getMonthlyPrice(),
                price.getRegularMonthlyPrice(),
                price.getSetupPrice(),
                price.isActive(),
                price.getDisplayOrder()
        );
    }
}
