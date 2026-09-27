package space.orbitta.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record DemoAccountResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        boolean active,
        long totalAccesses,
        LocalDateTime lastAccessAt,
        List<LocalDateTime> recentAccesses
) {
}
