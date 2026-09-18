package space.orbitta.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Nome é obrigatório.")
        @Size(max = 100, message = "Nome deve possuir no máximo 100 caracteres.")
        String firstName,

        @NotBlank(message = "Sobrenome é obrigatório.")
        @Size(max = 100, message = "Sobrenome deve possuir no máximo 100 caracteres.")
        String lastName,

        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "E-mail inválido.")
        @Size(max = 255, message = "E-mail deve possuir no máximo 255 caracteres.")
        String email,

        @NotBlank(message = "Senha é obrigatória.")
        @Size(
                min = 8,
                max = 72,
                message = "Senha deve possuir entre 8 e 72 caracteres."
        )
        String password,

        @Size(max = 30, message = "Telefone deve possuir no máximo 30 caracteres.")
        String phone

) {
}