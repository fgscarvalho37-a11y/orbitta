package space.orbitta.backend.dto;

public record TermsAcceptanceRequest(
        Boolean accepted,
        String termsVersion
) {
}
