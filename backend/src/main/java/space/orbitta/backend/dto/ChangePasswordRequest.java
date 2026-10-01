package space.orbitta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank(message = "Senha atual é obrigatória.")
        @Size(max = 72, message = "Senha atual inválida.")
        String currentPassword,

        @NotBlank(message = "Nova senha é obrigatória.")
        @Size(
                min = 8,
                max = 72,
                message = "A nova senha deve possuir entre 8 e 72 caracteres."
        )
        String newPassword
) {
}
