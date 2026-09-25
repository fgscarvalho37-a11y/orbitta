package space.orbitta.backend.controller;

import org.springframework.http.HttpStatus;
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

    @PutMapping("/{id}/storefront")
    public ResponseEntity<?> updateStorefront(
            @PathVariable Long id,
            @RequestBody UpdateStorefrontRequest request,
            Authentication authentication
    ) {
        try {

            String email =
                    authentication.getName();

            ClientProductResponse product =
                    clientProductService
                            .updateStorefrontForUser(
                                    id,
                                    email,
                                    request != null
                                            ? request.slug()
                                            : null
                            );

            return ResponseEntity.ok(
                    product
            );

        } catch (IllegalArgumentException exception) {

            String message =
                    exception.getMessage() != null
                            ? exception.getMessage()
                            : "Não foi possível alterar o endereço.";

            if (
                    message.startsWith("{") &&
                    message.endsWith("}")
            ) {
                try {
                    int start =
                            message.indexOf(
                                    "\"message\""
                            );

                    if (start >= 0) {
                        int colon =
                                message.indexOf(
                                        ":",
                                        start
                                );

                        int firstQuote =
                                message.indexOf(
                                        "\"",
                                        colon + 1
                                );

                        int secondQuote =
                                firstQuote >= 0
                                        ? message.indexOf(
                                                "\"",
                                                firstQuote + 1
                                        )
                                        : -1;

                        if (
                                firstQuote >= 0 &&
                                secondQuote > firstQuote
                        ) {
                            message =
                                    message.substring(
                                            firstQuote + 1,
                                            secondQuote
                                    );
                        }
                    }
                } catch (RuntimeException ignored) {
                    // Mantém a mensagem original.
                }
            }

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    message
                            )
                    );

        } catch (IllegalStateException exception) {

            return ResponseEntity
                    .status(
                            HttpStatus.BAD_GATEWAY
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Não foi possível sincronizar o novo endereço agora. Tente novamente."
                            )
                    );
        }
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

    public record UpdateStorefrontRequest(
            String slug
    ) {
    }
}