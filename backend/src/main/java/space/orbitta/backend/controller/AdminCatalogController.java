package space.orbitta.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import space.orbitta.backend.dto.CatalogPlanResponse;
import space.orbitta.backend.dto.CatalogProductResponse;
import space.orbitta.backend.dto.CreateCatalogPlanRequest;
import space.orbitta.backend.dto.CreateCatalogProductRequest;
import space.orbitta.backend.dto.UpdateCatalogPlanRequest;
import space.orbitta.backend.dto.UpdateCatalogProductRequest;
import space.orbitta.backend.service.AdminCatalogService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/catalog")
public class AdminCatalogController {

    private final AdminCatalogService adminCatalogService;

    public AdminCatalogController(
            AdminCatalogService adminCatalogService
    ) {
        this.adminCatalogService = adminCatalogService;
    }

    // =========================================================
    // PRODUCTS
    // =========================================================

    @GetMapping("/products")
    public ResponseEntity<List<CatalogProductResponse>> getProducts() {
        return ResponseEntity.ok(
                adminCatalogService.getAllProducts()
        );
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<CatalogProductResponse> getProduct(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminCatalogService.getProduct(id)
        );
    }

    @PostMapping("/products")
    public ResponseEntity<CatalogProductResponse> createProduct(
            @RequestBody CreateCatalogProductRequest request
    ) {
        CatalogProductResponse created =
                adminCatalogService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<CatalogProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateCatalogProductRequest request
    ) {
        return ResponseEntity.ok(
                adminCatalogService.updateProduct(
                        id,
                        request
                )
        );
    }

    // =========================================================
    // PLANS
    // =========================================================

    @GetMapping("/products/{productId}/plans")
    public ResponseEntity<List<CatalogPlanResponse>> getPlans(
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(
                adminCatalogService.getPlansByProduct(
                        productId
                )
        );
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<CatalogPlanResponse> getPlan(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminCatalogService.getPlan(id)
        );
    }

    @PostMapping("/plans")
    public ResponseEntity<CatalogPlanResponse> createPlan(
            @RequestBody CreateCatalogPlanRequest request
    ) {
        CatalogPlanResponse created =
                adminCatalogService.createPlan(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<CatalogPlanResponse> updatePlan(
            @PathVariable Long id,
            @RequestBody UpdateCatalogPlanRequest request
    ) {
        return ResponseEntity.ok(
                adminCatalogService.updatePlan(
                        id,
                        request
                )
        );
    }
}