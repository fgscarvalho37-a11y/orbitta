package space.orbitta.backend.dto;

public record CreateQuoteRequest(
        String name,
        String email,
        String phone,
        String company,
        String projectType,
        String message
) {
}
