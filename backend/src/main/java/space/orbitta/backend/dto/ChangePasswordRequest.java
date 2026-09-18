package space.orbitta.backend.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {
}