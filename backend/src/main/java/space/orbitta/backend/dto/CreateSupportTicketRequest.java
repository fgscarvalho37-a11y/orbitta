package space.orbitta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSupportTicketRequest(

        @NotBlank(
                message = "Produto é obrigatório."
        )
        @Size(
                max = 100,
                message = "Produto inválido."
        )
        String productName,

        @NotBlank(
                message = "Categoria é obrigatória."
        )
        @Size(
                max = 60,
                message = "Categoria inválida."
        )
        String category,

        @NotBlank(
                message = "Assunto é obrigatório."
        )
        @Size(
                max = 160,
                message = "Assunto deve possuir no máximo 160 caracteres."
        )
        String subject,

        @NotBlank(
                message = "Mensagem é obrigatória."
        )
        @Size(
                max = 4000,
                message = "Mensagem deve possuir no máximo 4000 caracteres."
        )
        String message

) {
}
