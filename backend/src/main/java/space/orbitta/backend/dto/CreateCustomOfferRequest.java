package space.orbitta.backend.dto;

import space.orbitta.backend.entity.CustomOfferType;

import java.math.BigDecimal;

public record CreateCustomOfferRequest(
        CustomOfferType offerType,
        Long planId,
        String title,
        String description,
        BigDecimal monthlyPrice,
        BigDecimal setupPrice,
        String currency,
        Integer validDays
) {
}
