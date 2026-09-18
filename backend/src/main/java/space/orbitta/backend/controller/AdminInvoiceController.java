package space.orbitta.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.CreateInvoiceRequest;
import space.orbitta.backend.dto.InvoiceResponse;
import space.orbitta.backend.service.InvoiceService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/invoices")
public class AdminInvoiceController {

    private final InvoiceService invoiceService;

    public AdminInvoiceController(
            InvoiceService invoiceService
    ) {
        this.invoiceService = invoiceService;
    }

    /*
     * =========================================================
     * LISTAR TODAS AS FATURAS
     * =========================================================
     */

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> findAll() {

        List<InvoiceResponse> invoices =
                invoiceService.findAllForAdmin();

        return ResponseEntity.ok(invoices);
    }

    /*
     * =========================================================
     * RESUMO DE FATURAS
     * =========================================================
     */

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {

        long totalInvoices =
                invoiceService.countAllInvoices();

        long pendingInvoices =
                invoiceService.countPendingInvoices();

        long paidInvoices =
                invoiceService.countPaidInvoices();

        long overdueInvoices =
                invoiceService.countOverdueInvoices();

        long cancelledInvoices =
                invoiceService.countCancelledInvoices();

        return ResponseEntity.ok(
                Map.of(
                        "totalInvoices",
                        totalInvoices,
                        "pendingInvoices",
                        pendingInvoices,
                        "paidInvoices",
                        paidInvoices,
                        "overdueInvoices",
                        overdueInvoices,
                        "cancelledInvoices",
                        cancelledInvoices
                )
        );
    }

    /*
     * =========================================================
     * CRIAR FATURA
     * =========================================================
     */

    @PostMapping
    public ResponseEntity<?> createInvoice(
            @RequestBody CreateInvoiceRequest request
    ) {
        try {
            InvoiceResponse invoice =
                    invoiceService.createInvoice(
                            request
                    );

            return ResponseEntity.ok(
                    invoice
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    /*
     * =========================================================
     * MARCAR COMO PAGA
     * =========================================================
     */

    @PatchMapping("/{id}/paid")
    public ResponseEntity<?> markAsPaid(
            @PathVariable Long id
    ) {
        try {
            InvoiceResponse invoice =
                    invoiceService.markAsPaid(
                            id
                    );

            return ResponseEntity.ok(
                    invoice
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }

    /*
     * =========================================================
     * CANCELAR FATURA
     * =========================================================
     */

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInvoice(
            @PathVariable Long id
    ) {
        try {
            InvoiceResponse invoice =
                    invoiceService.cancelInvoice(
                            id
                    );

            return ResponseEntity.ok(
                    invoice
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }
}