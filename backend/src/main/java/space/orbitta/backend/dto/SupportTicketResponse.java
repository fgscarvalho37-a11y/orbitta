package space.orbitta.backend.dto;

import space.orbitta.backend.entity.SupportTicket;

import java.time.LocalDateTime;

public record SupportTicketResponse(
        Long id,
        String code,
        String productName,
        String category,
        String subject,
        String message,
        String status,
        String customerName,
        String customerEmail,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static SupportTicketResponse from(
            SupportTicket ticket
    ) {

        String firstName =
                ticket.getUser()
                        .getFirstName();

        String lastName =
                ticket.getUser()
                        .getLastName();

        String name =
                (
                        (firstName == null ? "" : firstName)
                                + " "
                                + (lastName == null ? "" : lastName)
                ).trim();

        return new SupportTicketResponse(
                ticket.getId(),
                String.format(
                        "ORB-%05d",
                        ticket.getId()
                ),
                ticket.getProductName(),
                ticket.getCategory(),
                ticket.getSubject(),
                ticket.getMessage(),
                ticket.getStatus().name(),
                name,
                ticket.getUser().getEmail(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}
