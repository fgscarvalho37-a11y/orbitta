package space.orbitta.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.CatalogProductResponse;
import space.orbitta.backend.service.CatalogService;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<CatalogProductResponse>> getProducts(
            @RequestHeader(
                    name = "X-Orbitta-Market",
                    required = false
            )
            String market
    ) {
        return ResponseEntity.ok(
                catalogService.getActiveProducts(
                        market
                )
        );
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<CatalogProductResponse> getProductBySlug(
            @PathVariable String slug,
            @RequestHeader(
                    name = "X-Orbitta-Market",
                    required = false
            )
            String market
    ) {
        return ResponseEntity.ok(
                catalogService.getActiveProductBySlug(
                        slug,
                        market
                )
        );
    }
}