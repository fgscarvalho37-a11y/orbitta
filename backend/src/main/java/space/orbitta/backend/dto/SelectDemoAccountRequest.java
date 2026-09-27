package space.orbitta.backend.dto;

import jakarta.validation.constraints.NotNull;

public record SelectDemoAccountRequest(
        @NotNull
        Long userId
) {
}
