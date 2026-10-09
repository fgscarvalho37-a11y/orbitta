package space.orbitta.backend.dto;

import space.orbitta.backend.entity.SiteProject;
import java.time.LocalDateTime;

public record SiteProjectResponse(
    Long id, Long checkoutId, String customerName, String customerEmail,
    String businessName, String contactEmail, String contactPhone,
    String businessType, String projectBrief, String requestedPages,
    String designReferences, String preferredDomain,
    String status, String deliveryUrl, LocalDateTime createdAt, LocalDateTime updatedAt
) {
    public static SiteProjectResponse from(SiteProject p) {
        return new SiteProjectResponse(p.getId(), p.getCheckout().getId(),
            p.getUser().getFirstName() + " " + p.getUser().getLastName(),
            p.getUser().getEmail(),
            p.getBusinessName(), p.getContactEmail(), p.getContactPhone(),
            p.getBusinessType(), p.getProjectBrief(), p.getRequestedPages(),
            p.getDesignReferences(), p.getPreferredDomain(),
            p.getStatus().name(), p.getDeliveryUrl(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
