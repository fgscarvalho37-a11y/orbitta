package space.orbitta.backend.dto;

import space.orbitta.backend.entity.SiteProjectMessage;
import java.time.LocalDateTime;

public record SiteProjectMessageResponse(
    Long id, String authorName, String authorRole, String message, LocalDateTime createdAt
) {
    public static SiteProjectMessageResponse from(SiteProjectMessage m) {
        return new SiteProjectMessageResponse(m.getId(),
            m.getAuthor().getFirstName() + " " + m.getAuthor().getLastName(),
            m.getAuthor().getRole().name(), m.getMessage(), m.getCreatedAt());
    }
}
