package space.orbitta.backend.dto;

public record MercadoPagoSubscriptionResponse(
        String id,
        String initPoint,
        String status
) {
}