package space.orbitta.backend.dto;

public record SaveSiteProjectRequest(
    Long checkoutId,
    String businessName,
    String contactEmail,
    String contactPhone,
    String businessType,
    String projectBrief,
    String requestedPages,
    String designReferences,
    String preferredDomain
) {}
