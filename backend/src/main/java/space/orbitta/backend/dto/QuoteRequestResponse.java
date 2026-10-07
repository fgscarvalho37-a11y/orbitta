package space.orbitta.backend.dto;

import space.orbitta.backend.entity.QuoteRequest;

import java.time.LocalDateTime;

public record QuoteRequestResponse(
        Long id,
        String name,
        String email,
        String phone,
        String company,
        String projectType,
        String message,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static QuoteRequestResponse from(
            QuoteRequest request
    ) {
        return new QuoteRequestResponse(
                request.getId(),
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getCompany(),
                request.getProjectType(),
                request.getMessage(),
                request.getStatus().name(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}
