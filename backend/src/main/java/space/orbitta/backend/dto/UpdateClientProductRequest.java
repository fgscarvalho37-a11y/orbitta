package space.orbitta.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import space.orbitta.backend.entity.ProductStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateClientProductRequest(

        @NotBlank(message = "Nome do produto é obrigatório.")
        @Size(max = 100, message = "Nome do produto deve possuir no máximo 100 caracteres.")
        String name,

        @Size(max = 150, message = "Subtítulo deve possuir no máximo 150 caracteres.")
        String subtitle,

        @NotBlank(message = "Nome do plano é obrigatório.")
        @Size(max = 80, message = "Nome do plano deve possuir no máximo 80 caracteres.")
        String planName,

        @NotNull(message = "Valor mensal é obrigatório.")
        @DecimalMin(
                value = "0.00",
                inclusive = true,
                message = "Valor mensal não pode ser negativo."
        )
        BigDecimal monthlyPrice,

        @Size(max = 255, message = "Domínio deve possuir no máximo 255 caracteres.")
        String domain,

        @Size(max = 500, message = "URL do sistema deve possuir no máximo 500 caracteres.")
        String systemUrl,

        @NotNull(message = "Status do produto é obrigatório.")
        ProductStatus status,

        LocalDate renewalDate

) {
}