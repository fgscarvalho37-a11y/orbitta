package space.orbitta.backend.dto;

public record SubscriptionPaymentResponse(
        Long checkoutId,
        String status,
        String provider,
        String externalPaymentId,
        String paymentUrl
) {
}