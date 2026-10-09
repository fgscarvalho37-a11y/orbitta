package space.orbitta.backend.dto;

import space.orbitta.backend.entity.SubscriptionCheckout;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SubscriptionCheckoutResponse(
        Long id,
        Long productId,
        String productSlug,
        Long planId,
        String productName,
        String planName,
        BigDecimal monthlyPrice,
        BigDecimal billingAmount,
        String billingCycle,
        boolean oneTimeOnly,
        boolean customSiteIntegration,
        BigDecimal customSiteIntegrationPrice,
        BigDecimal setupPrice,
        BigDecimal totalPrice,
        String currency,
        BigDecimal settlementAmount,
        String settlementCurrency,
        BigDecimal fxRate,
        LocalDateTime fxQuotedAt,
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

        BigDecimal billingAmount =
                checkout.getBillingAmount();

        BigDecimal setupPrice =
                checkout.getSetupPrice() != null
                        ? checkout.getSetupPrice()
                        : BigDecimal.ZERO;

        return new SubscriptionCheckoutResponse(
                checkout.getId(),
                checkout.getCatalogProduct().getId(),
                checkout.getCatalogProduct().getSlug(),
                checkout.getCatalogPlan().getId(),
                checkout.getProductName(),
                checkout.getPlanName(),
                monthlyPrice,
                billingAmount,
                checkout.getBillingCycle().name(),
                checkout.isOneTimeOnly(),
                checkout.isCustomSiteIntegration(),
                checkout.getCustomSiteIntegrationPrice(),
                setupPrice,
                billingAmount.add(setupPrice),
                checkout.getCurrency(),
                checkout.getSettlementAmount(),
                checkout.getSettlementCurrency(),
                checkout.getFxRate(),
                checkout.getFxQuotedAt(),
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
