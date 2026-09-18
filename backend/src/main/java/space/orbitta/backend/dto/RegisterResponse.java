package space.orbitta.backend.dto;

import space.orbitta.backend.entity.User;

import java.time.LocalDateTime;

public record RegisterResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String role,
        boolean active,
        LocalDateTime createdAt
) {

    public static RegisterResponse from(User user) {
        return new RegisterResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}