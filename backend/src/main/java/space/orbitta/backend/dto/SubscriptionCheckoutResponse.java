package space.orbitta.backend.dto;

import space.orbitta.backend.entity.SubscriptionCheckout;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SubscriptionCheckoutResponse(
        Long id,
        Long productId,
        Long planId,
        String productName,
        String planName,
        BigDecimal monthlyPrice,
        BigDecimal setupPrice,
        BigDecimal totalPrice,
        String currency,
        String status,
        String paymentProvider,
        String externalReference,
        LocalDateTime termsAcceptedAt,
        String termsVersion,
        LocalDateTime expiresAt,
        LocalDateTime createdAt
) {

    public static SubscriptionCheckoutResponse from(
            SubscriptionCheckout checkout
    ) {
        BigDecimal monthlyPrice =
                checkout.getMonthlyPrice() != null
                        ? checkout.getMonthlyPrice()
                        : BigDecimal.ZERO;

        BigDecimal setupPrice =
                checkout.getSetupPrice() != null
                        ? checkout.getSetupPrice()
                        : BigDecimal.ZERO;

        return new SubscriptionCheckoutResponse(
                checkout.getId(),
                checkout.getCatalogProduct().getId(),
                checkout.getCatalogPlan().getId(),
                checkout.getProductName(),
                checkout.getPlanName(),
                monthlyPrice,
                setupPrice,
                monthlyPrice.add(setupPrice),
                checkout.getCurrency(),
                checkout.getStatus().name(),
                checkout.getPaymentProvider(),
                checkout.getExternalReference(),
                checkout.getTermsAcceptedAt(),
                checkout.getTermsVersion(),
                checkout.getExpiresAt(),
                checkout.getCreatedAt()
        );
    }
}