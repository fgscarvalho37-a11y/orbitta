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

        var user =
                offer.getUser();

        return new CustomOfferResponse(
                offer.getId(),
                offer.getToken(),
                offer.getOfferType().name(),
                user != null
                        ? user.getId()
                        : null,
                user != null
                        ? (
                                user.getFirstName() +
                                " " +
                                user.getLastName()
                        ).trim()
                        : null,
                user != null
                        ? user.getEmail()
                        : null,
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
