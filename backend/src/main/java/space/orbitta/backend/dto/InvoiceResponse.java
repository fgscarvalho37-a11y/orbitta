package space.orbitta.backend.dto;

import space.orbitta.backend.entity.Invoice;
import space.orbitta.backend.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record InvoiceResponse(

        Long id,
        String invoiceNumber,

        Long productId,
        String productName,

        BigDecimal amount,
        String currency,
        InvoiceStatus status,

        LocalDate dueDate,
        LocalDateTime paidAt,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {

    public static InvoiceResponse from(
            Invoice invoice
    ) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),

                invoice.getProduct().getId(),
                invoice.getProduct().getName(),

                invoice.getAmount(),
                invoice.getCurrency(),
                invoice.getStatus(),

                invoice.getDueDate(),
                invoice.getPaidAt(),

                invoice.getCreatedAt(),
                invoice.getUpdatedAt()
        );
    }
}