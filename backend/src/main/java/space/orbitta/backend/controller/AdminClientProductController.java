package space.orbitta.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.ClientProductResponse;
import space.orbitta.backend.dto.CreateClientProductRequest;
import space.orbitta.backend.dto.UpdateClientProductRequest;
import space.orbitta.backend.service.ClientProductService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/client-products")
public class AdminClientProductController {

    private final ClientProductService clientProductService;

    public AdminClientProductController(
            ClientProductService clientProductService
    ) {
        this.clientProductService = clientProductService;
    }

    /*
     * =========================================================
     * LISTAR TODOS OS PRODUTOS
     * =========================================================
     */

    @GetMapping
    public ResponseEntity<List<ClientProductResponse>> findAll() {

        List<ClientProductResponse> products =
                clientProductService.findAllForAdmin();

        return ResponseEntity.ok(products);
    }

    /*
     * =========================================================
     * BUSCAR PRODUTO POR ID
     * =========================================================
     */

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(
            @PathVariable Long id
    ) {
        try {
            ClientProductResponse product =
                    clientProductService
                            .findByIdForAdmin(id);

            return ResponseEntity.ok(product);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    /*
     * =========================================================
     * CRIAR PRODUTO
     * =========================================================
     */

    @PostMapping
    public ResponseEntity<?> create(
            @Valid @RequestBody CreateClientProductRequest request
    ) {
        try {
            ClientProductResponse product =
                    clientProductService
                            .createProductForClient(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(product);

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
     * EDITAR PRODUTO
     * =========================================================
     */

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClientProductRequest request
    ) {
        try {
            ClientProductResponse product =
                    clientProductService
                            .updateProduct(
                                    id,
                                    request
                            );

            return ResponseEntity.ok(product);

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
     * CONTAGEM DE PRODUTOS
     * =========================================================
     */

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> count() {

        long totalProducts =
                clientProductService.countAllProducts();

        long activeProducts =
                clientProductService.countActiveProducts();

        long inactiveProducts =
                Math.max(
                        0,
                        totalProducts - activeProducts
                );

        return ResponseEntity.ok(
                Map.of(
                        "totalProducts",
                        totalProducts,
                        "activeProducts",
                        activeProducts,
                        "inactiveProducts",
                        inactiveProducts
                )
        );
    }
}