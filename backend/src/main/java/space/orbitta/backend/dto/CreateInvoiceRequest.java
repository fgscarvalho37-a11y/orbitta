package space.orbitta.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateInvoiceRequest(

        Long userId,
        Long productId,
        BigDecimal amount,
        LocalDate dueDate

) {
}