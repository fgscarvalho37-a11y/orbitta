package space.orbitta.backend.dto;

public record UpdateCatalogProductRequest(
        String name,
        String slug,
        String subtitle,
        String description,
        String imageUrl,
        String landingPageUrl,
        Boolean active,
        Integer displayOrder
) {
}