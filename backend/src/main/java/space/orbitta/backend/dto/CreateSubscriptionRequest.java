package space.orbitta.backend.dto;

import space.orbitta.backend.entity.BillingCycle;

public record CreateSubscriptionRequest(
        Long planId,
        Long priceId,
        BillingCycle billingCycle,
        String displayCurrency
) {
}
