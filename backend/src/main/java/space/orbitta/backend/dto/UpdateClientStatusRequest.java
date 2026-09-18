package space.orbitta.backend.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateClientStatusRequest(

        @NotNull(message = "O status do cliente é obrigatório.")
        Boolean active

) {
}