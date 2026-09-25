package space.orbitta.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(
            IllegalArgumentException.class
    )
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.BAD_REQUEST
                )
                .body(
                        Map.of(
                                "message",
                                safeMessage(
                                        exception,
                                        "Dados inválidos."
                                )
                        )
                );
    }

    @ExceptionHandler(
            IllegalStateException.class
    )
    public ResponseEntity<Map<String, String>> handleConflict(
            IllegalStateException exception
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.CONFLICT
                )
                .body(
                        Map.of(
                                "message",
                                safeMessage(
                                        exception,
                                        "Não foi possível concluir esta operação."
                                )
                        )
                );
    }

    private String safeMessage(
            RuntimeException exception,
            String fallback
    ) {

        String message =
                exception.getMessage();

        if (
                message == null ||
                message.isBlank()
        ) {
            return fallback;
        }

        return message;
    }
}
