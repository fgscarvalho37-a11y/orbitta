package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CatalogPlanPriceResponse;
import space.orbitta.backend.dto.CatalogPlanResponse;
import space.orbitta.backend.dto.CatalogProductResponse;
import space.orbitta.backend.dto.CreateCatalogPlanRequest;
import space.orbitta.backend.dto.CreateCatalogProductRequest;
import space.orbitta.backend.dto.UpdateCatalogPlanRequest;
import space.orbitta.backend.dto.UpdateCatalogProductRequest;
import space.orbitta.backend.dto.UpsertCatalogPlanPriceRequest;
import space.orbitta.backend.entity.CatalogPlan;
import space.orbitta.backend.entity.CatalogPlanPrice;
import space.orbitta.backend.entity.CatalogProduct;
import space.orbitta.backend.repository.CatalogPlanPriceRepository;
import space.orbitta.backend.repository.CatalogPlanRepository;
import space.orbitta.backend.repository.CatalogProductRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
public class AdminCatalogService {

    private final CatalogProductRepository catalogProductRepository;
    private final CatalogPlanRepository catalogPlanRepository;
    private final CatalogPlanPriceRepository catalogPlanPriceRepository;

    public AdminCatalogService(
            CatalogProductRepository catalogProductRepository,
            CatalogPlanRepository catalogPlanRepository,
            CatalogPlanPriceRepository catalogPlanPriceRepository
    ) {
        this.catalogProductRepository = catalogProductRepository;
        this.catalogPlanRepository = catalogPlanRepository;
        this.catalogPlanPriceRepository = catalogPlanPriceRepository;
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

        syncBrazilPrice(
                saved
        );

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

        syncBrazilPrice(
                saved
        );

        return toPlanResponse(saved);
    }

    // =========================================================
    // REGIONAL PRICES
    // =========================================================

    @Transactional(readOnly = true)
    public List<CatalogPlanPriceResponse> getPlanPrices(
            Long planId
    ) {
        findPlan(planId);

        return catalogPlanPriceRepository
                .findByPlanIdOrderByDisplayOrderAscRegionCodeAsc(
                        planId
                )
                .stream()
                .map(CatalogPlanPriceResponse::from)
                .toList();
    }

    @Transactional
    public CatalogPlanPriceResponse upsertPlanPrice(
            Long planId,
            String regionCode,
            UpsertCatalogPlanPriceRequest request
    ) {
        CatalogPlan plan =
                findPlan(
                        planId
                );

        String region =
                normalizeRegion(
                        regionCode
                );

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

        BigDecimal regularMonthlyPrice = request.regularMonthlyPrice() == null
                ? null : validateMoney(request.regularMonthlyPrice(), "Preço de comparação");

        CatalogPlanPrice price =
                catalogPlanPriceRepository
                        .findByPlanIdAndRegionCodeIgnoreCase(
                                planId,
                                region
                        )
                        .orElseGet(
                                CatalogPlanPrice::new
                        );

        price.setPlan(
                plan
        );
        price.setRegionCode(
                region
        );
        price.setCurrency(
                currencyForRegion(
                        region
                )
        );
        price.setMonthlyPrice(
                monthlyPrice
        );
        price.setRegularMonthlyPrice(regularMonthlyPrice);
        price.setSetupPrice(
                setupPrice
        );
        price.setActive(
                request.active() == null ||
                request.active()
        );
        price.setDisplayOrder(
                displayOrderForRegion(
                        region
                )
        );

        CatalogPlanPrice saved =
                catalogPlanPriceRepository
                        .save(
                                price
                        );

        if (
                "BR".equals(
                        region
                )
        ) {
            plan.setMonthlyPrice(
                    monthlyPrice
            );
            plan.setSetupPrice(
                    setupPrice
            );
            plan.setCurrency(
                    "BRL"
            );

            catalogPlanRepository.save(
                    plan
            );
        }

        return CatalogPlanPriceResponse.from(
                saved
        );
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
        List<CatalogPlanPriceResponse> regionalPrices =
                catalogPlanPriceRepository
                        .findByPlanIdOrderByDisplayOrderAscRegionCodeAsc(
                                plan.getId()
                        )
                        .stream()
                        .map(CatalogPlanPriceResponse::from)
                        .toList();

        return new CatalogPlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getSlug(),
                plan.getDescription(),
                plan.getMonthlyPrice(),
                plan.getSetupPrice(),
                plan.getCurrency(),
                plan.isActive(),
                plan.getDisplayOrder(),
                regionalPrices
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

    private void syncBrazilPrice(
            CatalogPlan plan
    ) {
        CatalogPlanPrice price =
                catalogPlanPriceRepository
                        .findByPlanIdAndRegionCodeIgnoreCase(
                                plan.getId(),
                                "BR"
                        )
                        .orElseGet(
                                CatalogPlanPrice::new
                        );

        price.setPlan(
                plan
        );
        price.setRegionCode(
                "BR"
        );
        price.setCurrency(
                "BRL"
        );
        price.setMonthlyPrice(
                plan.getMonthlyPrice()
        );
        price.setSetupPrice(
                plan.getSetupPrice() != null
                        ? plan.getSetupPrice()
                        : BigDecimal.ZERO
        );
        price.setActive(
                plan.isActive()
        );
        price.setDisplayOrder(
                0
        );

        catalogPlanPriceRepository.save(
                price
        );
    }

    private String normalizeRegion(
            String regionCode
    ) {
        if (
                regionCode == null ||
                regionCode.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Região é obrigatória."
            );
        }

        String region =
                regionCode
                        .trim()
                        .toUpperCase(
                                Locale.ROOT
                        );

        if (
                !List.of(
                        "BR",
                        "US",
                        "EU",
                        "GB",
                        "CA",
                        "AU"
                ).contains(
                        region
                )
        ) {
            throw new IllegalArgumentException(
                    "Região não suportada."
            );
        }

        return region;
    }

    private String currencyForRegion(
            String region
    ) {
        return switch (region) {
            case "BR" -> "BRL";
            case "US" -> "USD";
            case "EU" -> "EUR";
            case "GB" -> "GBP";
            case "CA" -> "CAD";
            case "AU" -> "AUD";
            default ->
                    throw new IllegalArgumentException(
                            "Região não suportada."
                    );
        };
    }

    private int displayOrderForRegion(
            String region
    ) {
        return switch (region) {
            case "BR" -> 0;
            case "US" -> 10;
            case "EU" -> 20;
            case "GB" -> 30;
            case "CA" -> 40;
            case "AU" -> 50;
            default -> 99;
        };
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