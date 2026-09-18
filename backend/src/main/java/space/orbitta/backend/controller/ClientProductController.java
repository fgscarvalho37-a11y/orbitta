package space.orbitta.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.ClientProductResponse;
import space.orbitta.backend.service.ClientProductService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/client/products")
public class ClientProductController {

    private final ClientProductService clientProductService;

    public ClientProductController(
            ClientProductService clientProductService
    ) {
        this.clientProductService = clientProductService;
    }

    @GetMapping
    public ResponseEntity<List<ClientProductResponse>> findAll(
            Authentication authentication
    ) {
        String email = authentication.getName();

        List<ClientProductResponse> products =
                clientProductService.findAllForUser(email);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ClientProductResponse>> findActive(
            Authentication authentication
    ) {
        String email = authentication.getName();

        List<ClientProductResponse> products =
                clientProductService.findActiveForUser(email);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countActive(
            Authentication authentication
    ) {
        String email = authentication.getName();

        long count =
                clientProductService.countActiveForUser(email);

        return ResponseEntity.ok(
                Map.of(
                        "activeProducts",
                        count
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();

            ClientProductResponse product =
                    clientProductService.findByIdForUser(
                            id,
                            email
                    );

            return ResponseEntity.ok(product);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}