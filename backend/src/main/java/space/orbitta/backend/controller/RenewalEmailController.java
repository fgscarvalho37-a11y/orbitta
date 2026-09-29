package space.orbitta.backend.controller;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import space.orbitta.backend.service.RenewalEmailService;

import java.nio.charset.StandardCharsets;

import java.security.MessageDigest;

import java.util.Map;

@RestController
@RequestMapping("/api/internal/renewal-emails")
public class RenewalEmailController {

    private final RenewalEmailService
            renewalEmailService;

    @Value("${orbitta.renewal-cron-secret:}")
    private String cronSecret;

    public RenewalEmailController(
            RenewalEmailService renewalEmailService
    ) {
        this.renewalEmailService =
                renewalEmailService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> run(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            )
            String authorization
    ) {

        if (
                cronSecret == null ||
                cronSecret.isBlank()
        ) {
            return ResponseEntity
                    .status(
                            HttpStatus.SERVICE_UNAVAILABLE
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Agendamento de renovação não configurado."
                            )
                    );
        }

        String expected =
                "Bearer "
                        + cronSecret.trim();

        if (
                authorization == null ||
                !MessageDigest.isEqual(
                        expected.getBytes(
                                StandardCharsets.UTF_8
                        ),
                        authorization.getBytes(
                                StandardCharsets.UTF_8
                        )
                )
        ) {
            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Não autorizado."
                            )
                    );
        }

        RenewalEmailService.ScanResult result =
                renewalEmailService
                        .scanAndSend();

        return ResponseEntity.ok(
                result
        );
    }
}
