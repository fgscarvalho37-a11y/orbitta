package space.orbitta.backend.dto;

public record CreateSubscriptionRequest(
        Long planId,
        Long priceId
) {
}
