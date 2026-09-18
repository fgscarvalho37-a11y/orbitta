package space.orbitta.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateClientProductRequest(

        @NotNull(message = "O cliente é obrigatório.")
        Long userId,

        @NotBlank(message = "O nome do produto é obrigatório.")
        @Size(max = 100)
        String name,

        @Size(max = 150)
        String subtitle,

        @NotBlank(message = "O plano é obrigatório.")
        @Size(max = 80)
        String planName,

        @NotNull(message = "O valor mensal é obrigatório.")
        @DecimalMin(
                value = "0.00",
                inclusive = true,
                message = "O valor mensal não pode ser negativo."
        )
        BigDecimal monthlyPrice,

        @Size(max = 255)
        String domain,

        @Size(max = 500)
        String systemUrl,

        LocalDate renewalDate

) {
}