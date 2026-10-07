package space.orbitta.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.CreateQuoteRequest;
import space.orbitta.backend.dto.QuoteRequestResponse;
import space.orbitta.backend.dto.UpdateQuoteRequestStatus;
import space.orbitta.backend.service.QuoteRequestService;

import java.util.List;
import java.util.Map;

@RestController
public class QuoteRequestController {

    private final QuoteRequestService service;

    public QuoteRequestController(
            QuoteRequestService service
    ) {
        this.service = service;
    }

    @PostMapping("/api/quote-requests")
    public ResponseEntity<QuoteRequestResponse> create(
            @RequestBody CreateQuoteRequest request
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

    @GetMapping("/api/admin/quote-requests")
    public ResponseEntity<List<QuoteRequestResponse>> list() {
        return ResponseEntity.ok(
                service.list()
        );
    }

    @PatchMapping("/api/admin/quote-requests/{id}/status")
    public ResponseEntity<QuoteRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateQuoteRequestStatus request
    ) {
        return ResponseEntity.ok(
                service.updateStatus(
                        id,
                        request.status()
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
                                        : "Não foi possível enviar o orçamento."
                        )
                );
    }
}
