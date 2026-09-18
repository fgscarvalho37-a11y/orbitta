package space.orbitta.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.InvoiceResponse;
import space.orbitta.backend.entity.InvoiceStatus;
import space.orbitta.backend.service.InvoiceService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client/invoices")
public class ClientInvoiceController {

    private final InvoiceService invoiceService;

    public ClientInvoiceController(
            InvoiceService invoiceService
    ) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> findAll(
            Authentication authentication
    ) {
        String email = authentication.getName();

        List<InvoiceResponse> invoices =
                invoiceService.findAllForUser(email);

        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();

            InvoiceResponse invoice =
                    invoiceService.findByIdForUser(
                            id,
                            email
                    );

            return ResponseEntity.ok(invoice);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceResponse>> findByStatus(
            @PathVariable InvoiceStatus status,
            Authentication authentication
    ) {
        String email = authentication.getName();

        List<InvoiceResponse> invoices =
                invoiceService.findByStatusForUser(
                        email,
                        status
                );

        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/count/pending")
    public ResponseEntity<Map<String, Long>> countPending(
            Authentication authentication
    ) {
        String email = authentication.getName();

        long count =
                invoiceService.countPendingForUser(
                        email
                );

        return ResponseEntity.ok(
                Map.of(
                        "pendingInvoices",
                        count
                )
        );
    }
}