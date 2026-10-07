package space.orbitta.backend.dto;

import space.orbitta.backend.entity.CustomOffer;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PublicCustomOfferResponse(
        String token,
        String offerType,
        String title,
        String description,
        BigDecimal monthlyPrice,
        BigDecimal setupPrice,
        BigDecimal totalInitialPrice,
        String currency,
        boolean oneTimeOnly,
        boolean available,
        LocalDateTime expiresAt
) {

    public static PublicCustomOfferResponse from(
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

        return new PublicCustomOfferResponse(
                offer.getToken(),
                offer.getOfferType().name(),
                offer.getTitle(),
                offer.getDescription(),
                monthly,
                setup,
                monthly.add(setup),
                offer.getCurrency(),
                offer.isOneTimeOnly(),
                offer.isActive() &&
                !expired,
                offer.getExpiresAt()
        );
    }
}
