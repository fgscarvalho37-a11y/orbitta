package space.orbitta.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.orbitta.backend.dto.CatalogPlanPriceResponse;
import space.orbitta.backend.dto.CatalogPlanResponse;
import space.orbitta.backend.dto.CatalogProductResponse;
import space.orbitta.backend.entity.CatalogPlan;
import space.orbitta.backend.entity.CatalogPlanPrice;
import space.orbitta.backend.entity.CatalogProduct;
import space.orbitta.backend.repository.CatalogPlanPriceRepository;
import space.orbitta.backend.repository.CatalogPlanRepository;
import space.orbitta.backend.repository.CatalogProductRepository;

import java.util.List;

@Service
public class CatalogService {

    private final CatalogProductRepository catalogProductRepository;
    private final CatalogPlanRepository catalogPlanRepository;
    private final CatalogPlanPriceRepository catalogPlanPriceRepository;

    public CatalogService(
            CatalogProductRepository catalogProductRepository,
            CatalogPlanRepository catalogPlanRepository,
            CatalogPlanPriceRepository catalogPlanPriceRepository
    ) {
        this.catalogProductRepository = catalogProductRepository;
        this.catalogPlanRepository = catalogPlanRepository;
        this.catalogPlanPriceRepository = catalogPlanPriceRepository;
    }

    @Transactional(readOnly = true)
    public List<CatalogProductResponse> getActiveProducts(
            String regionCode
    ) {
        String market =
                normalizePublicMarket(
                        regionCode
                );

        return catalogProductRepository
                .findByActiveTrueOrderByDisplayOrderAscNameAsc()
                .stream()
                .map(product ->
                        toPublicProductResponse(
                                product,
                                market
                        )
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public CatalogProductResponse getActiveProductBySlug(
            String slug,
            String regionCode
    ) {
        CatalogProduct product = catalogProductRepository
                .findBySlug(slug)
                .filter(CatalogProduct::isActive)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Produto não encontrado ou indisponível."
                        )
                );

        return toPublicProductResponse(
                product,
                normalizePublicMarket(
                        regionCode
                )
        );
    }

    @Transactional(readOnly = true)
    public CatalogPlan getActivePlanEntity(Long planId) {
        CatalogPlan plan = catalogPlanRepository
                .findById(planId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Plano não encontrado."
                        )
                );

        if (!plan.isActive()) {
            throw new IllegalArgumentException(
                    "Este plano não está disponível para novas contratações."
            );
        }

        if (plan.getProduct() == null || !plan.getProduct().isActive()) {
            throw new IllegalArgumentException(
                    "Este produto não está disponível para novas contratações."
            );
        }

        return plan;
    }

    @Transactional(readOnly = true)
    public CatalogPlanPrice getActivePlanPriceEntity(
            Long planId,
            Long priceId
    ) {
        if (
                priceId == null
        ) {
            return null;
        }

        return catalogPlanPriceRepository
                .findByIdAndPlanIdAndActiveTrue(
                        priceId,
                        planId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Preço regional não encontrado ou indisponível."
                                )
                );
    }

    private CatalogProductResponse toPublicProductResponse(
            CatalogProduct product,
            String regionCode
    ) {
        List<CatalogPlanResponse> plans = catalogPlanRepository
                .findByProductIdAndActiveTrueOrderByDisplayOrderAscMonthlyPriceAsc(
                        product.getId()
                )
                .stream()
                .map(plan ->
                        toPlanResponse(
                                plan,
                                regionCode
                        )
                )
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
            CatalogPlan plan,
            String regionCode
    ) {
        List<CatalogPlanPriceResponse> regionalPrices =
                catalogPlanPriceRepository
                        .findByPlanIdAndActiveTrueOrderByDisplayOrderAscRegionCodeAsc(
                                plan.getId()
                        )
                        .stream()
                        .filter(price ->
                                price.getRegionCode()
                                        .equalsIgnoreCase(
                                                regionCode
                                        )
                        )
                        .map(
                                CatalogPlanPriceResponse::from
                        )
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

    private String normalizePublicMarket(
            String regionCode
    ) {

        if (
                regionCode != null &&
                "BR".equalsIgnoreCase(
                        regionCode.trim()
                )
        ) {
            return "BR";
        }

        return "US";
    }

}