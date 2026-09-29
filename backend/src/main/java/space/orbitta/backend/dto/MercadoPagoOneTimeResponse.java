package space.orbitta.backend.dto;

public record MercadoPagoOneTimeResponse(
        String id,
        String initPoint,
        String status
) {
}
