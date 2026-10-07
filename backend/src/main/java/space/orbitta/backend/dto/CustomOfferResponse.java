package space.orbitta.backend.dto;

import space.orbitta.backend.entity.CustomOffer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CustomOfferResponse(
        Long id,
        String token,
        String offerType,
        Long userId,
        String clientName,
        String clientEmail,
        Long planId,
        String title,
        String description,
        BigDecimal monthlyPrice,
        BigDecimal setupPrice,
        BigDecimal totalInitialPrice,
        String currency,
        boolean oneTimeOnly,
        boolean active,
        boolean expired,
        LocalDateTime expiresAt,
        Long checkoutId,
        LocalDateTime createdAt
) {

    public static CustomOfferResponse from(
            CustomOffer offer
    ) {
        BigDecimal monthly =
                offer.getMonthlyPrice() == null
                        ? BigDecimal.ZERO
                        : offer.getMonthlyPrice();

        BigDecimal setup =
                offer.getSetupPrice() == null
                        ? BigDecimal.ZERO
                        : offer.getSetupPrice();

        boolean expired =
                offer.getExpiresAt() != null &&
                offer.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        );

        return new CustomOfferResponse(
                offer.getId(),
                offer.getToken(),
                offer.getOfferType().name(),
                offer.getUser().getId(),
                (
                        offer.getUser().getFirstName() +
                        " " +
                        offer.getUser().getLastName()
                ).trim(),
                offer.getUser().getEmail(),
                offer.getCatalogPlan() != null
                        ? offer.getCatalogPlan().getId()
                        : null,
                offer.getTitle(),
                offer.getDescription(),
                monthly,
                setup,
                monthly.add(setup),
                offer.getCurrency(),
                offer.isOneTimeOnly(),
                offer.isActive(),
                expired,
                offer.getExpiresAt(),
                offer.getCheckoutId(),
                offer.getCreatedAt()
        );
    }
}
