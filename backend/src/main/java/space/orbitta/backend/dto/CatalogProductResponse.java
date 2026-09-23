package space.orbitta.backend.dto;

import java.util.List;

public record CatalogProductResponse(
        Long id,
        String name,
        String slug,
        String subtitle,
        String description,
        String imageUrl,
        String landingPageUrl,
        boolean active,
        int displayOrder,
        List<CatalogPlanResponse> plans
) {
}