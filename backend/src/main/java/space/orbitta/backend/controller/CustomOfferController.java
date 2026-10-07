package space.orbitta.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.CreateCustomOfferRequest;
import space.orbitta.backend.dto.CustomOfferResponse;
import space.orbitta.backend.dto.PublicCustomOfferResponse;
import space.orbitta.backend.dto.SubscriptionCheckoutResponse;
import space.orbitta.backend.dto.UpdateCustomOfferStatusRequest;
import space.orbitta.backend.service.CustomOfferService;

import java.util.List;
import java.util.Map;

@RestController
public class CustomOfferController {

    private final CustomOfferService service;

    public CustomOfferController(
            CustomOfferService service
    ) {
        this.service = service;
    }

    @GetMapping("/api/custom-offers/{token}")
    public ResponseEntity<PublicCustomOfferResponse> getPublic(
            @PathVariable String token
    ) {
        return ResponseEntity.ok(
                service.getPublic(
                        token
                )
        );
    }

    @PostMapping("/api/custom-offers/{token}/accept")
    public ResponseEntity<SubscriptionCheckoutResponse> accept(
            @PathVariable String token,
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .build();
        }

        return ResponseEntity.ok(
                service.accept(
                        token,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/api/admin/custom-offers")
    public ResponseEntity<List<CustomOfferResponse>> list() {
        return ResponseEntity.ok(
                service.list()
        );
    }

    @PostMapping("/api/admin/custom-offers")
    public ResponseEntity<CustomOfferResponse> create(
            @RequestBody CreateCustomOfferRequest request
    ) {
        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        service.create(
                                request
                        )
                );
    }

    @PatchMapping("/api/admin/custom-offers/{id}/status")
    public ResponseEntity<CustomOfferResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateCustomOfferStatusRequest request
    ) {
        return ResponseEntity.ok(
                service.setActive(
                        id,
                        request.active()
                )
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(
            IllegalArgumentException exception
    ) {
        return ResponseEntity
                .badRequest()
                .body(
                        Map.of(
                                "message",
                                exception.getMessage() != null
                                        ? exception.getMessage()
                                        : "Não foi possível processar a oferta."
                        )
                );
    }
}
