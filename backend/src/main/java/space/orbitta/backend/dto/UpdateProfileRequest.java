package space.orbitta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank(message = "Nome é obrigatório.")
        @Size(max = 100, message = "Nome deve possuir no máximo 100 caracteres.")
        String firstName,

        @NotBlank(message = "Sobrenome é obrigatório.")
        @Size(max = 100, message = "Sobrenome deve possuir no máximo 100 caracteres.")
        String lastName,

        @Size(max = 30, message = "Telefone deve possuir no máximo 30 caracteres.")
        String phone
) {
}
