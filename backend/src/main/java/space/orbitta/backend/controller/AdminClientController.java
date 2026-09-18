package space.orbitta.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.ClientProductResponse;
import space.orbitta.backend.dto.InvoiceResponse;
import space.orbitta.backend.dto.RegisterResponse;
import space.orbitta.backend.dto.UpdateClientStatusRequest;
import space.orbitta.backend.service.ClientProductService;
import space.orbitta.backend.service.InvoiceService;
import space.orbitta.backend.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/clients")
public class AdminClientController {

    private final UserService userService;
    private final ClientProductService clientProductService;
    private final InvoiceService invoiceService;

    public AdminClientController(
            UserService userService,
            ClientProductService clientProductService,
            InvoiceService invoiceService
    ) {
        this.userService = userService;
        this.clientProductService = clientProductService;
        this.invoiceService = invoiceService;
    }

    /*
     * =========================================================
     * LISTAR CLIENTES
     * =========================================================
     */

    @GetMapping
    public ResponseEntity<List<RegisterResponse>> findAll() {

        List<RegisterResponse> clients =
                userService.findAllClients();

        return ResponseEntity.ok(clients);
    }

    /*
     * =========================================================
     * BUSCAR CLIENTE POR ID
     * =========================================================
     */

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(
            @PathVariable Long id
    ) {
        try {
            RegisterResponse client =
                    userService.findClientById(id);

            return ResponseEntity.ok(client);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    /*
     * =========================================================
     * ALTERAR STATUS DO CLIENTE
     * =========================================================
     */

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClientStatusRequest request
    ) {
        try {
            RegisterResponse client =
                    userService.updateClientStatus(
                            id,
                            request.active()
                    );

            return ResponseEntity.ok(client);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    /*
     * =========================================================
     * PRODUTOS DO CLIENTE
     * =========================================================
     */

    @GetMapping("/{id}/products")
    public ResponseEntity<?> findProducts(
            @PathVariable Long id
    ) {
        try {
            List<ClientProductResponse> products =
                    clientProductService
                            .findAllForClientAdmin(id);

            return ResponseEntity.ok(products);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    /*
     * =========================================================
     * FATURAS DO CLIENTE
     * =========================================================
     */

    @GetMapping("/{id}/invoices")
    public ResponseEntity<?> findInvoices(
            @PathVariable Long id
    ) {
        try {
            List<InvoiceResponse> invoices =
                    invoiceService
                            .findAllForClientAdmin(id);

            return ResponseEntity.ok(invoices);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    /*
     * =========================================================
     * RESUMO DE CLIENTES
     * =========================================================
     */

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {

        long totalClients =
                userService.countClients();

        long activeClients =
                userService.countActiveClients();

        long inactiveClients =
                Math.max(
                        0,
                        totalClients - activeClients
                );

        return ResponseEntity.ok(
                Map.of(
                        "totalClients",
                        totalClients,
                        "activeClients",
                        activeClients,
                        "inactiveClients",
                        inactiveClients
                )
        );
    }
}