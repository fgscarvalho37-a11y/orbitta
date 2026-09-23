package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CatalogPlanResponse;
import space.orbitta.backend.dto.CatalogProductResponse;
import space.orbitta.backend.dto.CreateCatalogPlanRequest;
import space.orbitta.backend.dto.CreateCatalogProductRequest;
import space.orbitta.backend.dto.UpdateCatalogPlanRequest;
import space.orbitta.backend.dto.UpdateCatalogProductRequest;
import space.orbitta.backend.entity.CatalogPlan;
import space.orbitta.backend.entity.CatalogProduct;
import space.orbitta.backend.repository.CatalogPlanRepository;
import space.orbitta.backend.repository.CatalogProductRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class AdminCatalogService {

    private final CatalogProductRepository catalogProductRepository;
    private final CatalogPlanRepository catalogPlanRepository;

    public AdminCatalogService(
            CatalogProductRepository catalogProductRepository,
            CatalogPlanRepository catalogPlanRepository
    ) {
        this.catalogProductRepository = catalogProductRepository;
        this.catalogPlanRepository = catalogPlanRepository;
    }

    // =========================================================
    // PRODUCTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<CatalogProductResponse> getAllProducts() {
        return catalogProductRepository
                .findAllByOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(this::toAdminProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CatalogProductResponse getProduct(Long id) {
        return toAdminProductResponse(findProduct(id));
    }

    @Transactional
    public CatalogProductResponse createProduct(
            CreateCatalogProductRequest request
    ) {
        String name = requireText(
                request.name(),
                "Nome do produto"
        );

        String slug = normalizeSlug(
                requireText(
                        request.slug(),
                        "Slug"
                )
        );

        if (slug.isBlank()) {
            throw new IllegalArgumentException(
                    "Slug inválido."
            );
        }

        if (catalogProductRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException(
                    "Já existe um produto com este slug."
            );
        }

        CatalogProduct product = new CatalogProduct();

        product.setName(name);
        product.setSlug(slug);
        product.setSubtitle(cleanNullable(request.subtitle()));
        product.setDescription(cleanNullable(request.description()));
        product.setImageUrl(cleanNullable(request.imageUrl()));
        product.setLandingPageUrl(
                cleanNullable(request.landingPageUrl())
        );

        product.setActive(
                request.active() == null || request.active()
        );

        product.setDisplayOrder(
                request.displayOrder() == null
                        ? 0
                        : request.displayOrder()
        );

        CatalogProduct saved =
                catalogProductRepository.save(product);

        return toAdminProductResponse(saved);
    }

    @Transactional
    public CatalogProductResponse updateProduct(
            Long id,
            UpdateCatalogProductRequest request
    ) {
        CatalogProduct product = findProduct(id);

        String name = requireText(
                request.name(),
                "Nome do produto"
        );

        String slug = normalizeSlug(
                requireText(
                        request.slug(),
                        "Slug"
                )
        );

        if (slug.isBlank()) {
            throw new IllegalArgumentException(
                    "Slug inválido."
            );
        }

        catalogProductRepository
                .findBySlug(slug)
                .filter(existing ->
                        !existing.getId().equals(product.getId())
                )
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Já existe outro produto com este slug."
                    );
                });

        product.setName(name);
        product.setSlug(slug);
        product.setSubtitle(cleanNullable(request.subtitle()));
        product.setDescription(cleanNullable(request.description()));
        product.setImageUrl(cleanNullable(request.imageUrl()));
        product.setLandingPageUrl(
                cleanNullable(request.landingPageUrl())
        );

        if (request.active() != null) {
            product.setActive(request.active());
        }

        if (request.displayOrder() != null) {
            product.setDisplayOrder(request.displayOrder());
        }

        CatalogProduct saved =
                catalogProductRepository.save(product);

        return toAdminProductResponse(saved);
    }

    // =========================================================
    // PLANS
    // =========================================================

    @Transactional(readOnly = true)
    public List<CatalogPlanResponse> getPlansByProduct(
            Long productId
    ) {
        findProduct(productId);

        return catalogPlanRepository
                .findByProductIdOrderByDisplayOrderAscMonthlyPriceAsc(
                        productId
                )
                .stream()
                .map(this::toPlanResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CatalogPlanResponse getPlan(Long id) {
        return toPlanResponse(findPlan(id));
    }

    @Transactional
    public CatalogPlanResponse createPlan(
            CreateCatalogPlanRequest request
    ) {
        if (request.productId() == null) {
            throw new IllegalArgumentException(
                    "Produto é obrigatório."
            );
        }

        CatalogProduct product =
                findProduct(request.productId());

        String name = requireText(
                request.name(),
                "Nome do plano"
        );

        String slug = normalizeSlug(
                requireText(
                        request.slug(),
                        "Slug"
                )
        );

        if (slug.isBlank()) {
            throw new IllegalArgumentException(
                    "Slug inválido."
            );
        }

        if (
                catalogPlanRepository.existsByProductIdAndSlug(
                        product.getId(),
                        slug
                )
        ) {
            throw new IllegalArgumentException(
                    "Já existe um plano com este slug neste produto."
            );
        }

        BigDecimal monthlyPrice =
                validateMoney(
                        request.monthlyPrice(),
                        "Valor mensal"
                );

        BigDecimal setupPrice =
                request.setupPrice() == null
                        ? BigDecimal.ZERO
                        : validateMoney(
                                request.setupPrice(),
                                "Taxa inicial"
                        );

        CatalogPlan plan = new CatalogPlan();

        plan.setProduct(product);
        plan.setName(name);
        plan.setSlug(slug);
        plan.setDescription(
                cleanNullable(request.description())
        );
        plan.setMonthlyPrice(monthlyPrice);
        plan.setSetupPrice(setupPrice);
        plan.setCurrency(
                normalizeCurrency(request.currency())
        );

        plan.setActive(
                request.active() == null || request.active()
        );

        plan.setDisplayOrder(
                request.displayOrder() == null
                        ? 0
                        : request.displayOrder()
        );

        CatalogPlan saved =
                catalogPlanRepository.save(plan);

        return toPlanResponse(saved);
    }

    @Transactional
    public CatalogPlanResponse updatePlan(
            Long id,
            UpdateCatalogPlanRequest request
    ) {
        CatalogPlan plan = findPlan(id);

        String name = requireText(
                request.name(),
                "Nome do plano"
        );

        String slug = normalizeSlug(
                requireText(
                        request.slug(),
                        "Slug"
                )
        );

        if (slug.isBlank()) {
            throw new IllegalArgumentException(
                    "Slug inválido."
            );
        }

        catalogPlanRepository
                .findByProductIdAndSlug(
                        plan.getProduct().getId(),
                        slug
                )
                .filter(existing ->
                        !existing.getId().equals(plan.getId())
                )
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Já existe outro plano com este slug neste produto."
                    );
                });

        BigDecimal monthlyPrice =
                validateMoney(
                        request.monthlyPrice(),
                        "Valor mensal"
                );

        BigDecimal setupPrice =
                request.setupPrice() == null
                        ? BigDecimal.ZERO
                        : validateMoney(
                                request.setupPrice(),
                                "Taxa inicial"
                        );

        plan.setName(name);
        plan.setSlug(slug);
        plan.setDescription(
                cleanNullable(request.description())
        );
        plan.setMonthlyPrice(monthlyPrice);
        plan.setSetupPrice(setupPrice);
        plan.setCurrency(
                normalizeCurrency(request.currency())
        );

        if (request.active() != null) {
            plan.setActive(request.active());
        }

        if (request.displayOrder() != null) {
            plan.setDisplayOrder(request.displayOrder());
        }

        CatalogPlan saved =
                catalogPlanRepository.save(plan);

        return toPlanResponse(saved);
    }

    // =========================================================
    // INTERNAL
    // =========================================================

    private CatalogProduct findProduct(Long id) {
        return catalogProductRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Produto do catálogo não encontrado."
                        )
                );
    }

    private CatalogPlan findPlan(Long id) {
        return catalogPlanRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Plano do catálogo não encontrado."
                        )
                );
    }

    private CatalogProductResponse toAdminProductResponse(
            CatalogProduct product
    ) {
        List<CatalogPlanResponse> plans =
                catalogPlanRepository
                        .findByProductIdOrderByDisplayOrderAscMonthlyPriceAsc(
                                product.getId()
                        )
                        .stream()
                        .map(this::toPlanResponse)
                        .toList();

        return new CatalogProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getSubtitle(),
                product.getDescription(),
                product.getImageUrl(),
                product.getLandingPageUrl(),
                product.isActive(),
                product.getDisplayOrder(),
                plans
        );
    }

    private CatalogPlanResponse toPlanResponse(
            CatalogPlan plan
    ) {
        return new CatalogPlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getSlug(),
                plan.getDescription(),
                plan.getMonthlyPrice(),
                plan.getSetupPrice(),
                plan.getCurrency(),
                plan.isActive(),
                plan.getDisplayOrder()
        );
    }

    private String requireText(
            String value,
            String fieldName
    ) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    fieldName + " é obrigatório."
            );
        }

        return value.trim();
    }

    private String cleanNullable(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }

    private String normalizeSlug(String slug) {
        return slug
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9-]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "BRL";
        }

        String normalized =
                currency.trim().toUpperCase(Locale.ROOT);

        if (normalized.length() != 3) {
            throw new IllegalArgumentException(
                    "Moeda deve possuir 3 caracteres."
            );
        }

        return normalized;
    }

    private BigDecimal validateMoney(
            BigDecimal value,
            String fieldName
    ) {
        if (value == null) {
            throw new IllegalArgumentException(
                    fieldName + " é obrigatório."
            );
        }

        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    fieldName + " não pode ser negativo."
            );
        }

        return value;
    }
}